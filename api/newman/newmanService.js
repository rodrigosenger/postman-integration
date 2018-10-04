const axios = require('axios');
const mysqlPersistence = require('./../persistence/mysql');
const GIT_KEY = require('../../GIT_KEY');
const moment = require('moment');
const newman = require('newman');
axios.defaults.headers.common['Private-Token'] = GIT_KEY;
const {getGitFile} = require('./../git/gitService');

const testFails = summary => {
    const fails = summary.run.stats.assertions.failed;

    return !!fails;
}

const getFailures = summary => {
    const newmanFailures = summary.run.failures;
    let failures = []
    newmanFailures.forEach(failure => {
        let {name, test, message, stack} = failure.error;
        failures.push({name, test, message, stack});
    })

    return failures;
}

const getTiming = summary => {
    const {started, completed} = summary.run.timings;
    const startedAt = moment(started).format('YYYY-MM-DD HH:mm:ss');
    const finishedAt = moment(completed).format('YYYY-MM-DD HH:mm:ss');

    return {startedAt, finishedAt};
}

const getCollectionName = summary => {
    return summary.collection.name;
}

const getCollectionId = summary => {
    return summary.collection.id;
}

const getCollectionAsserts = summary => {
    return summary.run.stats.assertions;
}

const treatSuccess = (summary, projectId) => {
    const assertions = {asserts: getCollectionAsserts(summary)};
    const timing = {timing: getTiming(summary)};
    const collectionName = {collectionName: getCollectionName(summary)};
    const status = {status: 'success'};
    const collectionId = {collectionId: getCollectionId(summary)};
    const project = {projectId};

    const response = Object.assign(collectionId, collectionName, status, project, timing, assertions);
    mysqlPersistence.insertPostmanResult(response);

    return response;
}

const treatError = (summary, projectId) => {
    const assertions = {asserts: getCollectionAsserts(summary)};
    const globalVars = {globals: summary.globals.values};
    const envVars = {environments: summary.environment.values};
    const timing = {timing: getTiming(summary)};
    const collectionName = {collectionName: getCollectionName(summary)};
    const failures = {failures: getFailures(summary)};
    const status = {status: 'error'};
    const collectionId = {collectionId: getCollectionId(summary)};
    const project = {projectId};

    const response = Object.assign(collectionId, collectionName, status, project, timing, assertions, failures, globalVars, envVars);
    mysqlPersistence.insertPostmanResult(response);

    return response;
}

const runNewman = (req, res) => {
    const projectName = req.body.projectName ? req.body.projectName : 'lasanha';
    Promise.all([getGitFile(req.body.gitCollectionPath), getGitFile(req.body.gitEnvironmentPath), mysqlPersistence.getProjectIdByName(projectName)])
        .then(response => {
            const collection = response[0].data;
            const environment = response[1].data;
            const projectId = response[2];

            newman.run({
                collection: collection,
                environment: environment
            }, (err, summary) => {

                if (err) {
                    res.status(500);
                } else if (testFails(summary)) {
                    res.status(200).send(treatError(summary, projectId));
                } else {
                    res.status(200).send(treatSuccess(summary, projectId));
                }
            });
        });
}

module.exports = {runNewman};
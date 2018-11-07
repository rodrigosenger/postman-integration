const axios = require('axios');
const connection = require('../../db.js');
const POSTMAN_API_KEY = require('../../POSTMAN_KEY');
const moment = require('moment');
const {getProjectIdByName} = require('./../persistence/mysql');
axios.defaults.headers.common['X-Api-Key'] = POSTMAN_API_KEY;

const monitorUidByName = (monitorName) => {
    return axios.get('https://api.getpostman.com/monitors').then(response => {
        return response.data.monitors.find(monitor => monitor.name === monitorName).uid;
    }).catch(error => {
        console.error(error)
    });
}

const runById = (monitorUid) => {
    return axios.post(`https://api.getpostman.com/monitors/${monitorUid}/run`).then(response => {
        return response.data;
    }).catch(error => {
        console.error(error);
    });
}

const run = (req, res) => {
    monitorUidByName(req.body.name).then(monitorUid => {
        getProjectIdByName(req.body.projectName).then(projectId => {
            runById(monitorUid).then(monitorResult => {

                const postman_result = {
                    collection_id: monitorResult.run.info.collectionUid,
                    collection_name: monitorResult.run.info.name,
                    status: monitorResult.run.info.status,
                    started: moment(monitorResult.run.info.startedAt).format('YYYY-MM-DD hh:mm:ss'),
                    finished: moment(monitorResult.run.info.finishedAt).format('YYYY-MM-DD hh:mm:ss'),
                    requests: monitorResult.run.stats.requests.total,
                    fails: monitorResult.run.stats.requests.failed,
                    project_id: projectId
                };
                const query = connection.query('INSERT INTO postman_result SET ?', postman_result, (error, results, fields) => {
                    if (error) throw error;
                });
                connection.end();
                res.status(201).send();
            }).catch(error => {
                res.status(500).send(error);
            })
        })
    });
}

module.exports = {run};
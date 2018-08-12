const axios = require('axios');
const connection = require('../../db.js');
const POSTMAN_API_KEY = require('../../POSTMAN_KEY');
axios.defaults.headers.common['X-Api-Key'] = POSTMAN_API_KEY;

const monitorUidByName = (monitorName) => {
    return axios.get('https://api.getpostman.com/monitors').then(response => {
        return response.data.monitors.find(monitor => monitor.name === monitorName).uid;
    });
}

const runById = (monitorUid) => {
    return axios.post(`https://api.getpostman.com/monitors/${monitorUid}/run`).then(response => {
        return response.data;
    });
}

const run = (req, res) => {
    monitorUidByName(req.body.name).then(monitorUid => {
        runById(monitorUid).then(monitorResult => {
            connection.connect()
            const postman_result = {
                collection_id: monitorResult.run.info.collectionUid,
                collection_name: monitorResult.run.info.name,
                status: monitorResult.run.info.status,
                started: monitorResult.run.info.startedAt,
                finished: monitorResult.run.info.finishedAt,
                requests: monitorResult.run.stats.requests.total,
                fails: monitorResult.run.stats.requests.failed
            };
            const query = connection.query('INSERT INTO postman_result SET ?', postman_result, (error, results, fields) => {
                if (error) throw error;
            });
            connection.end();
            res.status(201).send();
        }).catch(error => {
            res.status(500).send(error);
        })
    });
}

module.exports = {run};
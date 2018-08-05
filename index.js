const axios = require('axios');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(bodyParser.json());

const POSTMAN_API_KEY = '50e7086602084b2cb1c5692822fa110c';
axios.defaults.headers.common['X-Api-Key'] = POSTMAN_API_KEY;
const MLAB_URI = 'mongodb://senger:ws18012001@ds113122.mlab.com:13122/postman-integration';
mongoose.connect(MLAB_URI);
Schema = mongoose.Schema;

const monitorStatsSchema = new Schema({
    id: { type: String },
    name: { type: String },
    status: { type: String },
    startedAt: { type: Date },
    finishedAt: { type: Date },
    asserts: [],

});

const monitorStatsModel = mongoose.model('MonitorStats', monitorStatsSchema);

let monitorsUids = [];
let monitorStats;
let monitors = [];

app.post('/monitors/run', (req, res) => {
    const monitorName = req.body.name;
    let monitorUid;
    axios.get('https://api.getpostman.com/monitors')
    .then(response => {
        monitorUid = response.data.monitors.find(monitor => monitor.name === monitorName).uid;
        console.log(monitorUid);
        axios.post(`https://api.getpostman.com/monitors/${monitorUid}/run`)
        .then(response => {
            console.log(response.data.run.stats.requests);
            let assertsResults = [];
            assertsResults.push(response.data.run.stats.requests);
            console.log(assertsResults);
            monitorStats = new monitorStatsModel(
                {
                    id: response.data.run.info.collectionUid,
                    name: response.data.run.info.name,
                    status: response.data.run.info.status,
                    startedAt: response.data.run.info.startedAt,
                    finishedAt: response.data.run.info.finishedAt,
                    asserts: assertsResults,
                }
            );
            monitorStats.save((err, monitorStats) => {
                if(err) {
                    res.status(500).send();
                    return console.error(err);
                }
                res.status(201).send();
            });
        })
        .catch(error => {
            console.log(error);
            res.status(500).send();
            return console.error(err);    
        });
    })
    .catch(error => {
        res.status(500).send();
        return console.error(err);    
    });
});

app.post('/monitors', (req, res) => {
    axios.get('https://api.getpostman.com/monitors')
    .then(response => {
        monitorsUids = response.data.monitors.map(monitor => monitor.uid);
        monitorsUids.forEach(monitorUid => {
            axios.get(`https://api.getpostman.com/monitors/${monitorUid}`)
                .then(response => {
                    monitorStats = new monitorStatsModel(
                        {
                            id: response.data.monitor.id,
                            name: response.data.monitor.name,
                            status: response.data.monitor.lastRun.status,
                            startedAt: response.data.monitor.lastRun.startedAt,
                            finishedAt: response.data.monitor.lastRun.finishedAt,
                            asserts: response.data.monitor.lastRun.stats,
                        }
                    );
                    monitorStats.save((err, monitorStats) => {
                        if(err) {
                            res.status(500).send();
                            return console.error(err);
                        }
                        res.status(201).send();
                    });
                })
                .catch(error => {
                    console.log(error);
                });
        });
    })
    .catch(error => {
        console.log(error);
    });
});

app.listen(3000);
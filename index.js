const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const monitor = require('./api/monitors/monitorService');
const newmanService = require('./api/newman/newmanService');
app.use(bodyParser.json());

app.post('/monitors/run', monitor.run);

app.post('/newman/run', newmanService.runNewman);

app.listen(3000, function() {
    console.log('Server is running on port 3000');
    newmanService.runScheduleNewman();
});
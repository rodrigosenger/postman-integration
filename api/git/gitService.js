const axios = require('axios');
const connection = require('../../db.js');
const GIT_KEY = require('../../GIT_KEY');
axios.defaults.headers.common['Private-Token'] = GIT_KEY;

const getGitFile = uri => {
    return axios.get(uri);
}

module.exports = {getGitFile};
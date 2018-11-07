const axios = require('axios');

const teams = (url, asserts, fails) => {
    return axios.post(url, {
        text: `Critical path ran ${asserts} asserts with ${fails} fails.`
    }).then(response => {
        console.log(response);
    }).catch(err => {
        console.log(err);
    });
}

module.exports = {teams};
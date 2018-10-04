const connection = require('../../db.js');

const getProjectIdByName = (projectName) => {
    return new Promise((resolve, reject) => {
        let myProject;
        let projects = [];
        connection.query('SELECT * FROM projects', (error, results, fields) => {
            if (error) throw error;
            myProject = results.find(project => project.name === projectName);
            if(myProject) {
                resolve(myProject.id);
            } else {
                resolve();
            }
        });
    })
}

const insertPostmanResult = postmanResult => {
    const postman_result = {
        collection_id: postmanResult.collectionId,
        collection_name: postmanResult.collectionName,
        status: postmanResult.status,
        started: postmanResult.timing.startedAt,
        finished: postmanResult.timing.finishedAt,
        total_asserts: postmanResult.asserts.total,
        total_fails: postmanResult.asserts.failed,
        project_id: postmanResult.projectId
    };
    const query = connection.query('INSERT INTO postman_result SET ?', postman_result, (error, results, fields) => {
        if (error) throw error;
    });
}

module.exports = {getProjectIdByName, insertPostmanResult}
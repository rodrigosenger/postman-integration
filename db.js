const mysql = require('mysql');

module.exports = mysql.createConnection({
    host: '10.13.10.7',
    user: 'bitnami',
    password: 'd5f3356b38',
    database: 'bitnami_redmine_nova'
});

// create table postman_result (
// 	id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
// 	collection_name varchar(255),
// 	collection_id varchar(80),
// 	status varchar(80),
// 	started timestamp,
// 	finished timestamp NULL DEFAULT NULL,
// 	requests integer,
// 	fails integer
// );

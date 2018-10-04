const mysql = require('mysql');

module.exports = mysql.createPool({
    host: '<HOST_URI>',
    user: '<DB_USER>',
    password: '<DB_PASSWORD>',
    database: '<DB_NAME>'
});

// create table postman_result (
// 	id INT(6) UNSIGNED AUTO_INCREMENT PRIMARY KEY,
// 	collection_name varchar(255),
// 	collection_id varchar(80),
// 	status varchar(80),
// 	started timestamp,
// 	finished timestamp NULL DEFAULT NULL,
// 	total_asserts integer,
// 	total_fails integer
// );

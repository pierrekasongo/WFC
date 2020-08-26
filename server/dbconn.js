const mysql = require('mysql');
require('custom-env').env(true);

const connection = mysql.createConnection({
    host: process.env.MYSQL_HOST,
    //port:3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PWD,
    database: process.env.DB_NAME,
    multipleStatements:true
    
});
connection.connect(function(err) {
    if (err) console.log("Local database error: ",err);
    else
        console.log('You are now connected to the local db')
});

module.exports = connection;

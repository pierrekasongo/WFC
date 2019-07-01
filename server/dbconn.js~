const mysql = require('mysql');


const connection = mysql.createConnection({
    host: "localhost",
    //port:3306,
    user: "root",
    password: "",
    database: "workforce_pressure",
    multipleStatements:true
    
});
connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected...')
});


//let conn = mysql.connect(connection);
//let conn=connection;

module.exports = connection;

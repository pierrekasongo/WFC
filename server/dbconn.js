const mysql = require('mysql');


const connection = mysql.createConnection({
    host: "localhost",
    //port:3306,
    user: "wpc_user",
    password: "12345",
    database: "workforce_pressure",
    multipleStatements:true
    
});
connection.connect(function(err) {
    if (err) console.log("Local database error: ",error);
    console.log('You are now connected to the local db')
});


//let conn = mysql.connect(connection);
//let conn=connection;

module.exports = connection;

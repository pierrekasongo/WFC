const mysql = require('mysql');
const config = require('./routes/configuration.js');

let getConnection = async function(countryId){

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let db = params.db;

    const connection = mysql.createConnection({
        host: ihris_url,
        user: user_name,
        password: password,
        database: db,
        multipleStatements:true
        
    });
    connection.connect(function(err) {
        if (err) throw err
        console.log('You are now connected to iHRIS')
    });

    return connection;
}

/*const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "capuccino@",
    database: "ihrismanagesitedemo",
    multipleStatements:true
    
});
connection.connect(function(err) {
    if (err) throw err
    console.log('You are now connected to iHRIS')
});*/

module.exports = {
    connect : getConnection
};

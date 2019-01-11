const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// start db
const db=require('./dbconn');

// import our routes
const user = require('./routes/user');
const admin = require('./routes/admin');
const dhis2=require('./routes/dhis2');
const ihris=require('./routes/ihris');
const configuration=require('./routes/configuration');
const auth=require('./routes/auth');
// create app server
let app = express();

// middleware to parse request info into JSON
app.use(bodyParser.urlencoded({ extended: false })); // application/x-www-form-urlencoded
app.use(bodyParser.json()); // application/json

// serve static files in public folder
app.use(express.static(path.join(__dirname, "../", "public")));

// use our routes http://localhost:3000/api/user
app.use('/api/user', user);
app.use('/api/admin', admin);
app.use('/api/dhis2/',dhis2);
app.use('/api/ihris', ihris);
app.use('/api/configuration',configuration);
app.use('/api/auth',auth);
// instead of 404, redirect to index page
app.use('*', (req, res) => {
    res.sendFile(path.join(__dirname, "../", "public", "index.html"));
})

// start listening for requests
app.listen(3000, () => {
    console.log("Listening on port 3000");
});

const express = require('express');
const db = require('../dbconn');

let router = express.Router();

<<<<<<< HEAD
const withAuth = require('./auth')

let countryId = 52;
=======
const withAuth = require('../middleware/is-auth');

>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

router.patch('/config',withAuth, (req, res) => {

    let id = parseInt(req.body.id.toString());

    let value = req.body.value.toString();

    db.query(`UPDATE config SET value ="${value}" WHERE id =${id}`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/roles',withAuth, (req, res) => {

    db.query(`SELECT * FROM user_roles`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/configs/:countryId',withAuth, function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT id, parameter, value FROM  config WHERE country_id =` + countryId,
        function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

router.get('/time_units',withAuth, function (req, res) {

    db.query(`SELECT * FROM time_unit`,function (error, results, fields) {
            if (error) throw error;
            res.json(results);
    });
});

router.get('/getCountryHolidays/:countryId',withAuth,function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT id, parameter, value FROM  config WHERE 
               parameter="COUNTRY_PUBLIC_HOLIDAYS" AND country_id =`+ countryId,
        function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});
router.get('/countries/:id',withAuth, function(req, res){

    let id=req.params.id; 

    db.query(`SELECT * FROM  country WHERE id=${id}`,function(error,results,fields){
        if(error) throw error;
        res.json(results);
    });
});
router.patch('/editCountry', (req, res) => {

    let id=req.body.id;

    let code = req.body.code;

    let value = req.body.value;

    let param=req.body.param;

    let sql="";

    if(param.includes("holidays")){

        sql=`UPDATE country SET ${param} =${value} WHERE id =${id}`;
    }else{
        sql=`UPDATE country SET ${param} ="${value}" WHERE id =${id}`;
    }

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});


router.delete('/deleteCountry/:id',withAuth, function(req, res){

    let id=req.params.id; 

    db.query(`DELETE FROM  users WHERE countryId=${id};DELETE FROM  country WHERE id=${id};`,function(error,results,fields){
        if(error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.delete('/deleteTreatment/:code',withAuth, function(req, res){

    let code=req.params.code; 

    db.query(`DELETE FROM  std_treatment WHERE code="${code}"`,function(error,results,fields){
        if(error) throw error;
        res.status(200).send("Deleted successfully");
    });
});



router.post('/insertCountry',withAuth, (req, res) => {

    let code = req.body.code;

    let name_fr = req.body.name_fr;

    let name_en=req.body.name_en;

    db.query(`INSERT INTO country(code,name_fr,name_en) VALUES("${code}","${name_fr}","${name_en}")`, 
        function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});
let ihrisCredentials = async function (countryId) {

    let sql = `SELECT id, parameter, value FROM  config WHERE parameter 
                = "URL_iHRIS" AND country_id =${countryId}`;

    let results = await new Promise((resolve, reject) => db.query(sql, function (error, results) {
        if (error) {
            reject(error)
        } else {
            resolve(results);
        }
    }));
    let res = await makeObject(results);

    return res;
}

let dhis2Credentials = async function (countryId) {

    let sql = `SELECT id, parameter, value FROM  config WHERE parameter 
                IN("URL_DHIS2","DHIS2_USER","DHIS_PWD","DHIS2_SQLVIEW") AND country_id =${countryId}`;

    let results = await new Promise((resolve, reject) => db.query(sql, function (error, results) {
        if (error) {
            reject(error)
        } else {
            resolve(results);
        }
    }));
    let res = await makeObject(results);

    return res;
}

let makeObject = async (results) => {

    let cred = {};
    let url = "";
    let user = "";
    let pwd = "";
    let sqlview = "";
    let db = "";

    results.forEach(p => {
        
        let prm = p.parameter;
        let value = p.value;

        if (prm.includes("URL")) {
            url = value;
        } else if (prm.includes("USER")) {
            user = value;
        } else if(prm.includes("DB")){
            db = value;
        }else if(prm.includes("DHIS2_SQLVIEW")){
            sqlview = value;
        }
        else {
            pwd = value;
        }
        cred = {
            url: url,
            user: user,
            pwd: pwd,
            db : db,
            sqlview: sqlview
        };
    });
    return cred; 
}

router.get('/getYears',withAuth, (req, res) => {
    db.query('SELECT id,year FROM years', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/getLanguages', withAuth, (req,res) => {
    db.query('SELECT * FROM system_languages', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

module.exports = {
   // ihrisCredentials:ihrisCredentials,
    //dhis2Credentials: dhis2Credentials,
    router: router
}


//module.exports = router;
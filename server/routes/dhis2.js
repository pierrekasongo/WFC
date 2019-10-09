const sql = require('mysql');
const db = require('../dbconn');
var bodyParser = require("body-parser");
const fileUpload = require('express-fileupload');
const path = require('path');

const csv = require('csv');

let router = require('express').Router();
let tryparse = require('tryparse');

let config = require('./configuration.js');

const withAuth = require('../middleware/is-auth');

global.sum = 0;


router.use(fileUpload(/*limits: { fileSize: 50 * 1024 * 1024 },*/));

//var request=require('request');

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
router.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    next();
}).options('*', function (req, res, next) {
    res.end();
});

router.get('/facilityTypes',withAuth, (req, res) => {

    let sql = `SELECT * FROM std_facility_type`;

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

// get list of facilities
router.get('/facilities/:countryId',withAuth,(req, res) => {

    let countryId = req.params.countryId;

    let sql = `SELECT f.id as id, f.code as code, f.ihrisCode as ihrisCode, f.name as name,
                f.parentName as parentName, f.facilityType as faTypeCode, CONCAT(ft.name_en,'/',ft.name_fr) as faTypeName 
                 FROM facility f LEFT JOIN  std_facility_type ft ON f.facilityType = ft.code 
                 WHERE countryId =${countryId};`;

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

let getDataSets = async function (countryId,selectedCadre) {

    let sql= `SELECT dhis2_code as code, dhis2_dataset as dataset FROM country_treatment_dhis2 
                WHERE treatment_code IN (SELECT std_code FROM country_treatment WHERE 
                cadre_code="${selectedCadre}" AND countryId=${countryId})`;

    let results = await new Promise((resolve, reject) => db.query(sql,function (error, results) {
        if(error){
            reject(error)
        }else{
            resolve(results);
        }   
    }));
    return results;
}

let getTreatments = async function (countryId,selectedCadre) {

    let sql =`SELECT dhis2_code as code, treatment_code,share FROM country_treatment_dhis2
                WHERE treatment_code IN (SELECT std_code FROM country_treatment WHERE 
                cadre_code="${selectedCadre}" AND countryId=${countryId})`;
    
    let results = await new Promise((resolve, reject) => db.query(sql,function (error, results) {
                    if(error){
                        reject(error)
                    }else{
                        resolve(results);
                    }   
        }));
        return results;
}

router.get('/ping/:countryId',withAuth,async function(req,res){

    let countryId = req.params.countryId;

    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let req_url='system/ping';

    requestTest(dhis2_url+"/api/"+req_url, user_name, password, function (body) {

        if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {

            res.send("FAILED");

        }

        res.send(body);
    }, function (err) {
        console.log("ERROR ",err);
    });
})


router.post('/import_statistics_from_dhis2',withAuth,async function (req, res) {

    let countryId = req.body.countryId;

    let year = req.body.selectedPeriod;

    let selectedFacilities = req.body.selectedFacilities;

    let facilityIds=[];

    selectedFacilities.forEach(fa =>{

        let cd = fa.code.split('|');

        facilityIds.push(cd[1]);
    })

    let selectedCadre = req.body.selectedCadreLeft;

    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let dhis2_sqlView = params.sqlview;

    let treatments = await getTreatments(countryId,selectedCadre);

    let deArray = [];

    let treatmentShares = [];

    treatments.forEach(row => {

        let de = row['code'];

        let share  = row['share'];

        let treatCode = row['treatment_code'];

        if(!deArray.includes(de)){

            deArray.push(de);

            treatmentShares[de]={
                share:share,
                treatment_code:treatCode
            }
        }
    });



    let startDate=`${year}-01-01`;

    let endDate=`${year}-12-31`;
 
    let mapData = new Map();

    let req_url=`sqlViews/${dhis2_sqlView}/data.json?filter=orgunit_uuid:in:[${facilityIds}]&filter=de_uid:in:[${deArray}]&var=start:${startDate}&var=end:${endDate}`;


    requestTest(dhis2_url+"/api/"+req_url, user_name, password, function (body) {

        if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {

            res.send("FAILED");

        } else {

            let data = JSON.parse(body);

            let fa_codes = [];

            facilityIds.forEach(id =>{

                fa_codes.push(`"${id}"`);
            });

            let sql=`DELETE FROM activity_stats WHERE year="${year}" AND facilityCode 
                        IN(${fa_codes}) AND cadreCode ="${selectedCadre}";`;

            data.rows.forEach(d => {

                let de = d[0];
                let ou = d[2];
                let value = parseInt(d[7]);

                let key = de+'_'+ou;

                let old_value = mapData.get(key);

                if(old_value >= 0){

                    let new_value = old_value + value;

                    mapData.set(key,new_value);

                }else{
                    mapData.set(key,value);
                }
            })

            for (var [k, v] of mapData) {

                let keys = k.split("_");

                let _de = keys[0];

                let _ou = keys[1];

                let _v = 0;

                let code = treatmentShares[_de].treatment_code;

                let share = treatmentShares[_de].share;

                _v = v * (share/100);

                sql+=`INSERT INTO activity_stats(facilityCode,treatmentCode,year,dhis2Code,cadreCode,caseCount) 
                            VALUES("${_ou}","${code}","${year}","${_de}","${selectedCadre}",${_v});`;
            }
            db.query(sql,function(error,result){
                if(error)throw error;    
            });
        }

    }, function (err) {
        console.log(err);
        //res.send("ERROR");
    });
    res.status(200);
});



router.get('/count_facilities/:countryId',withAuth,(req, res) => {

    let countryId = req.params.countryId;

    let sql = `SELECT COUNT(id) AS nb FROM facility WHERE countryId =${countryId};`;

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/insert_facilities',withAuth, (req,res) => {

    let sql=``;

    let countryId = req.body.countryId;

    let selectedFacilities = req.body.selectedFacilities;

    selectedFacilities.forEach(fac => {
        sql+=`INSERT INTO facility(countryId,code,name,parentName) 
                VALUES(${countryId},"${fac.id}","${fac.name}","${fac.parent}");`;
    });
    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
})

router.post('/upload/:type/:countryId',withAuth, function (req, res) {

    if (!req.files)
        return res.status(400).send('No file was uploaded');

    let upload_dir = process.env.FILE_UPLOAD_DIR;
    //The name of the input field
    let file = req.files.file;

    let countryId = req.params.countryId;

    //let filename=file.name;

    let type = req.params.type;

    let filename = (type == 'FAC') ? `${countryId}_facilities.csv` : `${countryId}_services.csv`;

    //Use the mv() method to place the file somewhere on the server
    file.mv(`${path.sep}${upload_dir}${path.sep}${filename}`, function (err) {
        if (err)
            return res.status(500).send(err);
        res.status(200).send('File uploaded successfully');
        //return res.status(200).send('File uploaded successfully');
    });

    let sql = "";

    if (type == 'FAC') {

        var obj = csv();

        obj.from.path(`${path.sep}${upload_dir}${path.sep}${filename}`).to.array(function (data) {

            for (var index = 1; index < data.length; index++) {

                let parentCode = data[index][0];

                let parentName = data[index][1];

                let facilityCode = data[index][2]; 

                let facilityName = data[index][3];

                sql += `DELETE FROM facility WHERE code ="${facilityCode}" AND countryId=${countryId};`;
                    sql += `INSERT INTO facility (countryId,code,name,parentCode,parentName) 
                            VALUES(${countryId},"${facilityCode}","${facilityName}","${parentCode}","${parentName}");`;
            }
           
            db.query(sql, function (error, results) {
                if (error) throw error;
                res.status(200);
            });

        });
    } else {//Service data
        var obj = csv();

        obj.from.path(`${__dirname}` + path.sep + 'uploads' + path.sep + 'dhis2' + path.sep + `${filename}`).to.array(
            function (data) {

                sql = `TRUNCATE activity_stats;`;

                for (var index = 1; index < data.length; index++) {

                    let facilityId = data[index][0];

                    let year = data[index][1];

                    let activityId = data[index][2];

                    let caseCount = data[index][3];

                    sql += `INSERT INTO activity_stats (facilityId,quarter,year,activityId,caseCount) VALUES("`
                        + facilityId + `","1","` + year + `",` + activityId + `,` + caseCount + `);`

                }
                db.query(sql, function (error, results) {
                    if (error) throw error;
                    res.status(200);
                })
            });
    }
})

router.post('/match_facility_iHRIS', withAuth,function (req, res) {

    let code = req.body.facilityCode;

    let ihrisCode = req.body.ihrisCode;
 
    db.query(`UPDATE facility SET ihrisCode="${ihrisCode}" WHERE code="${code}"`, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/match_facility_self', withAuth,function (req, res) {

    let facilities = req.body.facilities;

    let sql=``;

    facilities.map(fa => {

        sql+=`UPDATE facility SET ihrisCode="${fa.code}" WHERE code="${fa.code}";`;
    });

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});


router.post('/setFacility_type',withAuth, function (req, res) {

    let facilityCode = req.body.facilityCode;

    let facilityType = req.body.facilityType;
 
    db.query(`UPDATE facility SET facilityType="${facilityType}" WHERE code="${facilityCode}"`,function (error, results, fields) {
            if (error) throw error;
            res.json(results);
    });
});


router.delete('/deleteFacility/:id',withAuth,function (req, res) {

    let id = req.params.id;

    db.query(`DELETE FROM  facility WHERE id=${id}`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.get(`/import_facilities_from_dhis2/:countryId`,withAuth, async function (req, res) {

    let countryId = req.params.countryId;

    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    var resource = "organisationUnits.json?fields=id,name,level,parent[name]&paging=false";

    url = dhis2_url + "/api/" + resource;

    let facilities=[];

    requestTest(url, user_name, password, function (body) {

        if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {
            res.send("FAILED");
        } else {
            var data = JSON.parse(body);

            data.organisationUnits.forEach(row =>{

                let prt = row.parent;

                let parent ="";

                if(prt)
                    parent=prt.name;

                facilities.push({
                    id:row.id,
                    level:row.level,
                    name:row.name,
                    parent:parent
                })

            });
            res.json(facilities);
        }
    }, function (err) {
        res.status(500).send(err);
    });
});

router.delete('/deleteDhis2Code/:id',withAuth,function (req, res) {

    let id = req.params.id;

    db.query(`DELETE FROM  country_treatment_dhis2 WHERE id="${id}"`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.patch('/updateDhis2CodeShare',withAuth,function (req, res) {

    let id = req.body.id;

    let share=parseInt(req.body.value.toString());

    db.query(`UPDATE country_treatment_dhis2 SET share=${share} WHERE id=${id}`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Share updated successfully!");
    });
});

router.get(`/getDhis2_treatments/:countryId`,withAuth, async function (req, res) {

    let countryId = req.params.countryId;

    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    var resource = "dataElements.json?fields=id,displayName,dataSetElements&paging=false";

    let url = dhis2_url + "/api/" + resource;

    let dataElement = [];

    requestTest(url, user_name, password, function (body) {

        if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {
            console.log("FAILED");
            res.send("FAILED");
        } else {
            var data = JSON.parse(body);

            data.dataElements.forEach(row =>{

                dataElement.push({
                    code:row.id,
                    name:row.displayName
                })
            });
            res.json(dataElement);
        }
    }, function (err) {
        
        res.status(500).send(err);
    });

});

router.post('/import/:sql',withAuth, (req, res) => {

    var sql = req.params.sql.toString();

    db.query(sql, function (error, results) {
        if (error) throw error;

        res.json(results);

    });
});

function importdata(query, results, next) {

    const db = require('../dbconn')
    //var sql=req.params.sql.toString();
    db.query(query, function (error, results) {
        if (error) throw error;

        res.json(results);

    });
}

function requestTest(api_url, user_name, password, success, error) {

    var request = require('request');
    var progress = require('request-progress');

    var username = user_name;
    var password = password;
    var options = {
        url: api_url,
        auth: {
            user: username,
            password: password
        }
    };

    progress(request(options, function (err, res, body) {
        
        if (err) {
            error(err);
            return;
        }
        success(body);
        return;
    })).on('progress',function(state){

        console.log(state);
    }).on('end', function () {
        console.log("End");
    })
}

let getFacilityByihrisCode = async function (hris_code) {

    let sql = `SELECT * FROM  facility WHERE ihrisCode ="${hris_code}"`;

    let results = await new Promise((resolve, reject) => db.query(sql, function (error, results) {
        if (error) {
            reject(error)
        } else {
            resolve(results);
        }
    }));

    let facility = {
        code : results[0].code,
        name : results[0].parentName+'/'+results[0].name
    }

    return facility;
}
module.exports = {
    router: router,
    getFacilityByihrisCode: getFacilityByihrisCode
}
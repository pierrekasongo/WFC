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

    let sql =`SELECT dhis2_code as code, treatment_code FROM country_treatment_dhis2 
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

router.post('/import_statistics',withAuth,async function (req, res) {

    let countryId = req.body.countryId;

    let year = req.body.selectedPeriod;

    let selectedFacilities = req.body.selectedFacilities;

    let facilityIds=[];

    selectedFacilities.forEach(fa =>{

        facilityIds.push(fa.code);
    })

    let selectedCadre = req.body.selectedCadreLeft;

    let sql = "";


    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let dataValues =[];

    let dataSets = await getDataSets(countryId,selectedCadre);

    let treatments = await getTreatments(countryId,selectedCadre);

    let deArray =[];

    treatments.forEach(row => {

        let de = row['code'];

        if(!deArray.includes(de)){
            deArray.push(de);
        }
    });

    let dsArray= [];

    dataSets.forEach(row => {

        let ds = row['dataset'];

        if(!dsArray.includes(ds)){
            dsArray.push(ds);
        }
    });

    let dataSetString = dsArray.join("&dataSet=");

    let orgUnitString = facilityIds.join("&orgUnit=");

    let startDate=`${year}-01-01`;

    let endDate=`${year}-07-31`;

    let req_url = `dataValueSets.json?dataSet=${dataSetString}&startDate=${startDate}&endDate=${endDate}&orgUnit=${orgUnitString}`;

    requestTest(dhis2_url+"/api/"+req_url, user_name, password, function (body) {

        if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {

            res.send("FAILED");

        } else {

            var data = JSON.parse(body);

            let sql=`DELETE FROM activity_stats WHERE year="${year}" AND facilityCode ="${facilityIds}" AND cadreCode ="${selectedCadre}";`;

            data.dataValues.forEach(d =>{

                if(deArray.includes(d.dataElement)){

                    console.log(d.dataElement);

                    sql+=`INSERT INTO activity_stats(facilityCode,year,activityCode,cadreCode,caseCount) 
                            VALUES("${d.orgUnit}","${year}","${d.dataElement}","${selectedCadre}",${d.value});`;
                    
                    db.query(sql,function(error,result){
                            if(error)throw error;
                            //res.status(200);     
                    });
                }
                
            })
        }

    }, function (err) {
        console.log(err);
        //res.send("ERROR");
    });
    res.status(200);
});

router.post('/import_statistics_from_dhis2',withAuth,async function (req, res) {

    let countryId = req.body.countryId;

    let year = req.body.selectedPeriod;

    let selectedFacilities = req.body.selectedFacilities;

    let facilityIds=[];

    selectedFacilities.forEach(fa =>{

        facilityIds.push(`'`+fa.code+`'`);
    })

    let selectedCadre = req.body.selectedCadreLeft;

    let sql = "";

    let months = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];

    let params = await config.dhis2Credentials(countryId);

    let dhis2_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    db.query(`SELECT dhis2_code as code, treatment_code, dhis2_dataset as dataset FROM country_treatment_dhis2 
                WHERE treatment_code IN (SELECT std_code FROM country_treatment WHERE 
                cadre_code="${selectedCadre}" AND countryId=${countryId})`,function (error, results, fields) {
            if (error) throw error;

            sql = `DELETE FROM activity_stats WHERE facilityCode IN(${facilityIds}) AND year="${year}"  
                AND cadreCode="${selectedCadre}";`;

            results.forEach(row => {

                let de = row['code'];

                let dataset = row['dataset'];

                let treatment_code = row['treatment_code'];

                let i = 0;

                sum = 0;

                selectedFacilities.forEach(fa =>{

                    let facilityCode = fa.code;

                    for (i = 0; i < months.length; i++) {

                                let period = year + months[i];

                                let count = i;

                                let req_url = "dataValues?dataSet=" + dataset + "&de=" + de + "&pe=" + period + "&ou=" + facilityCode;

                                //console.log(dhis2_url+"/api/"+req_url);

                                requestTest(dhis2_url+"/api/"+req_url, user_name, password, function (body) {

                                    if (body.indexOf("HTTP Status 401 - Bad credentials") > -1) {

                                        res.send("FAILED");

                                    } else {

                                        var data = JSON.parse(body);

                                        sum += tryparse.int(data);

                                        if(count === 11){

                                            sql+= `INSERT INTO activity_stats (facilityCode,year,activityCode,cadreCode,caseCount) 
                                                    VALUES("${facilityCode}","${year}","${treatment_code}","${selectedCadre}",${sum});`;
                                            
                                           db.query(sql,function(error,result){
                                                if(error)throw error;
                                                res.status(200);
                                                
                                            })
                                        }
                                    }

                                }, function (err) {
                                    //console.log(err);
                                    //res.send("ERROR");
                                });
                                //console.log("SOMME " + sum);
                    }
                })

            });
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

router.post('/upload',withAuth, function (req, res) {

    if (!req.files)
        return res.status(400).send('No file was uploaded');
    //The name of the input field
    let file = req.files.file;

    //let filename=file.name;

    let type = req.body.type;

    let filename = (type == 'FAC') ? 'facilities.csv' : 'services.csv';

    //Use the mv() method to place the file somewhere on the server
    file.mv(`${__dirname}` + path.sep + 'uploads' + path.sep + 'dhis2' + path.sep + `${filename}`, function (err) {
        if (err)
            return res.status(500).send(err);
        res.status(200).send('File uploaded successfully');
        //return res.status(200).send('File uploaded successfully');
    });

    let sql = "";

    let regionsMap = new Map();
    let districtsMap = new Map();
    let facilitiesMap = new Map();

    let regions = [];
    let districts = [];
    let facilities = [];

    if (type == 'FAC') {

        var obj = csv();

        obj.from.path(`${__dirname}` + path.sep + 'uploads' + path.sep + 'dhis2' + path.sep + `${filename}`).to.array(function (data) {
            /*for (var index = 0; index < data.length; index++) {
                facilities.push(new facility(data[index][0], data[index][1], data[index][2], data[index][3], data[index][4]));
            }*/
            //sql = `TRUNCATE region; TRUNCATE district;TRUNCATE facility;`;
            sql = `DELETE FROM facility WHERE districtCode IN (SELECT code FROM district WHERE regionCode IN(SELECT code FROM region WHERE countryId =` + countryId + `) );`;

            let countryId = 52;

            for (var index = 1; index < data.length; index++) {

                let regionCode = data[index][0];

                let regionName = data[index][1];

                let districtCode = data[index][2];

                let districtName = data[index][3];

                let facilityCode = data[index][4];

                let facilityName = data[index][5];

                if (!regionsMap.has(regionCode)) {

                    regionsMap.set(regionCode, regionName);
                    regions.push({
                        code: regionCode,
                        name: regionName,
                        country: countryId
                    });
                    sql += `INSERT INTO region (code,countryCode,name) VALUES("` + regionCode + `","` + countryId + `","` + regionName + `");`;
                }

                if (!districtsMap.has(districtCode)) {
                    districtsMap.set(districtCode, districtName);
                    districts.push({
                        code: districtCode,
                        name: districtName,
                        region: regionCode
                    });
                    sql += `INSERT INTO district (code,regionCode,name) VALUES("` + districtCode + `","` + regionCode + `","` + districtName + `");`;
                }
                if (!facilitiesMap.has(facilityCode)) {
                    facilitiesMap.set(facilityCode, facilityName);
                    facilities.push({
                        code: facilityCode,
                        name: facilityName,
                        district: districtCode
                    });
                    sql += `INSERT INTO facility (code,districtCode,name) VALUES("` + facilityCode + `","` + districtCode + `","` + facilityName + `");`;
                }

                //sql += `INSERT INTO facilities (id,countryId,regionName,districtName,facilityCode,facilityName) VALUES(`
                //+ `,` + id + countryId + `,"` + region + `","` + district + `","` + facility_code + `","` + facility_name + `");`
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

router.post('/match_facility', withAuth,function (req, res) {

    let code = req.body.facilityCode;

    let ihrisCode = req.body.ihrisCode;
 
    db.query(`UPDATE facility SET ihrisCode="${ihrisCode}" WHERE code="${code}"`, function (error, results, fields) {
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

                let dataset = row.dataSetElements;

                let datasetId="";

                if(dataset){

                    dataset.forEach(obj =>{
                        let ds = obj.dataSet;
                        datasetId = ds.id
                    });
                }

                dataElement.push({
                    code:row.id,
                    name:row.displayName,
                    dataset:datasetId
                })
            });
            res.json(dataElement);
        }
    }, function (err) {
        
        res.status(500).send(err);
    });

});

function makeSum(value) {

    global.sum += value;
    return global.sum;
}


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
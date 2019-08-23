const sql = require('mysql');
const db = require('../dbconn');
const dbiHRIS = require('../dbconn_ihris');
const fileUpload = require('express-fileupload');
const path = require('path');
const csv = require('csv');
const request = require('request');
const mkfhir = require("fhir.js");


let config = require('./configuration.js');

let countryCadre = require('./country_cadres.js');

let dhis2 = require('./dhis2.js');

let router = require('express').Router();

const withAuth = require('../middleware/is-auth');

const calculationRoute = require('./pressure_calculation');

router.use(fileUpload(/*limits: { fileSize: 50 * 1024 * 1024 },*/));

let getParent = async (url) => {

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let fhirClient = mkfhir({
        baseUrl: ihris_url,
        auth: { user: user_name, pass: password }
    });

    fhirClient
        .search({ type: `${url}?_format=json` })
        .then(function (res) {

            let bundle = res.data.entry;

            console.log(bundle);

            return bundle;

        }).catch(function (res) {
            if (res.status) {
                console.log('Error', res.status);
            }
            if (res.message) {
                console.log('Error', res.message);
            }
        })
}

let makeInsertSql = async (results) => {

    let staffs = [];

    let sql = ``;

    for(const r of results){

        let cadre = await countryCadre.getCadreByihrisCode(r.cadre);
    
        let facility = await dhis2.getFacilityByihrisCode(r.facility);

        let staffCount = r.count;

        sql+= `DELETE FROM staff WHERE facilityCode="${facility.code}" AND cadreCode="${cadre.code}";`

        sql+= `INSERT INTO staff (facilityCode, cadreCode,staffCount) 
                VALUES("${facility.code}", "${cadre.code}", ${staffCount});`;

        /*staffs.push({
            cadreCode : cadre.code,
            cadre : cadre.name,
            facilityCode : facility.code,
            facility : facility.name,
            staffCount : staffCount
        });*/
    }
    return sql;
}

router.post('/match_cadre', withAuth, function (req, res) {

    let code = req.body.stdCode;

    let ihrisCode = req.body.ihrisCode;
 
    db.query(`UPDATE country_cadre SET hris_code="${ihrisCode}" WHERE std_code="${code}"`, 
    function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/getiHRIS_cadres/:countryId',withAuth,async function(req,res){

    /*let countryId = req.params.countryId;

    let cn = await dbiHRIS.connect(countryId);
    
    cn.query(`SELECT * FROM hippo_cadre`, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });*/

    let countryId = req.params.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    request(`${ihris_url}index.php?action=cadres`, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            res.send(response.body);
        }
    });
    
})


router.post('/getiHRIS_staffs',withAuth,async function(req,res){

    /*let countryId = req.body.countryId;

    let facilities = req.body.facilities;

    let cadres = req.body.cadres;

    let cn = await dbiHRIS.connect(countryId);

    let sql = `SELECT COUNT(pers_pos.id) AS count,jb.cadre, pos.facility  FROM hippo_person_position pers_pos, 
                hippo_position pos, hippo_job jb WHERE pers_pos.position=pos.id AND 
                pos.job=jb.id AND pos.status="position_status|closed" 
                AND jb.cadre IN(?) AND pos.facility IN(?) GROUP BY (jb.cadre)`;
    
    let results = await new Promise((resolve, reject) => cn.query(sql,[cadres,facilities], 
        function (error, results, fields) {

        if (error) {
            reject(error)
        } else {

            resolve(results);
        }
    }));
    let request = await makeInsertSql(results);

    if(request.length > 0){
        
        db.query(request, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
    }*/
    let facilities = "";
    let cadres = "";
    let selectedFacilities = req.body.facilities;

    let selectedCadres = req.body.cadres;

    let count = 0;

    selectedFacilities.forEach(fa =>{

        count++;
        
        let codes = fa.split('-');

        facilities+=codes[0];

        if(count < selectedFacilities.length){
            facilities+='--';
        }
    });

    count = 0;

    selectedCadres.forEach(ca =>{

        count++;

        let codes = ca.split('-');

        cadres+=codes[0];

        if(count < selectedCadres.length){
            cadres+='--';
        }
    });

    let countryId = req.body.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    request(`${ihris_url}index.php?action=staffs&facilities="${facilities}"&cadres="${cadres}"`, 
        function (error, response, body) {

        if (!error && response.statusCode == 200) {

            console.log(response);

            return;

            //res.send(response.body);
        }
    });
})

router.get('/getiHRIS_facilities/:countryId',withAuth,async  function (req, res) {

    let countryId = req.params.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    request(`${ihris_url}index.php?action=facilities`, function (error, response, body) {

        if (!error && response.statusCode == 200) {
            res.send(response.body);
        }
    });
})

router.get('/getiHRIS_facilities_FHIR/:countryId',withAuth, async function (req, res) {

    //url = http://localhost/iHRIS/ihris-manage-site-demo/FHIR
    //user=i2ce_admin
    //pwd = ...

    let countryId = req.params.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let fhirClient=mkfhir({
        baseUrl:ihris_url,
        auth:{user:user_name, pass:password}
    });

    let facilities = await fhirClient
        .search({type:'Location/_history?_format=json'})
        .then(function(res){

            let bundle = res.data.entry;

            let facilities=[];

            bundle.forEach(bdl => {

                let fac = bdl.resource;

                facilities.push({
                    code:fac.identifier[0].value,
                    prefix:fac.physicalType.coding[0].code,
                    name:fac.name,                   
                });
            })
            return facilities;

        }).catch(function(res){
            if(res.status){
                console.log('Error',res.status);
            }
            if(res.message){
                console.log('Error',res.message);
            }
    });
    res.json(facilities);
})

router.get('/getiHRIS_FacilityTypes/:countryId',withAuth, async function (req, res) {

    let countryId = req.params.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let fhirClient=mkfhir({

        baseUrl:ihris_url,

        auth:{user:user_name, pass:password}
    });

    let facilities = await fhirClient
        .search({type:'Location/_history?_format=json'})
        .then(function(res){

            let bundle = res.data.entry;

            let types=[];

            bundle.forEach(bdl => {

                let fac = bdl.resource;

                let type=fac.type;

                types.push({
                    code:type.coding,
                    name:type.text                
                });
            })
            return types;

        }).catch(function(res){
            if(res.status){
                console.log('Error',res.status);
            }
            if(res.message){
                console.log('Error',res.message);
            }
    });
    res.json(facilities);
})

router.get('/getiHRIS_PractitionerRoles/:countryId',withAuth, async function (req, res) {

    let countryId = req.params.countryId;

    let params = await config.ihrisCredentials(countryId);

    let ihris_url = params.url;

    let user_name = params.user;

    let password = params.pwd;

    let fhirClient=mkfhir({

        baseUrl:ihris_url,

        auth:{user:user_name, pass:password}
    });

    let facilities = await fhirClient
        .search({type:'Location/_history?_format=json'})
        .then(function(res){

            let bundle = res.data.entry;

            let facilities=[];

            bundle.forEach(bdl => {

                let fac = bdl.resource;

                facilities.push({
                    code:fac.identifier[0].value,
                    prefix:fac.physicalType.coding[0].code,
                    name:fac.name,                   
                });
            })
            return facilities;

        }).catch(function(res){
            if(res.status){
                console.log('Error',res.status);
            }
            if(res.message){
                console.log('Error',res.message);
            }
    });
    res.json(facilities);
})

router.patch('/editHR',withAuth, (req, res) => {

    let id = req.body.id;

    let value = req.body.value;

    let param = req.body.param;

    db.query(`UPDATE staff SET ${param} ="${value}" WHERE id =${id}`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});
// get list of available workforce by cadre and facility
router.get('/workforce/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    db.query(`SELECT s.id AS id,s.staffCount AS staff,cadreCode AS cadreCode,
            fa.name AS facility,CONCAT(cstd.name_fr,'/',cstd.name_en) AS cadre  FROM 
                staff s,country_cadre ca,std_cadre cstd, facility fa WHERE 
                s.facilityCode=fa.code AND s.cadreCode=ca.std_code 
                AND ca.std_code=cstd.code AND fa.countryId=${countryId}`, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

// get list of available workforce without caring about facility
router.get('/all_workforce',withAuth, (req, res) => {
    db.query('SELECT id AS id,facilityId AS facilityId, facilityCode AS facilityCode FROM staff', function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/count_staffs/:countryId',withAuth, (req, res) => {
    let countryId = req.params.countryId;
    db.query(`SELECT SUM('staffCount') AS nb FROM staff s, facility fa 
                WHERE s.facilityCode=fa.code AND fa.countryId=${countryId}`, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});
//get count staff per cadre
router.get('/staff_per_cadre/:countryId',withAuth, (req, res) => {
    let countryId = req.params.countryId;

    db.query(`SELECT s.id AS id,s.staffCount AS staff,
        fa.name AS facility,CONCAT(cstd.name_fr,'/',cstd.name_en) AS cadre  FROM 
        staff s,country_cadre ca,std_cadre cstd, facility fa WHERE 
        s.facilityCode=fa.code AND s.cadreCode=ca.std_code 
        AND ca.std_code=cstd.code AND fa.countryId=${countryId} GROUP BY s.cadreCode`, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

router.delete('/deleteWorkforce/:id',withAuth, function (req, res) {

    let id = req.params.id;

    db.query(`DELETE FROM  staff WHERE id=${id}`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.get('/workforce/:cadre_code/:countryId',withAuth, (req, res) => {

    cadreCode = req.params.cadre_code;
    let countryId = req.params.countryId;

    db.query(`SELECT s.id AS id,s.staffCount AS staff,
        fa.name AS facility,CONCAT(cstd.name_fr,'/',cstd.name_en) AS cadre  FROM 
        staff s,country_cadre ca,std_cadre cstd, facility fa WHERE 
        s.facilityCode=fa.code AND s.cadreCode=ca.std_code 
        AND ca.std_code=cstd.code AND s.cadreCode="${cadreCode}" AND fa.countryId=${countryId}`, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

router.post('/uploadHR',withAuth, function (req, res) {

    if (!req.files) {
        return res.status(400).send('No files were uploaded');
    }

    //The name of the input field
    let file = req.files.file;

    let filename = 'workforce.csv';

    file.mv(`${__dirname}` + path.sep + 'uploads' + path.sep + 'ihris' + path.sep + `${filename}`, function (err) {
        if (err) {
            console.log("ERROR ", err);
            return res.status(500).send(err);
        }

        var obj = csv();

        let sql = ``;

        obj.from.path(`${__dirname}` + path.sep + 'uploads' + path.sep + 'ihris' + path.sep + `${filename}`).to.array(function (data) {

            for (var index = 1; index < data.length; index++) {//index starts by 2 to length-1 to avoid <table> header and footer

                let facility_code = data[index][0];

                let cadre_code = data[index][2];

                let staff_count = data[index][4];

                console.log(facility_code, cadre_code, staff_count);

                sql += `INSERT INTO staff (facilityCode,cadreCode,staffCount) VALUES("
                       ${facility_code}","${cadre_code}",${staff_count});`;
            }
            db.query(sql, function (error, results) {
                if (error) throw error;
                res.status(200).send('File uploaded successfully');
            });
        });

    });
});

router.use('/calculate_pressure', calculationRoute);

module.exports = router;


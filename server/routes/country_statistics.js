const sql = require('mysql');
const db = require('../dbconn');
const path = require('path');
let router = require('express').Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const csv = require('csv');
const XLSX = require('xlsx');
const uniqueFilename = require('unique-filename');
const os = require('os');


const withAuth = require('../middleware/is-auth');


router.use(fileUpload(/*limits: { fileSize: 50 * 1024 * 1024 },*/));

<<<<<<< HEAD
//API

router.post('/push',function(req,res){
    
    /*var data = [
        {
            "Facility_code":"faCode",
            "Cadre_code":"cdCode",
            "Activity_code":"trCode",
            "Year":"year",
            "Patients_count": 0
        }
    ]*/
    var data = req.body;

    var sql = ``;

    data.forEach(obj => {

        var facility_code = obj["Facility_code"];
        var cadre_code = obj["Cadre_code"];
        var activity_code = obj["Activity_code"];
        var patient_count = obj["Patients_count"];
        var year = obj["Year"];

        sql += `DELETE FROM activity_stats WHERE facilityCode="${facility_code}" AND activityCode="${activity_code}" AND cadreCode="${cadre_code}";`;

        sql += `INSERT INTO activity_stats (facilityCode,year,activityCode,cadreCode,caseCount) VALUES("
                   ${facility_code}","${year}","${activity_code}","${cadre_code}",${patient_count});`;
    })
    db.query(sql, function (error, results) {
        if (error) throw error;
        res.status(200).send('File uploaded successfully');
    });
})

/**************END API************* */

router.post('/uploadService', function (req, res) {

    if (!req.files) {
        return res.status(400).send('No file uploaded');
    }

    //var filePath = `${__dirname}${path.sep}uploads${path.sep}`;

    //The name of the input field
    var file = req.files.file;

    var filename = uniqueFilename(os.tmpdir());

    file.mv(`${filename}`, function (err) {
        if (err) {
            console.log("ERROR ", err);
            return res.status(500).send(err);
        }

        var wb = XLSX.readFile(`${filename}`);

        var sheet_names = wb.SheetNames;

        var xlData = XLSX.utils.sheet_to_json(wb.Sheets[sheet_names[0]]);
        
        var sql = ``;

        xlData.forEach(obj => {

            var facility_code = obj["Facility code"];
            var cadre_code = obj["Cadre code"];
            var activity_code = obj["Activity code"];
            var patient_count = obj["Patients count"];
            var year = obj["Year"];

            sql += `DELETE FROM activity_stats WHERE facilityCode="${facility_code}" AND activityCode="${activity_code}" AND cadreCode="${cadre_code}";`;

            sql += `INSERT INTO activity_stats (facilityCode,year,activityCode,cadreCode,caseCount) VALUES("
                       ${facility_code}","${year}","${activity_code}","${cadre_code}",${patient_count});`;
        })
        db.query(sql, function (error, results) {
            if (error) throw error;
            res.status(200).send('File uploaded successfully');
        });

    });
});

router.get('/treatments', function (req, res) {
=======
router.get('/treatments/:countryId',withAuth,function (req, res) {

    let countryId = req.params.countryId;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    db.query(`SELECT t.code AS code, dhis2_code AS dhis2_code,c.name,
            t.name AS name_cust,t.name AS name_std,  t.duration AS duration 
            FROM  country_treatment t, std_treatment st, std_cadre c 
<<<<<<< HEAD
            WHERE t.code=st.code AND st.cadre_code=c.code;`, function (error, results, fields) {
=======
            WHERE t.std_code=st.code AND st.cadre_code=c.code AND countryId=${countryId};`, function (error, results, fields) {
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
            if (error) throw error;
            res.json(results);
        });
});

router.post('/generateStatTemplate',withAuth, function (req, res) {

    let cadre = req.body.selectedCadre;

    let period = req.body.selectedPeriod;

    let facility = req.body.selectedFacility;

    let countryId = req.body.countryId

    let statistics = [];

    let sql=``;
    
    let count=0;

    db.query(`SELECT * FROM country_treatment WHERE cadre_code="${cadre}" WHERE countryId=${countryId}`, 
    function (error, results, fields) {
        if (error) throw error;
        results.forEach(rs =>{

            let activityCode=rs.code;

            sql+=`INSERT INTO activity_stats(facilityCode,year,activityCode,cadreCode) VALUES(
                  "${facility}","${period}","${activityCode}","${cadre}");`;

            
        })
        db.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
    });
})

<<<<<<< HEAD
router.delete('/delete/:id', function (req, res) {
=======
router.patch('/editPatientsCount',withAuth, (req, res) => {

    let id = req.body.id;

    let value = req.body.value;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let id = req.params.id;

    db.query(`DELETE FROM  activity_stats WHERE id=${id}`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.delete('/deleteStatistics/:facility/:cadre/:source',withAuth, function (req, res) {

    let facilityId = req.params.facility;

    let cadreId = req.params.cadreId;

    let source = req.params.source;

    db.query(`DELETE FROM  activity_stats WHERE id=${id}`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

<<<<<<< HEAD
    let sql = `SELECT act_st.id as id, fa.name as facility,act_st.cadreCode AS cadre_code, cd.name as cadre,
                 ct.name as treatment, act_st.caseCount as patients FROM facility fa, activity_stats act_st,
                 country_treatment ct, std_cadre cd WHERE act_st.facilityCode=fa.code AND 
                 act_st.activityCode=ct.code AND cd.code=act_st.cadreCode`;
=======
router.get('/statistics/:facilityCode/:cadreCode',withAuth, (req, res) => {

    let facilityCode = req.params.facilityCode;

    let cadreCode = req.params.cadreCode;

    let sql = `SELECT act_st.id as id,act_st.dhis2Code as treatment, 
                act_st.cadreCode AS cadre_code,SUM(act_st.caseCount) as patients, 
                act_st.year as year, ct_treat.name_std, ct_treat.name_customized 
                FROM  activity_stats act_st, country_treatment_dhis2 tr_dhis, 
                country_treatment ct_treat WHERE act_st.dhis2Code = tr_dhis.dhis2_code AND 
                tr_dhis.treatment_code = ct_treat.std_code  AND act_st.facilityCode="${facilityCode}" 
                AND act_st.cadreCode="${cadreCode}" GROUP BY act_st.treatmentCode`;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.patch('/editPatientsCount',withAuth, (req, res) => {

    let id = req.body.id;

    let value = req.body.value;

    let param = req.body.param;

    db.query(`UPDATE activity_stats SET ${param} =${value} WHERE id =${id}`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/upload/:countryId',withAuth, function (req, res) {

    if (!req.files)
        return res.status(400).send('No file was uploaded');

    let upload_dir = process.env.FILE_UPLOAD_DIR;
    //The name of the input field
    let file = req.files.file;

    let countryId = req.params.countryId;

    let filename =  `${countryId}_treatment_stats.csv`;

    //Use the mv() method to place the file somewhere on the server
    file.mv(`${path.sep}${upload_dir}${path.sep}${filename}`, function (err) {
        if (err)
            return res.status(500).send(err);
        res.status(200).send('File uploaded successfully');
        //return res.status(200).send('File uploaded successfully');
    });

    let sql = "";

    var obj = csv();

    obj.from.path(`${path.sep}${upload_dir}${path.sep}${filename}`).to.array(function (data) {

        for (var index = 1; index < data.length; index++) {

            let faCodes = data[index][0];

            let facilityCode = faCodes.split("|");

            let cadreCode = data[index][2];

            let treatmentCode = data[index][4];

            let period = data[index][6];

            let value = parseInt(data[index][7]);

            sql += `DELETE FROM activity_stats WHERE facilityCode ="${facilityCode[1]}" AND treatmentCode="${treatmentCode}"  
                    AND cadreCode="${cadreCode}";`;
            sql += `INSERT INTO activity_stats (facilityCode,treatmentCode,year,dhis2Code,cadreCode,caseCount) 
                            VALUES("${facilityCode[1]}","${treatmentCode}","${period}","${treatmentCode}","${cadreCode}",${value});`;
        }
           
        db.query(sql, function (error, results) {
            if (error) throw error;
            res.status(200);
        });

    });
})

module.exports = router;
const sql = require('mysql');
const db = require('../dbconn');
const path = require('path');
let router = require('express').Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const csv = require('csv');

const withAuth = require('../middleware/is-auth');

router.use(fileUpload(/*limits: { fileSize: 50 * 1024 * 1024 },*/));

router.post('/insertTreatment',withAuth, (req, res) => {

    let code = req.body.code;

    let cadre_code = req.body.cadre_code;

    let name = req.body.name;  

    let name_customized = req.body.name_customized;

    let duration = req.body.duration;

    let countryId = req.body.countryId;

    db.query(`INSERT INTO country_treatment (std_code,countryId,cadre_code,name_std,name_customized,
                treatment_type,duration) 
                VALUES("${code}",${countryId},"${cadre_code}","${name}","${name_customized}",,${duration})`, 
        function (error, results) {
            if (error) throw error;
            res.json(results);
    });
});

router.post('/insertSupportTreatment',withAuth, (req, res) => {

    let code = req.body.code;

    let cadre_code = req.body.cadre_code;

    let name = req.body.name;  

    let duration = req.body.duration;

    let time_unit = req.body.time_unit;

    let countryId = req.body.countryId;

    db.query(`INSERT INTO country_treatment_support (code,countryId,cadre_code,name,duration ,time_unit) 
                VALUES("${code}",${countryId},"${cadre_code}","${name}",${duration},${time_unit})`, 
        function (error, results) {
            if (error) throw error;
            res.json(results);
    });
});

router.post('/insertIndividualTreatment',withAuth, (req, res) => {

    let code = req.body.code;

    let cadre_code = req.body.cadre_code;

    let name = req.body.name;  

    let duration = req.body.duration;

    let nb_staff = req.body.nb_staff;

    let time_unit = req.body.time_unit;

    let countryId = req.body.countryId;

    db.query(`INSERT INTO country_treatment_individual(code,countryId,cadre_code,name,nb_staff,duration,time_unit) 
                VALUES("${code}",${countryId},"${cadre_code}","${name}",${nb_staff},${duration},${time_unit})`, 
        function (error, results) {
            if (error) throw error;
            res.json(results);
    });
});

router.post('/insertCustomizedTreatment', withAuth,(req, res) => {

    let code = req.body.code;

    let cadre_code = req.body.cadre_code;

    let name = req.body.name;   

    let duration = req.body.duration;

    let countryId = req.body.countryId;

    db.query(`INSERT INTO country_treatment (std_code,countryId,cadre_code,name_std,name_customized,
                treatment_type,duration) 
                VALUES("${code}",${countryId},"${cadre_code}","${name}","${name}","CUST",${duration})`,
        function (error, results) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/bulkInsertTreatment', withAuth,(req, res) => {

    let countryId=req.body.countryId;

    let cadre_code = req.body.cadre_code;

    let sql_del_stats = `DELETE FROM activity_stats WHERE activityCode 
            IN(SELECT std_code FROM country_treatment WHERE cadre_code="${cadre_code}" 
            AND countryId=${countryId})`;

    let sql_del_matching = `DELETE FROM country_treatment_dhis2 WHERE treatment_code 
            IN(SELECT std_code FROM country_treatment WHERE cadre_code="${cadre_code}" 
            AND countryId=${countryId})`;

    let sql_del_country_treatment =`DELETE FROM country_treatment WHERE cadre_code="${cadre_code}" AND countryId=${countryId}`;

    let sql_insert = `INSERT INTO country_treatment (std_code,countryId,cadre_code,name_std,duration) 
            SELECT code,${countryId}, cadre_code,name_en,duration FROM std_treatment WHERE 
            cadre_code="${cadre_code}"`;

    /*let sql = `DELETE FROM country_treatment WHERE cadre_code="${cadre_code}" AND countryId=${countryId};
                INSERT INTO country_treatment (std_code,countryId,cadre_code,name_std,facility_type,duration) 
                SELECT code,${countryId}, cadre_code,name_en,facility_type,duration FROM std_treatment WHERE 
                cadre_code="${cadre_code}"`;*/

    db.query(`${sql_del_stats};${sql_del_matching};${sql_del_country_treatment};${sql_insert}`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });
});

router.patch('/editTreatment',withAuth, (req, res) => {

    let code = req.body.std_code;

    let value = req.body.value;

    let param = req.body.param;

    let sql = "";

    if (param == "duration") {
        sql = `UPDATE country_treatment SET ${param} =${value} WHERE std_code ="${code}"`;
    } else {
        sql = `UPDATE country_treatment SET ${param} ="${value}" WHERE std_code ="${code}"`;
    }

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

router.patch('/match_dhis2',withAuth, (req, res) => {

    let code = req.body.code;

    let selectedTreatments = req.body.selectedTreatments;

    let sql = ``;

    let dhis2_cd = "";

    selectedTreatments.forEach(tr => {
        dhis2_cd += tr.code + `,`;
    });

    let dhis2_code = dhis2_cd.substring(0, dhis2_cd.length - 1);

    db.query(`UPDATE country_treatment SET dhis2_code="${dhis2_code}" WHERE std_code="${code}"`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

router.get('/treatments/:countryId',withAuth, function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT t.std_code AS code,t.cadre_code AS cadre_code, c.name_fr AS cadre_name_fr,
            c.name_en AS cadre_name_en, t.name_customized AS name_cust,t.name_std AS name_std, t.duration AS duration 
            FROM  country_treatment t, std_treatment st, std_cadre c 
            WHERE t.std_code=st.code AND st.cadre_code=c.code AND t.treatment_type ='STD' AND t.countryId=${countryId} UNION 

            SELECT t.std_code AS code,t.cadre_code AS cadre_code,c.name_fr AS cadre_name_fr,
            c.name_en AS cadre_name_en, t.name_customized AS name_cust,t.name_std AS name_std,t.duration AS duration 
            FROM  country_treatment t, std_cadre c WHERE t.cadre_code = c.code AND t.treatment_type ="CUST" AND t.countryId=${countryId};

            SELECT * FROM country_treatment_dhis2 WHERE treatment_code IN(SELECT std_code FROM country_treatment WHERE countryId=${countryId});`,
        function (error, results, fields) {
            if (error) throw error;
            let resultsArr = [];

            results[0].forEach(tr => {

                let subRes = [];
                results[1].forEach(dc => {
                    if (tr.code == dc.treatment_code) {
                        subRes.push({
                            id: dc.id,
                            code: dc.dhis2_code,
                            name: dc.dhis2_name
                        })
                    }
                });

                resultsArr.push({
                    code: tr.code,
                    cadre_code: tr.cadre_code,
                    cadre_name_fr: tr.cadre_name_fr,
                    cadre_name_en: tr.cadre_name_en,
                    name_cust: tr.name_cust,
                    name_std: tr.name_std,
                    duration: tr.duration,
                    dhis2_codes: subRes
                })
            });
            res.json(resultsArr);
        });
});

router.get('/treatment_supports/:countryId',withAuth, function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT t.id, t.code, t.cadre_code, t.name, t.duration,tu.name as time_unit 
                FROM country_treatment_support t, time_unit tu WHERE countryId=${countryId} AND t.time_unit=tu.id`,function (error, results, fields) {
            if (error) throw error;
            res.json(results);
    });
});

router.get('/treatment_individuals/:countryId',withAuth, function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT t.id, t.code, t.cadre_code, t.name, t.nb_staff, t.duration,tu.name as time_unit 
                FROM country_treatment_individual t, time_unit tu WHERE countryId=${countryId} AND t.time_unit=tu.id`,function (error, results, fields) {
            if (error) throw error;
            res.json(results);
    });
});

router.get('/count_treatments/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    db.query(`SELECT COUNT(id) AS nb FROM country_treatment WHERE countryId=${countryId}`,function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/dhis2_codes/:treatmentCode',withAuth, function (req, res) {

    let treatmentCode = req.params.treatmentCode;

    db.query(`SELECT * FROM country_treatment_dhis2 WHERE treatment_code="${treatmentCode}"`,
        function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

router.post('/match_dhis2_codes', withAuth,function (req, res) {

    let treatmentCode = req.body.treatmentCode;

    let selectedDhis2Treatments = req.body.selectedDhis2Treatments;

    let sql = ``;

    selectedDhis2Treatments.map(dhis2 => {
        sql += `INSERT INTO country_treatment_dhis2(treatment_code,dhis2_code,dhis2_dataset,dhis2_name) 
                VALUES("${treatmentCode}","${dhis2.code}","${dhis2.dataset}","${dhis2.name}");`;
    });
 
    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/treatments/:cadreCode/:countryId',withAuth, function (req, res) {

    let cadreCode = req.params.cadreCode;

    let countryId = req.params.countryId;

    let sql = "";

    if (cadreCode == "0") {
        sql = `SELECT t.std_code AS code,c.name_fr AS cadre_name_fr,t.cadre_code, 
                c.name_en AS cadre_name_en, t.name_customized AS name_cust,t.name_std AS name_std, t.duration AS duration 
                FROM  country_treatment t, std_treatment st, std_cadre c 
                WHERE t.std_code=st.code AND st.cadre_code=c.code AND t.countryId=${countryId}`
    } else {
        sql = `SELECT t.std_code AS code, c.name_fr AS cadre_name_fr,
        c.name_en AS cadre_name_en, t.name_customized AS name_cust,t.name_std AS name_std, t.duration AS duration  
        FROM  country_treatment t, std_treatment st, std_cadre c 
        WHERE t.std_code=st.code AND st.cadre_code=c.code AND t.cadre_code="${cadreCode}" AND t.countryId=${countryId}`;
    }

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.post('/treatments',withAuth, function (req, res) {

    let cadres = req.body.cadres;

    let countryId = req.body.countryId;

    let cadreIds = [];

    cadres.forEach(cd =>{
        cadreIds.push(cd.code);
    });

    let sql = `SELECT t.std_code AS code, c.std_code as cadre_code,CONCAT(c_std.name_fr,"/",c_std.name_en) as cadre_name,
                t.name_customized AS name_cust,t.name_std AS name_std   
                FROM  country_treatment t, country_cadre c, std_cadre c_std 
                WHERE c.std_code = t.cadre_code AND c.std_code = c_std.code AND 
                t.cadre_code IN(?) AND t.countryId=${countryId}`;

    db.query(`${sql}`,[cadreIds], function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/getTreatment/:cadreCode',withAuth, function (req, res) {

    let cadreCode = req.params.cadreCode;

    db.query(`SELECT ct.std_code AS std_code, ct.hris_code AS hris_code,
                ct.worktime AS worktime,ct.admin_task AS admin_task, std.name_fr
                AS name_fr, std.name_en AS name_en FROM country_cadre ct, std_cadre std 
                WHERE ct.std_code=std.code AND std_code="${cadreCode}"`, function (error, results) {
            if (error) throw error;
            res.json(results);
        });
})

router.delete('/deleteTreatment/:code',withAuth, function (req, res) {

    let code = req.params.code;

    db.query(`DELETE FROM  country_treatment WHERE std_code="${code}"`, function (error, results, fields) {
        if (error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.post('/uploadTreatments',withAuth, function (req, res) {

    if (!req.files) {
        return res.status(400).send('No files were uploaded');
    }

    //The name of the input field
    let file = req.files.file;

    let filename = 'country_treatment.csv';

    file.mv(`${__dirname}` + path.sep + 'uploads' + path.sep + 'metadata' + path.sep + `${filename}`, function (err) {
        if (err) {
            console.log("ERROR ", err);
            return res.status(500).send(err);
        }

        //res.status(200).send('File uploaded successfully');
        let sql = "";

        var obj = csv();

        obj.from.path(`${__dirname}` + path.sep + 'uploads' + path.sep + 'metadata' + path.sep + `${filename}`).to.array(function (data) {

            for (var index = 1; index < data.length; index++) {

                let std_code = data[index][0];

                let dhis2_code = data[index][1];

                let std_name = data[index][2];

                let customized_name = data[index][3];

                let std_cadre_code = data[index][4];

                let duration = data[index][6];

                sql += `INSERT INTO country_treatment(std_code,dhis2_code,cadre_code,name_std,name_customized,duration) VALUES("${std_code}","${dhis2_code}","${std_cadre_code}","${std_name}","${customized_name}",${duration}) 
                            ON DUPLICATE KEY UPDATE dhis2_code="${dhis2_code}",cadre_code = "${std_cadre_code}",name_std="${std_name}",name_customized="${customized_name}", duration=${duration};`;
            }

            db.query(sql, function (error, results) {
                if (error) throw error;
                res.status(200).send('File uploaded successfully');
            });
        });
    });
})
module.exports = router;
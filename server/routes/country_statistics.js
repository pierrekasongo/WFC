const sql = require('mysql');
const db = require('../dbconn');
const path = require('path');
let router = require('express').Router();
const fileUpload = require('express-fileupload');
const fs = require('fs');
const csv = require('csv');

const withAuth = require('../middleware/is-auth');


router.use(fileUpload(/*limits: { fileSize: 50 * 1024 * 1024 },*/));

router.get('/treatments/:countryId',withAuth,function (req, res) {

    let countryId = req.params.countryId;

    db.query(`SELECT t.std_code AS code, dhis2_code AS dhis2_code,c.name_fr AS cadre_name_fr,
            c.name_en AS cadre_name_en, t.name_customized AS name_cust,t.name_std AS name_std,  t.duration AS duration 
            FROM  country_treatment t, std_treatment st, std_cadre c 
            WHERE t.std_code=st.code AND st.cadre_code=c.code AND countryId=${countryId};`, function (error, results, fields) {
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

    db.query(`SELECT * FROM country_treatment WHERE cadre_code="${cadre}" WHERE countryId=${countryId}`, function (error, results, fields) {
        if (error) throw error;
        results.forEach(rs =>{

            let activityCode=rs.std_code;

            sql+=`INSERT INTO activity_stats(facilityCode,year,activityCode,cadreCode) VALUES(
                  "${facility}","${period}","${activityCode}","${cadre}");`;

            
        })
        db.query(sql, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
    });
})

router.patch('/editPatientsCount',withAuth, (req, res) => {

    let id = req.body.id;

    let value = req.body.value;

    let param=req.body.param;

    db.query(`UPDATE activity_stats SET ${param} =${value} WHERE id =${id}`, 
        function (error, results) {
        if (error) throw error;
        res.json(results);
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

router.get('/statistics/:countryId/:facilityCode',withAuth, (req, res) => {
    
    let countryId = req.params.countryId;

    let facilityCode = req.params.facilityCode;

    let sql = `SELECT act_st.id as id,act_st.activityCode as activityCode, fa.name as facility,act_st.cadreCode AS cadre_code, CONCAT(cd.name_fr,'/',cd.name_en) as cadre,
                 ct.name_std as treatment, SUM(act_st.caseCount) as patients FROM facility fa, activity_stats act_st,
                 country_treatment ct, std_cadre cd WHERE act_st.facilityCode=fa.code AND 
                 act_st.activityCode=ct.std_code AND cd.code=act_st.cadreCode AND act_st.facilityCode="${facilityCode}" AND fa.countryId=${countryId} GROUP BY facility,activityCode`;

    db.query(sql, function (error, results, fields) {
        if (error) throw error;
        console.log(results);
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
module.exports = router;
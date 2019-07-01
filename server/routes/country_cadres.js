const sql = require('mysql');
const db=require('../dbconn');


const withAuth=require('../middleware/is-auth');

let router = require('express').Router();


//Update hours per week for a cadre
router.patch('/cadre/hours/:id',withAuth,(req, res) => {

    var id=parseInt(req.params.id.toString());

    var value=parseInt(req.body.hours.toString());

    db.query(`UPDATE cadre SET hoursPerWeek =`+value+` WHERE id =`+id,function(error,results){
                    if(error)throw error;
                    res.json(results);
    });
});

//Update hours per week for a cadre
router.patch('/cadre/admin_work/:id',withAuth, (req, res) => {

    var id=parseInt(req.params.id.toString());

    var value=parseInt(req.body.admin_task.toString());

    db.query(`UPDATE cadre SET adminTask =`+value+` WHERE id =`+id,function(error,results){
                    if(error)throw error;
                    res.json(results);
    });
});

router.post('/insertCadre',withAuth,(req, res) => {

    var stdCode=req.body.stdCode;

    var work_days=req.body.workDay;

    var work_hours=req.body.workHours;

    var annual_leave=req.body.annualLeave;

    var sick_leave=req.body.sickLeave;

    var other_leave=req.body.otherLeave
    
    var admin_task=req.body.adminTask;

    var countryId=req.body.countryId;

    db.query(`INSERT INTO country_cadre (std_code,work_days,work_hours,
                annual_leave,sick_leave,other_leave,admin_task, country_id) 
                VALUES("${stdCode}",${work_days},${work_hours},${annual_leave},
            ${sick_leave},${other_leave},${admin_task},${countryId})`,function(error,results){
                    if(error)throw error;
                    res.json(results);
    });
});

router.patch('/editCadre',withAuth, (req, res) => {

    let code = req.body.std_code;

    let value = req.body.value;

    let param=req.body.param;

    let sql="";

    if(param == "hris_code"){
        sql=`UPDATE country_cadre SET ${param} ="${value}" WHERE std_code ="${code}"`;
    }else{
        sql=`UPDATE country_cadre SET ${param} =${value} WHERE std_code ="${code}"`;
    }
    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

// get list of cadres
router.get('/cadres/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    db.query(`SELECT ct.std_code AS code,CONCAT(st.name_fr,"/",st.name_en) AS name,
                ct.work_days AS work_days,ct.work_hours AS work_hours,ct.admin_task AS admin_task,
                ct.annual_leave AS annual_leave, ct.sick_leave AS sick_leave,
                ct.other_leave AS other_leave, ct.hris_code AS hris_code  FROM country_cadre ct, std_cadre st 
                WHERE ct.std_code=st.code AND country_id=${countryId}`, function (error, results, fields) {
            if (error) throw error;
            res.json(results);
        });
});

router.get('/count_cadres/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    db.query(`SELECT COUNT(id) AS nb FROM country_cadres WHERE country_id=${countryId}`,function (error, results, fields) {
        if (error) throw error;
        res.json(results);
    });
});

router.get('/getCadre/:cadreCode',withAuth, function(req,res){

    let cadreCode=req.params.cadreCode;

    db.query(`SELECT ct.std_code AS std_code, ct.hris_code AS hris_code,
    ct.work_days AS work_days, ct.work_hours AS work_hours,
                ct.annual_leave AS annual_leave, ct.sick_leave AS sick_leave,
                ct.other_leave AS other_leave,ct.admin_task AS admin_task, std.name_fr
                AS name_fr, std.name_en AS name_en FROM country_cadre ct, std_cadre std 
                WHERE ct.std_code=std.code AND std_code="${cadreCode}"`, function (error, results) {
        if (error) throw error;
        res.json(results);
    });
})

router.delete('/deleteCadre/:code', withAuth,function(req, res){

    let code=req.params.code; 

    db.query(`DELETE FROM  country_cadre WHERE std_code="${code}"`,function(error,results,fields){
        if(error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

router.get('/workforce', (req, res) => {
    db.query('SELECT s.id AS id,s.staffCount AS staff,'+
    'fa.facilityName AS facility,ca.cadreName AS cadre  FROM staff s,cadre ca,facilities fa WHERE s.facilityCode=fa.FacilityCode AND s.cadreId=ca.id',function(error,results,fields){
        if(error) throw error;
        res.json(results);
    });
});

let getCadreByihrisCode = async function (hris_code) {

    let sql = `SELECT cc.std_code AS code, stc.name_fr AS name_fr, stc.name_en AS name_en FROM country_cadre cc, std_cadre stc WHERE 
                cc.std_code=stc.code AND hris_code ="${hris_code}"`;

    let results = await new Promise((resolve, reject) => db.query(sql, function (error, results) {
        if (error) {
            reject(error)
        } else {
            resolve(results);
        }
    }));

    let cadre = {
        code: results[0].code,
        name: results[0].name_fr+'/'+results[0].name_en
    }
    return cadre;
}

module.exports = {
    getCadreByihrisCode : getCadreByihrisCode,
    router : router
}

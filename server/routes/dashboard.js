const sql = require('mysql');
const db = require('../dbconn');
const path = require('path');
const csv = require('csv');


let router = require('express').Router();

<<<<<<< HEAD
const withAuth = require('./auth')

let countryId=52;
=======
const withAuth = require('../middleware/is-auth');
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

router.post('/',withAuth, (req, res) => {

    let facilities = req.body.selectedFacilities;

    let dashData = [];

    let expecting = Object.keys(facilities).length;

    Object.keys(facilities).forEach(fa => {
        
        processRequest(facilities[fa].code, function(dash){

            dashData.push({
                facility:facilities[fa].name,
                dash:dash
            });
    
            if(--expecting === 0){
                res.json(dashData);
            }
        });

    });
});

let processRequest = function(facilityCode,dashId, callback){

<<<<<<< HEAD
    let sql = `SELECT db.name as dashboard_name,fa.name as facility, cd.name as cadre, 
=======
    let sql = `SELECT db.name as dashboard_name,fa.name as facility, CONCAT(cd.name_en,'/',cd.name_fr) as cadre, 
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
                rr.current, rr.needed FROM dashboard db, dashboard_items di,results_record rr,
                facility fa, std_cadre cd WHERE db.id = di.dashboard_id 
                AND rr.facilityCode=fa.code AND rr.cadreCode=cd.code 
                AND di.item_id = rr.id AND db.id=${dashId} AND rr.facilityCode="${facilityCode}"`;

    db.query(sql, function (error, results) {

        if (error) throw error;

        let data = [];

        results.forEach(row => {

            data.push({

                cadre: row.cadre,

                current : row.current,

                needed : row.needed                        
            });
        })
        callback(data);
    });

}

<<<<<<< HEAD
router.get('/get_dashboard'/*:countryId/:id',withAuth*/, (req, res) => {

   // let countryId = req.params.countryId;

    /*let dashId = req.params.id;
=======
router.get('/get_dashboard/:countryId/:id',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    let dashId = req.params.id;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let extra_param = `db.id=${dashId}`;

    if(dashId == 0){
        extra_param = `db.is_default=1`;
<<<<<<< HEAD
    }*/

    let sql = `SELECT DISTINCT rr.facilityCode as faCode,fa.name as facility,ft.code as type_code, 
                ft.name type_name,
                db.id as dashId FROM dashboard db, dashboard_items di,results_record rr,
                facility fa, std_cadre cd, std_facility_type ft WHERE db.id = di.dashboard_id 
                AND rr.facilityCode=fa.code AND rr.cadreCode=cd.code AND fa.facilityType=ft.code 
                AND di.item_id = rr.id AND db.countryId = ${countryId}`;// AND ${extra_param}`;
=======
    }

    let sql = `SELECT DISTINCT rr.facilityCode as faCode,fa.name as facility,ft.code as type_code, 
                CONCAT(ft.name_fr,'/',ft.name_en) as type_name,
                db.id as dashId FROM dashboard db, dashboard_items di,results_record rr,
                facility fa, std_cadre cd, std_facility_type ft WHERE db.id = di.dashboard_id 
                AND rr.facilityCode=fa.code AND rr.cadreCode=cd.code AND fa.facilityType=ft.code 
                AND di.item_id = rr.id AND db.countryId = ${countryId} AND ${extra_param}`;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    db.query(sql, function (error, results) {

        if (error) throw error;

        let data = [];

        let expecting = results.length;

        results.forEach(row => {

            dashId = (dashId == 0)?row.dashId:dashId;

            processRequest(row.faCode,dashId, function(dash){

                data.push({

                    facility : row.facility,

                    facilityType : row.type_code,

                    dash : dash
                });
        
                if(--expecting === 0){
                    res.json(data);
                }
            });
        })
    });

});

<<<<<<< HEAD
router.get('/dashboards'/*/:countryId',withAuth*/, (req, res) => {

    //let countryId = req.params.countryId;
=======
router.get('/dashboards/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let sql = `SELECT * from dashboard WHERE countryId = ${countryId}`;

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

<<<<<<< HEAD
router.get('/get_favorites'/*/:countryId/:dashId',withAuth*/, (req, res) => {

   // let countryId = req.params.countryId;

    let dashId = req.params.dashId;

    let sql = `SELECT da.id as id,CONCAT(fa.name,'-',cd.name_en) as label, cd.name as cadre, 
=======
router.get('/get_favorites/:countryId/:dashId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    let dashId = req.params.dashId;

    let sql = `SELECT da.id as id,CONCAT(fa.name,'-',cd.name_en) as label, CONCAT(cd.name_en,'/',cd.name_fr) as cadre, 
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
              da.current, da.needed  FROM results_record da, facility fa, std_cadre cd WHERE 
              da.id NOT IN (SELECT item_id FROM dashboard_items WHERE dashboard_id=${dashId}) AND 
              da.facilityCode=fa.code AND da.cadreCode=cd.code AND 
              fa.countryId = ${countryId}`;


    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

<<<<<<< HEAD
router.get('/get_dashboard_items'/*/:countryId/:dashId',withAuth*/, (req, res) => {

    //let countryId = req.params.countryId;
=======
router.get('/get_dashboard_items/:countryId/:dashId',withAuth, (req, res) => {

    let countryId = req.params.countryId;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let dashId = req.params.dashId;

    let sql = `SELECT di.id as item_id, da.id as id,CONCAT(fa.name,'-',cd.name_en) as facility, 
<<<<<<< HEAD
              CONCAT(cd.name_en,'/',cd.name_fr) as cadre, da.current, da.needed  FROM dashboard_items di, results_record da, facility fa, std_cadre cd WHERE 
=======
              CONCAT(cd.name_en,'/',cd.name_fr) as cadre, da.current, da.needed, da.curr_salary, 
              da.need_salary  FROM dashboard_items di, results_record da, facility fa, std_cadre cd WHERE 
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
              di.dashboard_id = ${dashId} AND di.item_id = da.id AND 
              da.facilityCode=fa.code AND da.cadreCode=cd.code AND 
              fa.countryId = ${countryId}`;


    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

<<<<<<< HEAD
router.delete('/delete_dashboard/:id', /*withAuth,*/function(req, res){
=======
router.delete('/delete_dashboard/:id', withAuth,function(req, res){
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let id = req.params.id; 

    db.query(`DELETE FROM dashboard_items WHERE dashboard_id=${id};             
              DELETE FROM  dashboard WHERE id=${id};
              UPDATE users SET default_dashboard = 0 WHERE default_dashboard=${id}`,function(error,results,fields){
        if(error) throw error;
        res.status(200).send("Deleted successfully");
    });
});

<<<<<<< HEAD
router.delete('/delete_dashboard_item/:id',/* withAuth,*/function(req, res){
=======
router.delete('/delete_dashboard_item/:id', withAuth,function(req, res){
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let id = req.params.id; 

    db.query(`DELETE FROM  dashboard_items WHERE id=${id}`,function(error,results,fields){
        if(error) throw error;
        res.status(200).send("Deleted successfully");
    });
});



<<<<<<< HEAD
router.post('/add_dashboard/:countryId',/* withAuth,*/function(req, res){
=======
router.post('/add_dashboard/:countryId', withAuth,function(req, res){
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let name = req.body.name; 

    let description = req.body.description;

<<<<<<< HEAD
    //let countryId = req.params.countryId;
=======
    let countryId = req.params.countryId;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    db.query(`INSERT INTO dashboard(name,detail,countryId) VALUES ("${name}","${description}",${countryId})`,
        function(error,results,fields){
            if(error) throw error;
            res.status(200).send("Deleted successfully");
    });
});

<<<<<<< HEAD
router.post('/save_as_favorite',/*withAuth,*/ (req, res) => {
=======
router.post('/save_as_favorite',withAuth, (req, res) => {
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let datas = req.body.selectedData;

    let sql=``;

    Object.keys(datas).forEach(id => {

        let cadreId = datas[id].cadreId;

        let facilityId = datas[id].facilityId;

        let currentWorkers = datas[id].currentWorkers;

        let neededWorkers = datas[id].neededWorkers;

<<<<<<< HEAD
        sql+=`DELETE FROM results_record WHERE cadreCode="${cadreId}" AND facilityCode="${facilityId}";
                INSERT INTO results_record(cadreCode, facilityCode, current, needed) 
                VALUES("${cadreId}","${facilityId}",${currentWorkers},${neededWorkers})`;
=======
        let currentSalary = datas[id].currentSalary;

        let neededSalary = datas[id].neededSalary;

        sql+=`DELETE FROM results_record WHERE cadreCode="${cadreId}" AND facilityCode="${facilityId}";
                INSERT INTO results_record(cadreCode, facilityCode, current, needed,curr_salary,need_salary) 
                VALUES("${cadreId}","${facilityId}",${currentWorkers},${neededWorkers},${currentSalary},${neededSalary})`;
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
    });

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

<<<<<<< HEAD
router.patch('/edit',/*withAuth,*/ (req, res) => {
=======
router.patch('/edit',withAuth, (req, res) => {
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let id = req.body.id;

    let value = req.body.value;

    let param=req.body.param;

    let sql=`UPDATE dashboard SET ${param} ="${value}" WHERE id =${id}`;

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});


<<<<<<< HEAD
router.post('/addItems',/*withAuth,*/(req,res) =>{
=======
router.post('/addItems',withAuth, (req,res) =>{
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

    let selectedItems = req.body.selectedItems;

    let dashId = req.body.dashId;

    let size=Object.keys(selectedItems).length;

    let sql = ``;

    let count = 0;

    Object.keys(selectedItems).forEach(id => {

        count++;

        sql+=`INSERT INTO dashboard_items (dashboard_id,item_id) VALUES(${dashId},${id});`;

        if(count === size){

            db.query(sql, function (error, results) {
                if (error) throw error;
                res.json(results);
            });
        }
    });
})

<<<<<<< HEAD
module.exports = router;
=======
module.exports = router;

>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

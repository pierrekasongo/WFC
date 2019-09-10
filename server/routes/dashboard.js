const sql = require('mysql');
const db = require('../dbconn');
const path = require('path');
const csv = require('csv');


let router = require('express').Router();

const withAuth = require('../middleware/is-auth');

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

    let sql = `SELECT db.name as dashboard_name,fa.name as facility, CONCAT(cd.name_en,'/',cd.name_fr) as cadre, 
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

router.get('/get_dashboard/:countryId/:id',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    let dashId = req.params.id;

    let extra_param = `db.id=${dashId}`;

    if(dashId == 0){
        extra_param = `db.is_default=1`;
    }

    let sql = `SELECT DISTINCT rr.facilityCode as faCode,fa.name as facility,db.id as dashId FROM dashboard db, dashboard_items di,results_record rr,
                facility fa, std_cadre cd WHERE db.id = di.dashboard_id 
                AND rr.facilityCode=fa.code AND rr.cadreCode=cd.code 
                AND di.item_id = rr.id AND db.countryId = ${countryId} AND ${extra_param}`;

    db.query(sql, function (error, results) {

        if (error) throw error;

        let data = [];

        let expecting = results.length;

        results.forEach(row => {

            dashId = (dashId == 0)?row.dashId:dashId;

            processRequest(row.faCode,dashId, function(dash){

                data.push({

                    facility : row.facility,

                    dash : dash
                });
        
                if(--expecting === 0){
                    res.json(data);
                }
            });
        })
    });

});

router.get('/dashboards/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    let sql = `SELECT * from dashboard WHERE countryId = ${countryId}`;

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

router.get('/get_favorites/:countryId',withAuth, (req, res) => {

    let countryId = req.params.countryId;

    let sql = `SELECT da.id as id,CONCAT(fa.name,'-',cd.name_en) as label, CONCAT(cd.name_en,'/',cd.name_fr) as cadre, 
              da.current, da.needed  FROM results_record da, facility fa, std_cadre cd WHERE 
              da.facilityCode=fa.code AND da.cadreCode=cd.code AND 
              fa.countryId = ${countryId}`;


    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

router.post('/insert_favorite',withAuth, (req, res) => {

    let facilityCode = req.body.facilityCode;

    let cadreCode = req.body.cadreCode;

    let current = req.body.current;

    let needed = req.body.needed;

    let sql = `DELETE FROM results_record WHERE cadreCode="${cadreCode}" AND facilityCode="${facilityCode}";
                INSERT INTO results_record(cadreCode, facilityCode, current, needed) 
                VALUES("${cadreCode}","${facilityCode}",${current},${needed})`;


    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});

router.patch('/edit',withAuth, (req, res) => {

    let id = req.body.id;

    let value = req.body.value;

    let param=req.body.param;

    let sql=`UPDATE dashboard SET ${param} ="${value}" WHERE id =${id}`;

    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});


module.exports = router;


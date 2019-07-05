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
            })
    
            if(--expecting === 0){
                res.json(dashData);
            }
        });

    });
});

let processRequest = function(facilityCode, callback){

    let sql = `SELECT fa.name as facility, CONCAT(cd.name_en,'/',cd.name_fr) as cadre, 
              da.current, da.needed  FROM dashboard da, facility fa, std_cadre cd WHERE 
              da.facilityCode=fa.code AND da.cadreCode=cd.code AND 
              facilityCode = "${facilityCode}"`;

    db.query(sql, function (error, results) {
        if (error) throw error;
        let data = [];

        results.forEach(row => {
            data.push({
                facility:row.facility,
                cadre: row.cadre,
                current : row.current,
                needed : row.needed
            });
        })
        callback(data);
    });

}

router.post('/insert',withAuth, (req, res) => {

    let facilityCode = req.body.facilityCode;

    let cadreCode = req.body.cadreCode;

    let current = req.body.current;

    let needed = req.body.needed;

    let sql = `DELETE FROM dashboard WHERE cadreCode="${cadreCode}" AND facilityCode="${facilityCode}";
                INSERT INTO dashboard(cadreCode, facilityCode, current, needed) 
                VALUES("${cadreCode}","${facilityCode}",${current},${needed})`;


    db.query(sql, function (error, results) {
        if (error) throw error;
        res.json(results);
    });

});


module.exports = router;


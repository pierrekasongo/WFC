const sql = require('mysql');

let router = require('express').Router();

const db = require('../../dbconn');

var calculationResults=[];

router.post('/', (req, res) => {

    calculationResults=[];

    let cadres = req.body.selectedCadres;

    let period = req.body.selectedPeriod.toString();

    let facilityId = 0;//req.params.code.toString();

    let facilities = req.body.selectedFacilities;

    //Getting cadre ids 
    let cadreIds = [];

    //Getting facility ids
    let facilityIds = [];

    let i = 0;

    let obj={};

    Object.keys(cadres).forEach(cadreId => {
        cadreIds[i] = cadreId;
        i++;
    });

    let size=Object.keys(facilities).length;

    let count=0;

    let expecting=Object.keys(facilities).length;

    Object.keys(facilities).forEach(id => {

        count++;

        facilityId = facilities[id].id;

        process(facilityId,facilities,cadreIds,cadres,period,
            function(obj) {
                calculationResults.push(obj);
                if(--expecting === 0){
                    //console.log(calculationResults);
                    res.json(calculationResults);
                }
            });
    });

})


var process=function(facilityId,facilities,cadreIds,cadres,period,callback){
    //PROCESS
    let treatmentIds = [];

    let obj={};

    let facilityCode=facilities[facilityId].code;
    // queries
    //let concernedTreatmentsQuery= `SELECT id, ratio FROM activities WHERE `;
    let treatmentsQuery = `SELECT id, ratio FROM activities`;
    //let treatmentsQuery = `SELECT id, ratio FROM activities WHERE id IN (SELECT activityId FROM activity_time WHERE cadreId IN(?) )`;
    let patientCountQuery = `SELECT activityId  AS id, SUM(caseCount) AS PatientCount FROM activity_stats
                           WHERE CONCAT(year, quarter)=ANY(SELECT DISTINCT CONCAT(year, quarter) FROM activity_stats WHERE facilityId="`+ facilityCode + `" AND year="` + period + `" ORDER BY CONCAT(year, quarter) DESC)
                                AND facilityId="`+ facilityCode + `" GROUP BY activityId LIMIT 0,4`;

    /*let patientCountQuery = `SELECT activityId  AS id, SUM(caseCount) AS PatientCount FROM activity_stats
                              WHERE facilityId="`+ facilityCode + 
                              `" AND year="` + period + `" GROUP BY activityId LIMIT 0,4`;*/
    let timePerTreatmentQuery = `SELECT activityId, cadreId, minutesPerPatient AS TreatmentTime FROM activity_time WHERE cadreId IN(?) GROUP BY activityId, cadreId`;//Select only for selected cadres
    let facilityStaffCountQuery = `SELECT cadreId, staffCount AS StaffCount FROM staff
                                WHERE  facilityCode="`+ facilityCode + `"`;
    

    db.query(`${treatmentsQuery}; ${patientCountQuery}; ${timePerTreatmentQuery}; ${facilityStaffCountQuery};`, [cadreIds, cadreIds],
        function (error,results) {

            let treatmentsQueryResult = results[0];

            let patientCountQueryResult = results[1];

            let facilityStaffCountQueryResult = results[3];

            // convert results from query into a dictionary from an array
            let patientsPerTreatment = {};

            patientCountQueryResult.forEach(row => {
                patientsPerTreatment[row['id']] = row['PatientCount'];

                treatmentIds[row['id']] = row['id'];
            });

            let timePerTreatmentQueryResult = results[2];

            // set to zero if treatment has no patients
            treatmentsQueryResult.forEach(row => {
                if (!patientsPerTreatment[row['id']]) {
                    patientsPerTreatment[row['id']] = 0
                }
            });

            let workersNeededPerTreatment = {};

            Object.keys(cadres).forEach(cadreId => {

                treatmentsQueryResult.forEach(treatmentRow => {

                    let treatmentId = treatmentRow['id'];

                    let timePerPatient = timePerTreatmentQueryResult.filter(val =>
                        val['cadreId'] == cadreId && val['activityId'] == treatmentId);

                    if (timePerPatient[0] == null) {
                        timePerPatient = 0;
                    } else {
                        timePerPatient = timePerPatient[0]['TreatmentTime'];
                    }

                    //timePerPatient = timePerPatient[0]['TreatmentTime'];

                    totalHoursForTreatment = (timePerPatient / 60) * patientsPerTreatment[treatmentId];

                    // input parameters
                    let cadreHours = cadres[cadreId].hours;

                    let cadreAdminPercentage = cadres[cadreId].adminPercentage;

                    let hoursAWeek = cadreHours * (1 - (cadreAdminPercentage / 100));

                    let hoursAYear = hoursAWeek * 52;

                    if (workersNeededPerTreatment[cadreId] == null) {

                        workersNeededPerTreatment[cadreId] = {};
                    }

                    workersNeededPerTreatment[cadreId][treatmentId] = totalHoursForTreatment / hoursAYear;

                });
            });

            // sum workers needed for only selected treatments
            let workersNeeded = {};
            Object.keys(workersNeededPerTreatment).forEach(cadreId => {
                workersNeeded[cadreId] = 0;
                treatmentIds.forEach(treatmentId =>
                    workersNeeded[cadreId] += workersNeededPerTreatment[cadreId][treatmentId]
                )
            });

            /******* calculate workforce pressure ***************/
            // step 1: normalize ratio values
            let ratioSum = 0;
            treatmentsQueryResult.forEach(row => ratioSum += row['ratio']);
            let normalizedRatios = {};
            treatmentsQueryResult.forEach(row =>
                normalizedRatios[row['id']] = row['ratio'] / ratioSum
            );
            // step 2: determine current workforce dedicated to each treatment
            let workersPerTreatment = {};

            facilityStaffCountQueryResult.forEach(row => {

                workersPerTreatment[row['cadreId']] = {};

                Object.keys(normalizedRatios).forEach(treatmentId => {

                    workersPerTreatment[row['cadreId']][treatmentId] = row['StaffCount'] * normalizedRatios[treatmentId];
                });
            });

            // step 3: calculate pressure, but only for the selected treatments
            let pressure = {}
            let currentWorkers = {};
            Object.keys(workersPerTreatment).forEach(cadreId => {

                let workers = 0;

                treatmentIds.forEach(treatmentId => {

                    workers += workersPerTreatment[cadreId][treatmentId];

                });
                //workers=2;
                //currentWorkers[cadreId] = 2;
                currentWorkers[cadreId] = Number.parseFloat(workers).toFixed(2);

                pressure[cadreId] = Number.parseFloat(workers).toFixed(2) / Number.parseFloat(workersNeeded[cadreId]).toFixed(2);
            });

            //Current workers: suggested by Pierre; simply select the available workers for the cadre
            facilityStaffCountQueryResult.forEach(row => {

                currentWorkers[row['cadreId']] = row['StaffCount'];

                pressure[row['cadreId']] = Number.parseInt(row['StaffCount']) / Number.parseFloat(workersNeeded[row['cadreId']]).toFixed(2);
            });

            obj= {
                facility: facilities[facilityId].name,
                currentWorkers: currentWorkers,
                workersNeeded: workersNeeded,
                pressure: pressure
            };
            callback(obj);
            
        });//END QUERY CALL BACK 
}

module.exports = router;
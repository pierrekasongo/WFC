const sql = require('mysql');

let router = require('express').Router();

const db = require('../dbconn');

const withAuth = require('../middleware/is-auth');

var calculationResults=[];

router.post('/',withAuth, (req, res) => {

    calculationResults=[];

    let countryId = req.body.countryId;

    let cadres = req.body.selectedCadres;

    let holidays = req.body.holidays;

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

        process(facilityId,facilities,cadreIds,cadres,period,holidays,countryId,
            function(obj) {
                calculationResults.push(obj);
                if(--expecting === 0){

                    res.json(calculationResults);
                }
            });
    });

})

var process=function(facilityId,facilities,cadreIds,cadres,period,holidays, countryId,callback){
    //PROCESS
    let treatmentIds = [];

    let obj={};

    let facilityCode=facilities[facilityId].code;

    let CAF = 0;

    let publicHolidays=holidays;

    // queries
    //let concernedTreatmentsQuery= `SELECT id, ratio FROM activities WHERE `;
    let treatmentsQuery = `SELECT std_code AS id,ratio FROM country_treatment WHERE cadre_code IN(?) AND countryId=${countryId}`;
    //let treatmentsQuery = `SELECT id, ratio FROM activities WHERE id IN (SELECT activityId FROM activity_time WHERE cadreId IN(?) )`;
    let patientCountQuery = `SELECT activityCode  AS id, SUM(caseCount) AS PatientCount FROM activity_stats
                           WHERE year="${period}" AND facilityCode="${facilityCode}" GROUP BY activityCode`;

    //let timePerTreatmentQuery = `SELECT activityId, cadreId, minutesPerPatient AS TreatmentTime FROM 
                           //activity_time WHERE cadreId IN(?) GROUP BY activityId, cadreId`;

    let timePerTreatmentQuery = `SELECT std_code AS activityId, cadre_code AS cadreId, duration AS TreatmentTime FROM 
                                    country_treatment WHERE cadre_code IN(?) AND countryId=${countryId}`;//Select only for selected cadres
    
    let facilityStaffCountQuery = `SELECT id, cadreCode, staffCount AS StaffCount FROM staff
                                    WHERE  facilityCode="${facilityCode}" AND cadreCode IN(?)`;
    

    db.query(`${treatmentsQuery}; ${patientCountQuery}; ${timePerTreatmentQuery}; ${facilityStaffCountQuery};`, [cadreIds, cadreIds,cadreIds],
        function (error,results) {

            let treatmentsQueryResult = results[0];

            let patientCountQueryResult = results[1];

            let facilityStaffCountQueryResult = results[3];

            // convert results from query into a dictionary from an array
            let patientsPerTreatment = {};

            patientCountQueryResult.forEach(row => {
                patientsPerTreatment[row['id']] = row['PatientCount'];

                //treatmentIds[row['id']] = row['id'];
                treatmentIds.push(row['id']);
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
                    //let cadreHours = cadres[cadreId].hours;

                    let workHours = cadres[cadreId].hours;

                    let workDays = cadres[cadreId].days;
                    let weeklyWorkHours = workHours * workDays;

                    let cadreAdminPercentage = cadres[cadreId].adminPercentage;

                    
                    //Non working days
                    let holidays = parseInt(publicHolidays);

                    let annualLeave = parseInt(cadres[cadreId].annualLeave);

                    let sickLeave = parseInt(cadres[cadreId].sickLeave);

                    let otherLeave = parseInt(cadres[cadreId].otherLeave);

                    let nonWorkingHours = (holidays + annualLeave + sickLeave + otherLeave) * workHours;
                    //End non working days

                    CAF = 1 / (1 - (cadreAdminPercentage / 100));

                    //let hoursAWeek = weeklyWorkHours * (1 - (cadreAdminPercentage / 100));

                    //let hoursAYear = hoursAWeek * 52;

                    let hoursAYear = (weeklyWorkHours * 52) - nonWorkingHours;
      
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

                treatmentIds.forEach(treatmentId =>{
                    //let cadreCode=`"${cadreId}"`;
                    //let treatmentCode=`"${treatmentId}"`;
                    workersNeeded[cadreId] += workersNeededPerTreatment[cadreId][treatmentId];

                })
                workersNeeded[cadreId] = workersNeeded[cadreId] * CAF;
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

                workersPerTreatment[row['cadreCode']] = {};

                Object.keys(normalizedRatios).forEach(treatmentId => {

                    workersPerTreatment[row['cadreCode']][treatmentId] = row['StaffCount'] * normalizedRatios[treatmentId];
                });
            });
            
            // step 3: calculate pressure, but only for the selected treatments
            let pressure = {};

            let currentWorkers = {};

            Object.keys(workersPerTreatment).forEach(cadreId => {

                let workers = 0;

                treatmentIds.forEach(treatmentId => {
                    workers += workersPerTreatment[cadreId][treatmentId];
                });
                //workers=2;
                //currentWorkers[cadreId] = 2;
                currentWorkers[cadreId] = parseInt(workers);

                pressure[cadreId] = Number.parseFloat(workers).toFixed(2) / Number.parseFloat(workersNeeded[cadreId]).toFixed(2);
            });

            //Current workers: suggested by Pierre; simply select the available workers for the cadre
            facilityStaffCountQueryResult.forEach(row => {

                currentWorkers[row['cadreCode']] = row['StaffCount'];

                pressure[row['cadreCode']] = Number.parseInt(row['StaffCount']) / Number.parseFloat(workersNeeded[row['cadreCode']]).toFixed(2);
            });

            obj = {
                facility: facilities[facilityId].name,
                facilityId:facilityCode,
                currentWorkers: currentWorkers,
                workersNeeded: workersNeeded,
                pressure: pressure
            };
            callback(obj);
            
        });//END QUERY CALL BACK 
}

module.exports = router;
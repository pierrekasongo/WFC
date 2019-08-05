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

    let total_CAS = 0;

    let CAF = 0;

    let total_IAS = 0;

    let IAF = 0;

    let publicHolidays=holidays;

    // queries
    //let concernedTreatmentsQuery= `SELECT id, ratio FROM activities WHERE `;
    let treatmentsQuery = `SELECT ct_dhis.dhis2_code as id,ct_treat.ratio FROM country_treatment ct_treat,
                             country_treatment_dhis2 ct_dhis 
                             WHERE ct_treat.std_code = ct_dhis.treatment_code AND cadre_code IN(?) AND countryId=${countryId}`;
    //let treatmentsQuery = `SELECT id, ratio FROM activities WHERE id IN (SELECT activityId FROM activity_time WHERE cadreId IN(?) )`;
    let patientCountQuery = `SELECT activityCode  AS id, SUM(caseCount) AS PatientCount FROM activity_stats
                           WHERE year="${period}" AND facilityCode="${facilityCode}" GROUP BY activityCode,facilityCode`;

    //let timePerTreatmentQuery = `SELECT activityId, cadreId, minutesPerPatient AS TreatmentTime FROM 
                           //activity_time WHERE cadreId IN(?) GROUP BY activityId, cadreId`;

    let timePerTreatmentQuery = `SELECT ct_dhis.dhis2_code AS activityId, ct_treat.cadre_code AS cadreId, ct_treat.duration AS TreatmentTime 
                                     FROM  country_treatment ct_treat, country_treatment_dhis2 ct_dhis  
                                     WHERE ct_treat.std_code = ct_dhis.treatment_code AND cadre_code IN(?) AND countryId=${countryId}`;//Select only for selected cadres
    
    let facilityStaffCountQuery = `SELECT id, cadreCode, staffCount AS StaffCount FROM staff
                                    WHERE  facilityCode="${facilityCode}" AND cadreCode IN(?)`;

    let supportActivityQuery = `SELECT t.id, t.code, t.cadre_code, t.name, t.duration,tu.name as time_unit 
                                    FROM country_treatment_support t, time_unit tu WHERE countryId=${countryId} 
                                    AND t.time_unit=tu.id AND cadre_code IN(?)`;

    let individualActivityQuery = `SELECT t.id, t.code, t.cadre_code, t.name, t.nb_staff, t.duration,tu.name as time_unit 
                                    FROM country_treatment_individual t, time_unit tu WHERE countryId=${countryId} 
                                    AND t.time_unit=tu.id AND cadre_code IN(?)`;
    

    db.query(`${treatmentsQuery}; ${patientCountQuery}; ${timePerTreatmentQuery}; ${facilityStaffCountQuery};
                ${supportActivityQuery};${individualActivityQuery}`, 
                [cadreIds, cadreIds, cadreIds, cadreIds, cadreIds],
        function (error,results) {

            let treatmentsQueryResult = results[0];

            let patientCountQueryResult = results[1];

            let facilityStaffCountQueryResult = results[3];

            let supportActivityQueryResult = results[4];

            let individualActivityQueryResult = results[5];

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

                let workHours = cadres[cadreId].hours;

                let workDays = cadres[cadreId].days;
                
                let weeklyWorkHours = workHours * workDays;
                    
                //Non working days
                let holidays = parseInt(publicHolidays);

                let annualLeave = parseInt(cadres[cadreId].annualLeave);

                let sickLeave = parseInt(cadres[cadreId].sickLeave);

                let otherLeave = parseInt(cadres[cadreId].otherLeave);

                let nonWorkingHours = (holidays + annualLeave + sickLeave + otherLeave) * workHours;
                
                let hoursAYear = (weeklyWorkHours * 52) - nonWorkingHours;//Available Working Time

                //Category allowance factor

                let supportActivities = supportActivityQueryResult.filter(val => val['cadre_code'] == cadreId);

                let factor = 0;

                supportActivities.forEach(sa =>{

                    if(sa.time_unit === 'min/day'){

                        factor = ((sa.duration/60)/workHours)*100;

                    }else if(sa.time_unit === 'min/week'){

                        factor = ((sa.duration/60)/weeklyWorkHours)*100;

                    }else if(sa.time_unit === 'min/month'){

                        factor = (((sa.duration/60)*12)/hoursAYear)*100;
                    }else{
                        factor = ((sa.duration/60)/hoursAYear)*100
                    }
                    total_CAS+=factor;
                })

                CAF = 1 / (1 - (total_CAS / 100));

                //Individual allowance factor
                let individualsActivities = individualActivityQueryResult.filter(val => val['cadre_code'] == cadreId);

                let fact = 0;

                individualsActivities.forEach(ind => {

                    let duration = ind.duration * ind.nb_staff;

                    if(ind.time_unit === 'min/day'){

                        fact = (duration/60) * (hoursAYear/workHours);

                    }else if(ind.time_unit === 'min/week'){

                        fact = (duration/60) * 52;

                    }else if(ind.time_unit === 'min/month'){

                        fact = (duration/60) * 12;
                    }else{
                        fatc = (duration/60);
                    }
                    total_IAS+=fact;
                })
                
                IAF = total_IAS/hoursAYear;

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


                    //CAF = 1 / (1 - (cadreAdminPercentage / 100));

      
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

                if(workersNeeded[cadreId] > 0){

                    workersNeeded[cadreId] = (workersNeeded[cadreId] * CAF) + IAF;
                }
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

            /*Object.keys(workersPerTreatment).forEach(cadreId => {

                let workers = 0;

                treatmentIds.forEach(treatmentId => {
                    workers += workersPerTreatment[cadreId][treatmentId];
                });
                //workers=2;
                //currentWorkers[cadreId] = 2;
                currentWorkers[cadreId] = parseInt(workers);

                pressure[cadreId] = Number.parseFloat(workers).toFixed(2) / Number.parseFloat(workersNeeded[cadreId]).toFixed(2);
            });*/

            //Current workers: suggested by Pierre; simply select the available workers for the cadre
            facilityStaffCountQueryResult.forEach(row => {

                currentWorkers[row['cadreCode']] = row['StaffCount'];

                let needed = Number.parseFloat(workersNeeded[row['cadreCode']]);

                pressure[row['cadreCode']] = (Number.parseFloat(row['StaffCount']) / needed).toFixed(2);

                if(!isFinite(pressure[row['cadreCode']])){
                    pressure[row['cadreCode']] = 0;
                }
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
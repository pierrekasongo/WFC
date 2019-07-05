import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import Multiselect from 'react-multiselect-checkboxes';

import toastr from 'toastr';
import 'toastr/build/toastr.min.css';


import ResultComponent from './ResultComponent';

export default class CalculationPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            facilitiesCombo: [],
            cadresCombo: [],
            cadres: [],
            cadreDict: {},
            cadreInputs: {},
            facilityInputs: {},
            facilityDict: {},
            facilities: [],
            years: [],//Save years to db
            selectedPeriod: "",
            selectedFacility: "",
            selectedFacilities: {},
            selectedCadres: {},
            //selectedFacility: 0,
            treatments: [],
            treatmentsSelected: {},
            cadresSelected: {},
            treatmentFilter: "",
            cadreFilter: "",
            facilityFilter: "",
            treatmentToggle: true,
            cadreToggle: true,
            facilityToggle: true,
            state: 'form',
            results: [],
            printable: [],
            data: [],
            config: {},
        };
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.selectMultipleCadres = this.selectMultipleCadres.bind(this);

        axios.get(`/configuration/getCountryHolidays/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let config = {};

            res.data.forEach(cf => {

                config = {
                    id: cf.id,
                    parameter: cf.parameter,
                    value: cf.value
                }
            })
            this.setState({ config: config });
        }).catch(err => console.log(err));

        axios.get('/configuration/getYears',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            let years = res.data;
            this.setState({
                years: years
            })
        }).catch(err => console.log(err));

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            let cadres = res.data;
            let cadreInputs = {};
            let cadreDict = {};

            let cadresCombo = [];

            cadres.forEach(cadre => {
                let days = cadre.work_days;
                let hours = cadre.work_hours;
                let admin = cadre.admin_task;
                //Non working days
                let annual_leave = cadre.annual_leave;
                let sick_leave = cadre.sick_leave;
                let other_leave = cadre.other_leave;

                cadreInputs[cadre.std_code] = {
                    days: days,
                    hours: hours,
                    adminPercentage: admin,
                    annualLeave: annual_leave,
                    sickLeave: sick_leave,
                    otherLeave: other_leave
                }
                cadreDict[cadre.std_code] = cadre.name;

                //let id = cadre.code + '|' + cadre.Hours + '|' + cadre.AdminTask

                cadresCombo.push({ label: cadre.name, value: cadre.std_code });
            });
            this.setState({
                cadres: cadres,
                cadreDict: cadreDict,
                cadreInputs: cadreInputs,
                cadresCombo: cadresCombo,
            });

        }).catch(err => console.log(err));

        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

                let facilities = res.data;

                let facilityInputs = {};

                let facilityDict = {};

                let facilitiesCombo = [];

                facilities.forEach(fa => {

                    facilityInputs[fa.id] = {
                        name: fa.name,
                        code: fa.code
                    }
                    facilityDict[fa.id] = fa.name;

                    let id = fa.id + '|' + fa.code;

                    facilitiesCombo.push({ label: fa.name, value: id });
                });
                this.setState({
                    facilities: facilities,
                    facilityDict: facilityDict,
                    facilityInputs: facilityInputs,
                    facilitiesCombo: facilitiesCombo
                });
            })
            .catch(err => console.log(err));

    }

    selectMultipleCadres(values) {

        let selectedCadres = {};

        let cadreInputs = this.state.cadreInputs;

        values.forEach(val => {
            let name = val.label;
            let id = val.value;
            let days = cadreInputs[id].days;
            let hours = cadreInputs[id].hours;
            let adminPerc = cadreInputs[id].adminPercentage;
            let annualLeave = cadreInputs[id].annualLeave;
            let sickLeave = cadreInputs[id].sickLeave;
            let otherLeave = cadreInputs[id].otherLeave;

            selectedCadres[id] = {
                days: days,
                hours: parseFloat(hours),
                adminPercentage: parseFloat(adminPerc),
                annualLeave: annualLeave,
                sickLeave: sickLeave,
                otherLeave: otherLeave,
            };
        })
        this.setState({ selectedCadres: selectedCadres });
    }

    selectMultipleFacilities(values) {

        let selectedFacilities = {};

        values.forEach(val => {

            let name = val.label;
            let ident = val.value.split("|");
            let id = ident[0];
            let code = ident[1];

            selectedFacilities[id] = {
                id: id,
                code: code,
                name: name
            };
        })
        this.setState({ selectedFacilities: selectedFacilities });
    }

    facilityCheckboxChanged(id) {

        let facilityInputs = this.state.facilityInputs;

        facilityInputs[id] = !facilityInputs[id];

        this.setState({ facilityInputs: facilityInputs });

        //console.log(this.state.facilityInputs);
    }
    toggleTreatments() {
        let treatmentToggle = !this.state.treatmentToggle;
        let treatmentsSelected = this.state.treatmentsSelected;
        this.state.treatments.forEach(treatment => {
            treatmentsSelected[treatment.id] = treatmentToggle;
        })

        this.setState({
            treatmentToggle: treatmentToggle,
            treatmentsSelected: treatmentsSelected
        });
    }

    toggleCadres(e) {
        e.preventDefault();
        let cadreToggle = !this.state.cadreToggle;
        let cadreInputs = this.state.cadreInputs;
        this.state.cadres.forEach(cadre => {
            cadreInputs[cadre.id] = cadreToggle;
        })

        this.setState({
            cadreToggle: cadreToggle,
            cadreInputs: cadreInputs
        });
    }
    toggleFacilities(e) {
        e.preventDefault();
        let facilityToggle = !this.state.facilityToggle;
        let facilityInputs = this.state.facilityInputs;
        this.state.facilities.forEach(facility => {
            facilityInputs[facility.id] = facilityToggle;
        })

        this.setState({
            facilityToggle: facilityToggle,
            facilityInputs: facilityInputs
        });
    }

    calculateClicked() {

        if (this.state.selectedPeriod.length == 0) {
            this.launchToastr("Please, select a year first before calculating.");
            return;
        }
        if (typeof (this.state.selectedFacilities) == 'undefined') {
            this.launchToastr("No facility selected.");
            return;
        }
        //ALSO TEST facilities and cadres to make sure they are not empty

        this.setState({ results: [] }, () => {  //here
            // set state to loading
            this.setState({ state: 'loading' });

            let printable = [];
            // add timeout so loading animation looks better
            setTimeout(() => {
                let selectedFacilities = {};

                let datas = {
                    cadres: {},
                    holidays: this.state.config.value,
                    selectedFacilities: {},
                    selectedPeriod: this.state.selectedPeriod,
                    countryId : localStorage.getItem('countryId')
                };

                datas.selectedCadres = this.state.selectedCadres;
                datas.selectedFacilities = this.state.selectedFacilities;

                axios.post(`/hris/calculate_pressure`, datas,{
                    headers :{
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {

                    let values = res.data;

                    Object.keys(values).forEach(id => {

                        this.state.results.push({

                            facility: values[id].facility,

                            facilityId: values[id].facilityId,

                            currentWorkers: values[id].currentWorkers,

                            workersNeeded: values[id].workersNeeded,

                            pressure: values[id].pressure
                        })
                    });
                    this.setState({ state: 'results' });
                })

            }, 1000);
        });
    }

    processResult() {

        let results = this.state.results;

        let printable = [];

        Object.keys(results).forEach(id => {

            let facility = "";

            let cadre = "";

            let curr_workers = "";

            let needed_workers = "";

            let pressure = "";

            Object.keys(results[id].workersNeeded).map(cadreId => {

                cadre = this.state.cadreDict[cadreId];
                curr_workers = (results[id].currentWorkers[cadreId]) ? results[id].currentWorkers[cadreId].toString() : '0';
                needed_workers = (results[id].currentWorkers[cadreId]) ? results[id].currentWorkers[cadreId].toString() : '0';
                pressure = (results[id].pressure[cadreId]) ? Number(results[id].pressure[cadreId]).toFixed(2).toString() : '0';

                facility = (facility == results[id].facility) ? "" : results[id].facility;

                printable.push({
                    facility: facility,
                    cadre: cadre,
                    currentWorkers: curr_workers,
                    workersNeeded: needed_workers,
                    pressure: pressure
                });
            });
        });
        this.setState({
            //printable:printable,
            state: 'results'
        });

    }

    launchToastr(msg) {
        toastr.options = {
            positionClass: 'toast-top-full-width',
            hideDuration: 15,
            timeOut: 6000
        }
        toastr.clear()
        setTimeout(() => toastr.error(msg), 300)
    }

    render() {
        return (
        <div>
            <Panel bsStyle="primary" header="Pressure Calculation">
                <div className="calc-container">
                    <div className="calc-container-left">
                        <Form horizontal>
                            <div className="div-title">
                                <b>Set calculation values</b>
                            </div>
                            <hr />
                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={10}>
                                    <b>Year</b>
                                </Col>

                                <Col sm={15}>
                                    <FormControl componentClass="select"
                                        onChange={e => this.setState({ selectedPeriod: e.target.value })}>
                                        <option key="000" value="000">Select year </option>
                                        {(this.state.years.map(yr =>
                                            <option key={yr.id} value={yr.year}>{yr.year}</option>
                                        ))}
                                    </FormControl>
                                </Col>
                            </FormGroup>
                            
                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={10}>
                                    <b>Facilities({(this.state.facilitiesCombo.length)})</b>
                                </Col>
                                <Col sm={15}>
                                    <div className="div-multiselect">
                                        <Multiselect
                                            options={this.state.facilitiesCombo}
                                            onChange={this.selectMultipleFacilities} />
                                    </div>

                                </Col>
                            </FormGroup>
                            
                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={10}>
                                    <b>Cadres</b>
                                </Col>
                                <Col sm={15}>
                                    <div className="div-multiselect">
                                        <Multiselect
                                            options={this.state.cadresCombo}
                                            onChange={this.selectMultipleCadres} />
                                    </div>
                                </Col>
                            </FormGroup>
                            <hr />
                            <div style={{ textAlign: "right", paddingTop: 10 }}>
                                <Button bsStyle="warning" bsSize="medium" onClick={() => this.calculateClicked()}>Calculate pressure</Button>
                            </div>
                            <br />
                        </Form>
                    </div>
                    <div className="calc-container-right">
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={20}>
                                <div className="div-title">
                                    <b>Workforce pressure calculation results</b>
                                </div>
                            </Col>
                            <hr/>
                        </FormGroup>
                        {this.state.state == 'loading' &&
                            <div style={{ marginTop: 120, marginBottom: 65 }}>
                                <div className="loader"></div>
                            </div>
                        }
                        {this.state.state == 'results' &&
                            <ResultComponent
                                results={this.state.results}
                                cadreDict={this.state.cadreDict}
                            />
                        }
                    </div>
                </div>
            </Panel>
        </div>

        );

    }
};
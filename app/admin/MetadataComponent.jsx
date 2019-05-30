import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Row, Radio, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';
import { Route, Redirect, Switch, Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import InlineEdit from 'react-edit-inline2';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaTrash, FaCloudUploadAlt, FaCheck, FaPlusSquare, FaCapsules, FaUserMd, FaGlobe, FaEdit,FaClinicMedical } from 'react-icons/fa';

import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import StdNewCadreComponent from './StdNewCadreComponent';
import StdNewTreatmentComponent from './StdNewTreatmentComponent';
import CountryComponent from './CountryComponent';
import FacilityTypeComponent from './FacilityTypeComponent';

export default class MetadataComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cadres: [],
            treatments: [],
            facilityTypes:[],
            cadreCode: '',
            progress: '',
            cadreToDelete: '',
            treatmentToDelete: '',
            showingNewCadre: false,
            showingNewTreatment: false,
            selectedCadre: {},
            isEditCadre: false
        };
        this.handleUploadCadre = this.handleUploadCadre.bind(this);
        this.handleUploadTreatment = this.handleUploadTreatment.bind(this);
        this.deleteCadre = this.deleteCadre.bind(this);
        this.deleteTreatment = this.deleteTreatment.bind(this);

        axios.get('/metadata/facilityTypes').then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));

        axios.get('/metadata/cadres').then(res => {
            this.setState({ cadres: res.data });
        }).catch(err => {
            console.log(err);
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });

        axios.get('/metadata/treatments').then(res => {
            this.setState({ treatments: res.data });
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });

        axios.get('/metadata/countries').then(res => {
            this.setState({ countries: res.data });
        }).catch(err => {
            console.log(err);
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    deleteCadre(code) {

        this.setState({
            cadreToDelete: code
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this cadre?
                  This will also delete all treatments affected to this cadre.</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                  <button
                            onClick={() => {

                                axios.delete(`/metadata/deleteCadre/${this.state.cadreToDelete}`)
                                    .then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/cadres').then(res => {
                                            this.setState({ cadres: res.data });
                                        }).catch(err => console.log(err));
                                        //Update treatments 
                                        axios.get('/metadata/treatments').then(res => {
                                            this.setState({ treatments: res.data });
                                        }).catch(err => console.log(err));

                                    }).catch(err => {
                                        if (err.response.status === 401) {
                                            this.props.history.push(`/login`);
                                        } else {
                                            console.log(err);
                                        }
                                    });
                                onClose();
                            }}>
                            Yes, Delete it!
                  </button>
                    </div>
                );
            }
        });
    }

    deleteTreatment(code) {

        this.setState({
            treatmentToDelete: code
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this treatment?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                  <button
                            onClick={() => {

                                axios.delete(`/metadata/deleteTreatment/${this.state.treatmentToDelete}`)
                                    .then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/treatments').then(res => {
                                            this.setState({ treatments: res.data });
                                        }).catch(err => console.log(err));
                                    }).catch(err => {
                                        if (err.response.status === 401) {
                                            this.props.history.push(`/login`);
                                        } else {
                                            console.log(err);
                                        }
                                    });
                                onClose();
                            }}>
                            Yes, Delete it!
                  </button>
                    </div>
                );
            }
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

    handleUploadTreatment(ev) {

        ev.preventDefault();

        const data = new FormData();

        if (this.uploadTreatmentInput.files.length == 0) {
            this.launchToastr("No file selected");
            return;
        }
        data.append('file', this.uploadTreatmentInput.files[0]);

        axios.post('/metadata/uploadTreatments', data,
            {
                onUploadProgress: progressEvent => {
                    var prog = (progressEvent.loaded / progressEvent.total) * 100;
                    var pg = (prog < 100) ? prog.toFixed(2) : prog.toFixed(0);
                    this.setState({ progress: pg });
                    //console.log(pg+"%");
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/metadata/treatments').then(res => {
                    this.setState({ treatments: res.data });
                }).catch(err => console.log(err));

            }).catch(err => {
                if (err.response.status === 401) {
                    this.props.history.push(`/login`);
                } else {
                    console.log(err);
                }
            });
    }

    handleUploadCadre(ev) {

        ev.preventDefault();

        const data = new FormData();

        if (this.uploadCadreInput.files.length == 0) {
            this.launchToastr("No file selected");
            return;
        }

        data.append('file', this.uploadCadreInput.files[0]);

        axios.post('/metadata/uploadCadres', data,
            {
                onUploadProgress: progressEvent => {
                    var prog = (progressEvent.loaded / progressEvent.total) * 100;
                    var pg = (prog < 100) ? prog.toFixed(2) : prog.toFixed(0);
                    this.setState({ progress: pg });
                    //console.log(pg+"%");
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/metadata/cadres').then(res => {
                    this.setState({ cadres: res.data });
                }).catch(err => console.log(err));

            }).catch(err => {
                if (err.response.status === 401) {
                    this.props.history.push(`/login`);
                } else {
                    console.log(err);
                }
            });
    }

    filterTreatement(cadreCode) {

        this.setState({ showingNewTreatment: false });

        axios.get(`/metadata/treatments/${cadreCode}`).then(res => {
            this.setState({ treatments: res.data });
        }).catch(err => {
            console.log(err);
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }
    validateNumericValue(value) {

    }
    validateTextValue(text) {
        return (text.length > 0 && text.length < 64);
    }

    handleCadreChange(obj) {

        const ident = Object.keys(obj)[0].split("|");

        const code = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        console.log(code, param, value);

        let data = {
            code: code,
            param: param,
            value: value,
        };
        axios.patch('/metadata/editCadre', data).then(res => {

            console.log('Value updated successfully');

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    handleTreatmentChange(obj) {

        const ident = Object.keys(obj)[0].split("|");

        const code = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            code: code,
            param: param,
            value: value,
        };
        axios.patch('/metadata/editTreatment', data).then(res => {

            console.log('Value updated successfully');

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    newCadreSave(info) {

        let code = info.code;
        let name_fr = info.name_fr;
        let name_en = info.name_en;
        let worktime = info.worktime;
        let admin_task = info.admin_task;

        let data = {
            code: code,
            name_fr: name_fr,
            name_en: name_en,
            worktime: worktime,
            admin_task: admin_task
        };
        //Insert cadre in the database
        axios.post('/metadata/insertCadre', data).then(res => {
            //Update the cadres list
            axios.get('/metadata/cadres').then(res => {
                this.setState({
                    cadres: res.data,
                    showingNewCadre: false
                });
            }).catch(err => console.log(err));

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    clickCadreEdit(cadreCode) {

        axios.get(`/metadata/getCadre/${cadreCode}`).then(res => {

            let cadre = res.data[0];

            let selectedCadre = {};

            selectedCadre = {
                code: cadre.code,
                name_fr: cadre.name_fr,
                name_en: cadre.name_en,
                worktime: cadre.worktime,
                admin_task: cadre.admin_task
            }
            this.setState({
                isEditCadre: true,
                selectedCadre: selectedCadre,
                showingNewCadre: true,

            });
            console.log(this.selectedCadre);
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    newTreatmentSave(info) {

        let code = info.code;
        let facility_type = info.facility_type;
        let cadre_code = info.cadre_code;
        let name_fr = info.name_fr;
        let name_en = info.name_en;
        let duration = info.duration;

        let data = {
            code: code,
            facility_type: facility_type,
            cadre_code: cadre_code,
            name_fr: name_fr,
            name_en: name_en,
            duration: duration
        };

        //Insert cadre in the database
        axios.post('/metadata/insertTreatment', data).then(res => {
            //Update the cadres list
            axios.get('/metadata/treatments').then(res => {
                this.setState({
                    treatments: res.data,
                    showingNewTreatment: false
                });
            }).catch(err => console.log(err));

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    render() {
        return (
            <Panel bsStyle="primary" header="Metadata configuration">
                <Tabs>
                    <TabList>
                        <Tab><FaUserMd /> Standard cadres</Tab>
                        <Tab><FaClinicMedical /> Standard facility types</Tab>
                        <Tab><FaCapsules /> Standard treatments</Tab>                      
                        <Tab><FaGlobe /> Countries</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="tab-main-container">
                            <div className="div-title">
                                Available standard cadres ({this.state.cadres.length})
                            </div>
                            <hr />
                            <div className="div-table">
                                <div className="div-add-new-link">
                                    <a href="#" className="add-new-link" onClick={() => this.setState({ showingNewCadre: true, isEditCadre: false, selectedCadre: '' })}>
                                        <FaPlusSquare /> Add new
                                    </a>
                                </div>
                                <br />
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>Code | </th>
                                            <th>Name (fr) | </th>
                                            <th>Name (en) | </th>
                                            <th>Days per week | </th>
                                            <th>Hours per day | </th>
                                            <th>Annual leave | </th>
                                            <th>Sick leave | </th>
                                            <th>Other leave | </th>
                                            <th>Admin task (%)</th>
                                            <th colSpan="2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.showingNewCadre &&
                                            <StdNewCadreComponent
                                                cadre={this.state.selectedCadre}
                                                isEditCadre={this.state.isEditCadre}
                                                save={info => this.newCadreSave(info)}
                                                cancel={() => this.setState({ showingNewCadre: false })} />
                                        }
                                        {this.state.cadres.map(cadre =>
                                            <tr key={cadre.id} >
                                                <td>
                                                    {cadre.code}
                                                </td>
                                                <td>
                                                    {/*cadre.name_fr*/}
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={cadre.name_fr}
                                                                paramName={cadre.code + '|name_fr'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    /*backgroundColor: 'yellow',*/
                                                                    minWidth: 150,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    {/*cadre.name_en*/}
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={cadre.name_en}
                                                                paramName={cadre.code + '|name_en'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    /*backgroundColor: 'yellow',*/
                                                                    minWidth: 150,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.work_days}
                                                                paramName={cadre.code + '|work_days'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.work_hours}
                                                                paramName={cadre.code + '|work_hours'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.annual_leave}
                                                                paramName={cadre.code + '|annual_leave'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.sick_leave}
                                                                paramName={cadre.code + '|sick_leave'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.other_leave}
                                                                paramName={cadre.code + '|other_leave'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={"" + cadre.admin_task}
                                                                paramName={cadre.code + '|admin_task'}
                                                                change={this.handleCadreChange}
                                                                style={{
                                                                    minWidth: 50,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td colSpan="3">
                                                    <a href="#" onClick={() => this.deleteCadre(`"${cadre.code}"`)}>
                                                        <FaTrash />
                                                    </a>
                                                    {/*<a href="#" onClick={() => this.clickCadreEdit(`"${cadre.code}"`)}>
                                                        <FaEdit />
                                                    </a>*/}
                                                </td>
                                            </tr>
                                        )}

                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <Form horizontal>
                                <div>
                                    <div className="div-title">
                                        Import from csv file
                                    </div>
                                    <div class="alert alert-warning" role="alert">
                                        Make sure it's a csv file with following headers and order. <br />
                                        Also note that every duplicate code will update the existing value.<br />
                                        <b>"Code", "Name fr", "Name en", "Days per week", "Hours per day",
                                             "Annual leave", "Sick leave", " Other leave", "Admin. task (%)"
                                        </b>
                                    </div>
                                    <form onSubmit={this.handleUploadCadre}>
                                        {/*<div>
                                            <input ref={(ref) => { this.uploadCadreInput = ref; }} type="file" />
                                        </div>*/}
                                        <div class="upload-btn-wrapper">
                                            <button class="btn"><FaCloudUploadAlt /> Choose file...</button>
                                            <input ref={(ref) => { this.uploadCadreInput = ref; }} type="file" />
                                        </div>
                                        <br />
                                        <br />
                                        <div>
                                            <span>
                                                <button className="button"><FaCheck /> Upload file</button><span> {this.state.progress}</span>
                                            </span>
                                        </div>
                                    </form>

                                </div>
                            </Form >
                        </div>
                    </TabPanel>

                    <TabPanel>
                        <FacilityTypeComponent />
                    </TabPanel>

                    <TabPanel>
                        <div className="tab-main-container">
                            <div className="div-title">
                                Available standard treatments ({this.state.treatments.length})
                            </div>
                            <FormGroup>
                                <Col sm={10}>
                                    <FormControl
                                        componentClass="select"
                                        onChange={e => this.filterTreatement(e.target.value)}>
                                        <option value="0" key="000">Filter by cadre</option>
                                        {this.state.cadres.map(cadre =>
                                            <option
                                                key={cadre.code}
                                                value={cadre.code}>
                                                {cadre.name_fr + '/' + cadre.name_en}
                                            </option>
                                        )}
                                    </FormControl>
                                </Col>
                            </FormGroup>
                            <hr />
                            <div className="div-table">
                                <div className="div-add-new-link">
                                    <a href="#" className="add-new-link" onClick={() => this.setState({ showingNewTreatment: true })}>
                                        <FaPlusSquare /> Add new
                                    </a>
                                </div>
                                <br />
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>Facility type</th>
                                            <th>Cadre</th>
                                            <th>Name (fr)</th>
                                            <th>Name (en)</th>
                                            <th>duration (min)</th>
                                            <th colSpan="2">
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {
                                            this.state.showingNewTreatment &&
                                            <StdNewTreatmentComponent
                                                facilityTypes={this.state.facilityTypes}
                                                cadres={this.state.cadres}
                                                save={info => this.newTreatmentSave(info)}
                                                cancel={() => this.setState({ showingNewTreatment: false })} />
                                        }
                                        {this.state.treatments.map(treatment =>

                                            <tr key={treatment.code} >
                                                <td>
                                                    {treatment.facility_type}
                                                </td>
                                                <td>
                                                    {treatment.cadre}
                                                </td>
                                                <td>
                                                    {/*treatment.name_fr*/}
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={treatment.name_fr}
                                                                paramName={treatment.code + '|name_fr'}
                                                                change={this.handleTreatmentChange}
                                                                style={{
                                                                    /*backgroundColor: 'yellow',*/
                                                                    minWidth: 150,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    {/*treatment.name_en*/}
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={treatment.name_en}
                                                                paramName={treatment.code + '|name_en'}
                                                                change={this.handleTreatmentChange}
                                                                style={{
                                                                    /*backgroundColor: 'yellow',*/
                                                                    minWidth: 150,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td>
                                                    {/*treatment.duration*/}
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={`` + treatment.duration}
                                                                paramName={treatment.code + '|duration'}
                                                                change={this.handleTreatmentChange}
                                                                style={{
                                                                    /*backgroundColor: 'yellow',*/
                                                                    minWidth: 150,
                                                                    display: 'inline-block',
                                                                    margin: 0,
                                                                    padding: 0,
                                                                    fontSize: 11,
                                                                    outline: 0,
                                                                    border: 0
                                                                }}
                                                            />
                                                        </a>
                                                    </div>
                                                </td>
                                                <td colSpan="2">
                                                    <a href="#" onClick={() => this.deleteTreatment(`${treatment.code}`)}>
                                                        <FaTrash />
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                            <hr />
                            <Form horizontal>
                                <div>
                                    <div className="div-title">
                                        Import from csv file.
                                    </div>
                                    <div class="alert alert-warning" role="alert">
                                        Make sure it's a csv file with following headers and order. <br />
                                        Also note that every duplicate code will update the existing value.<br />
                                        <b>"Code", "Cadre code","Name fr", "Name en","duration(min)"</b>
                                    </div>
                                    <form onSubmit={this.handleUploadTreatment}>
                                        {/*<div>
                                            <input ref={(ref) => { this.uploadTreatmentInput = ref; }} type="file" id="file" className="inputfile"/>
                                            <label for="file">Choose a file</label>
                                        </div>*/}
                                        <div class="upload-btn-wrapper">
                                            <button class="btn"><FaCloudUploadAlt /> Upload a file...</button>
                                            <input ref={(ref) => { this.uploadTreatmentInput = ref; }} type="file" name="myfile" />
                                        </div>
                                        <br />
                                        <div>
                                            <span>
                                                <button className="button"><FaCheck /> Upload file</button><span> {this.state.progress}</span>
                                            </span>
                                        </div>
                                    </form>

                                </div>
                            </Form >
                        </div>
                    </TabPanel>
                    <TabPanel>
                        <CountryComponent countries={this.state.countries} />
                    </TabPanel>
                </Tabs>
                <br />
                <br />
            </Panel>
        )
    }
};
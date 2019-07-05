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

import StdNewTreatmentComponent from './StdNewTreatmentComponent';

export default class TreatmentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            treatmentToDelete: '',
            showingNewTreatment: false,
            cadres: this.props.cadres,
            filteredCadres : [],
            treatments : this.props.treatments,
            filteredTreatments: this.props.treatments,
        };
        this.handleUploadTreatment = this.handleUploadTreatment.bind(this);
        this.deleteTreatment = this.deleteTreatment.bind(this);
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

                                axios.delete(`/metadata/deleteTreatment/${this.state.treatmentToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/treatments',{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
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
        axios.patch('/metadata/editTreatment', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            console.log('Value updated successfully');

        }).catch(err => console.log(err));
    }

    validateTextValue(text) {
        return (text.length > 0 && text.length < 64);
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

    newTreatmentSave(info) {

        let code = info.code;
        let cadre_code = info.cadre_code;
        let name_fr = info.name_fr;
        let name_en = info.name_en;
        let duration = info.duration;

        let data = {
            code: code,
            cadre_code: cadre_code,
            name_fr: name_fr,
            name_en: name_en,
            duration: duration
        };

        //Insert cadre in the database
        axios.post('/metadata/insertTreatment', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            //Update the cadres list
            axios.get('/metadata/treatments',{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({
                    treatments: res.data,
                    showingNewTreatment: false
                });
            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
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
            },{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/metadata/treatments',{
                    headers :{
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {
                    this.setState({ treatments: res.data });
                }).catch(err => console.log(err));

            }).catch(err => console.log(err));
    }

    filterTreatement(cadreCode) {

        let treatments = this.state.treatments;
        
        if(cadreCode === "0"){
            this.setState({filteredTreatments:treatments});
        }else{

            let filtered = treatments.filter(tr => tr.cadre_code.includes(cadreCode));

            this.setState({filteredTreatments: filtered});
        }
    }

    filterCadreByFaType(faTypeCode){

        let cadres = this.state.cadres;
        
        if(faTypeCode === "0"){
            this.setState({filteredCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCadres: filtered});
        }
    }

    render() {
        return (
                    <div className="tab-main-container">
                            <div className="div-title">
                                Available standard treatments ({this.state.filteredTreatments.length})
                            </div>
                            <br/>
                            <FormGroup>
                                            <table className="tbl-multiselect">
                                                <tr>
                                                    <td><b>Select facility type</b></td>
                                                    <td>
                                                        <FormGroup>
                                                            <Col sm={10}>
                                                                <FormControl
                                                                    componentClass="select"
                                                                    onChange={e => this.filterCadreByFaType(e.target.value)}>
                                                                    <option value="0" key="000">Filter by facility type</option>
                                                                    {this.props.facilityTypes.map(ft =>
                                                                        <option
                                                                            key={ft.id}
                                                                            value={ft.code}>
                                                                            {ft.name_fr+'/'+ft.name_en}
                                                                        </option>
                                                                    )}
                                                                </FormControl>
                                                            </Col>
                                                        </FormGroup>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><b>Filter by cadre</b></td>
                                                    <td>
                                                        <FormGroup>
                                                            <Col sm={10}>
                                                                <FormControl
                                                                    componentClass="select"
                                                                    onChange={e => this.filterTreatement(e.target.value)}>
                                                                    <option key="000" value="0">Filter by cadre</option>
                                                                    {this.state.filteredCadres.map(cd =>
                                                                        <option key={cd.code} value={cd.code}>{cd.name_fr+'/'+cd.name_en}</option>
                                                                    )}
                                                                </FormControl>
                                                            </Col>
                                                        </FormGroup>
                                                    </td>
                                                </tr>
                                            </table>
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
                                                cadres={this.state.cadres}
                                                save={info => this.newTreatmentSave(info)}
                                                cancel={() => this.setState({ showingNewTreatment: false })} />
                                        }
                                        {this.state.filteredTreatments.map(treatment =>

                                            <tr key={treatment.code} >
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
        )
    }
};
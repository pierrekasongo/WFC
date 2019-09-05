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
import TreatmentComponent from './TreatmentComponent';
import CountryComponent from './CountryComponent';
import FacilityTypeComponent from './FacilityTypeComponent';

export default class MetadataComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            cadres: [],
            filteredCadres:[],
            treatments: [],
            cadreCode: '',
            progress: '',
            cadreToDelete: '',
            treatmentToDelete: '',
            showingNewCadre: false,
            selectedCadre: {},
            isEditCadre: false,
            facilityTypes: [],
            showFilters:false
        };
        this.handleUploadCadre = this.handleUploadCadre.bind(this);
        this.deleteCadre = this.deleteCadre.bind(this);
        

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));

        axios.get('/metadata/cadres',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                cadres: res.data,
                filteredCadres: res.data
            });
        }).catch(err => {
            console.log(err);
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });

        axios.get('/metadata/treatments',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({treatments: res.data});
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });

        axios.get('/metadata/countries',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ countries: res.data });
        }).catch(err => console.log(err)); 
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

                                axios.delete(`/metadata/deleteCadre/${this.state.cadreToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/cadres',{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            this.setState({ cadres: res.data });
                                        }).catch(err => console.log(err));
                                        //Update treatments 
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

    launchToastr(msg) {
        toastr.options = {
            positionClass: 'toast-top-full-width',
            hideDuration: 15,
            timeOut: 6000
        }
        toastr.clear()
        setTimeout(() => toastr.error(msg), 300)
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
            },{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/metadata/cadres',{
                    headers :{
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {
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

        let data = {
            code: code,
            param: param,
            value: value,
        };
        axios.patch('/metadata/editCadre', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

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

        let data = {
            code: code,
            name_fr: name_fr,
            name_en: name_en,
            worktime: worktime
        };
        //Insert cadre in the database
        axios.post('/metadata/insertCadre', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            //Update the cadres list
            axios.get('/metadata/cadres',{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
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

        axios.get(`/metadata/getCadre/${cadreCode}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let cadre = res.data[0];

            let selectedCadre = {};

            selectedCadre = {
                code: cadre.code,
                name_fr: cadre.name_fr,
                name_en: cadre.name_en,
                worktime: cadre.worktime
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
            <div>
            <Panel bsStyle="primary" header="">
                <Tabs>
                    <TabList>
                        <Tab>
                            <h6 class="m-b-20"><FaUserMd /> Standard cadres</h6>
                        </Tab>
                        <Tab>
                            <h6 class="m-b-20"><FaClinicMedical /> Standard facility types</h6>
                        </Tab>
                        <Tab>
                            <h6 class="m-b-20"><FaCapsules /> Standard treatments</h6>
                        </Tab>                      
                        <Tab>
                             <h6 class="m-b-20"><FaGlobe /> Countries</h6>
                        </Tab>
                    </TabList>

                    <TabPanel>
                        <div className="tab-main-container">
                            <div className="div-title">
                                <b>Available standard cadres</b>
                            </div>
                            <hr />
                            <div>
                            <a href="#" onClick={() => this.setState({showFilters : !this.state.showFilters})} >
                                Show/Hide filters
                            </a>
                            {this.state.showFilters && 
                             <table className="tbl-multiselect">
                                <tr>
                                    <td>
                                        <b>Filter by facility type</b>
                                    </td>
                                    <td>
                                        <FormGroup>
                                            <Col sm={15}>
                                                <FormControl
                                                    componentClass="select"
                                                    onChange={e => this.filterCadreByFaType(e.target.value)}>
                                                        <option value="0" key="000">
                                                            Filter by facility type
                                                        </option>
                                                        {this.state.facilityTypes.map(ft =>
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
                                </table>
                                }
                            </div>
                            <br/>
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
                                            <th>Code</th>
                                            <th>Name (fr)</th>
                                            <th>Name (en)</th>
                                            <th>Days per week</th>
                                            <th>Hours per day</th>
                                            <th>Annual leave</th>
                                            <th>Sick leave</th>
                                            <th>Other leave</th>
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
                                        {this.state.filteredCadres.map(cadre =>
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
                                             "Annual leave", "Sick leave", " Other leave"
                                        </b>
          
                                    </div>
                                    <form onSubmit={this.handleUploadCadre}>
                                        {/*<div>
                                            <input ref={(ref) => { this.uploadCadreInput = ref; }} type="file" />
                                        </div>*/}
                                        <div class="upload-btn-wrapper">
                                            <button class="btn">
                                                <FaCloudUploadAlt /> Choose a file...
                                            </button>
                                            <input ref={(ref) => { this.uploadCadreInput = ref; }} type="file" />
                                        </div>
                                        <br />
                                        <br />
                                        <div>
                                            <span>
                                                <button className="button">
                                                    <FaCheck /> Upload file
                                                </button><span> {this.state.progress}</span>
                                            </span>
                                        </div>
                                    </form>

                                </div>
                            </Form >
                        
                    </TabPanel>

                    <TabPanel>
                        <FacilityTypeComponent facilityTypes={this.state.facilityTypes}/>
                    </TabPanel>

                    <TabPanel>
                        <TreatmentComponent 
                            facilityTypes={this.state.facilityTypes}
                            treatments={this.state.treatments}
                            cadres={this.state.cadres}
                             />
                    </TabPanel>

                    <TabPanel>
                        <CountryComponent countries={this.state.countries} />
                    </TabPanel>
                </Tabs>
                <br />
                <br />
            </Panel>
            </div>
        )
    }
};
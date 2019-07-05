import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import downloadCsv from 'download-csv';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { FaTrash, FaCheck, FaCheckSquare,FaPlusSquare} from 'react-icons/fa';
import ReactTooltip from 'react-tooltip';
import Multiselect from 'react-multiselect-checkboxes';

import CtNewTreatmentComponent from '../admin/ctNewTreatmentComponent';

export default class ServiceImportPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stdCadres: [],
            filteredStdCadres: [],
            countryCadres: [],
            filteredCountryCadres: [],
            stdTreatements: [],
            facilityTypes:[],
            filteredCountryTreatments: [],
            countryTreatments: [],
            filteredStdTreatments: [],
            dhis2Treatments: [],
            selectedStdCadre: '',
            selectedCountryCadre: '',
            progress: '',
            treatmentToDelete: 0,
            treatmentToMatch: "",
            state:'done',
            treatmentMap: new Map(),
            showingNew:false
        };

        axios.get('/metadata/cadres',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({
                stdCadres: res.data
            });

        }).catch(err => console.log(err));

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));

        axios.get('/metadata/treatments',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({
                stdTreatements: res.data,
                filteredStdTreatments : res.data,
            });

        }).catch(err => console.log(err));

        axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let treatmentMap = new Map();

            res.data.forEach(tr => {
                treatmentMap.set(tr.code, "");
            })
            this.setState({

                countryTreatments: res.data,
                filteredCountryTreatments: res.data,
                treatmentMap: treatmentMap
            });

        }).catch(err => console.log(err));

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                countryCadres: res.data
            });

        }).catch(err => console.log(err));
    }

    filterStdTreatement(cadreCode) {

        let treats = this.state.stdTreatements;
        
        if(cadreCode === "0"){

            this.setState({
                filteredStdTreatments:treats,
                showButtons:false,              
            });
        }else{

            let filtered = treats.filter(tr => tr.cadre_code.includes(cadreCode));

            this.setState({
                filteredStdTreatments: filtered,
                showButtons: (filtered.length >0),
                selectedStdCadre:cadreCode
            });
        }
    }

    bulkUseStdTreatment(){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let data = {
            cadre_code: this.state.selectedStdCadre,
            countryId: localStorage.getItem('countryId')
        };
        
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Do you want to use these treatments for your country?</p>
                        <p>This will delete related data for yearly statistics and any matching with dhis2 for this cadre.</p> 
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                this.setState({state:'loading'});

                                axios.post(`/countrytreatment/bulkInsertTreatment`, data,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then(res =>{

                                    axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
                                        headers :{
                                            Authorization : 'Bearer '+localStorage.getItem('token')
                                        }
                                    }).then(res => {

                                        let treatmentMap = new Map();
                            
                                        res.data.forEach(tr => {
                                            treatmentMap.set(tr.code, "");
                                        })
                                        this.setState({
                            
                                            countryTreatments: res.data,
                                            filteredCountryTreatments: res.data,
                                            treatmentMap: treatmentMap,
                                            state:'done',
                                        });
                            
                                    }).catch(err => console.log(err));
                                });
                                onClose();
                            }}>
                            Yes
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

    handleTreatmentChange(obj) {

        const ident = Object.keys(obj)[0].split("|");

        const code = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            std_code: code,
            param: param,
            value: value,
        };
        axios.patch('/countrytreatment/editTreatment', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({
                    countryTreatments: res.data,
                    filteredCountryTreatments: res.data,
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
    
    deleteTreatment(code) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

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
                                axios.delete(`/countrytreatment/deleteTreatment/${this.state.treatmentToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        //Update cadres
                                        axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            let treatmentMap = new Map();

                                            res.data.forEach(tr => {
                                                treatmentMap.set(tr.code, "");
                                            })
                                            this.setState({

                                                countryTreatments: res.data,
                                                filteredCountryTreatments: res.data,
                                                treatmentMap: treatmentMap
                                            });
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

    useStdTreatment(code) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        axios.get(`/metadata/getTreatment/${code}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let stdTreatment = res.data[0];

            let code = stdTreatment.code;

            let cadre_code = stdTreatment.cadre_code;

            let cadre = stdTreatment.cadre;

            let name = stdTreatment.name_fr + "/" + stdTreatment.name_en;

            let facility_type = stdTreatment.facility_type;

            let duration = stdTreatment.duration;

            let countryId = localStorage.getItem('countryId');

            let data = {
                code: code,
                cadre_code: cadre_code,
                name: name,
                duration: duration,
                facility_type:facility_type,
                countryId:countryId
            }
            //Check if cadre exist in country db
            axios.get(`/countrycadre/getCadre/${cadre_code}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {

                let stdCadre = res.data[0];

                if (res.data.length > 0) {

                    axios.post(`/countrytreatment/insertTreatment`, data,{
                        headers :{
                            Authorization : 'Bearer '+localStorage.getItem('token')
                        }
                    }).then(res => {

                        axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
                            headers :{
                                Authorization : 'Bearer '+localStorage.getItem('token')
                            }
                        }).then(res => {

                            let treatmentMap = new Map();

                            res.data.forEach(tr => {
                                treatmentMap.set(tr.code, "");
                            })
                            this.setState({

                                countryTreatments: res.data,
                                filteredCountryTreatments: res.data,
                                treatmentMap: treatmentMap
                            });

                        }).catch(err => console.log(err));

                    }).catch(err => console.log(err));
                } else {
                    this.launchToastr(`Cadre ${cadre} with code ${cadre_code} not 
                                        part of the country cadres.<br> You should first use the cadre for your country.`);
                }
            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
    }

    filterCountryTreatmentByName(name) {
        let treats = this.state.countryTreatments;
        this.setState({ filteredCountryTreatments: treats.filter(tr => tr.name_std.toLowerCase().includes(name.toLowerCase())) })
    }

    filterCountryTreatementByCadre(cadreCode) {

        let treats = this.state.countryTreatments;
        
        if(cadreCode === "0"){

            this.setState({
                filteredCountryTreatments:treats,     
            });
        }else{

            let filtered = treats.filter(tr => tr.cadre_code.includes(cadreCode));

            this.setState({
                filteredCountryTreatments: filtered,
            });
        }
    }

    newCountryTreatmentSave(info){

        let code = info.code;
        let facility_type = info.facility_type;
        let cadre_code = info.cadre_code;
        let name = info.name;
        let duration = info.duration;
        let countryId = localStorage.getItem('countryId');

        let data = {
            code: code,
            facility_type: facility_type,
            cadre_code: cadre_code,
            name: name,
            duration: duration,
            countryId:countryId
        };

        //Insert cadre in the database
        axios.post('/countrytreatment/insertCustomizedTreatment', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({showingNew : false});
            
            axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {

                let treatmentMap = new Map();
    
                res.data.forEach(tr => {
                    treatmentMap.set(tr.code, "");
                })
                this.setState({
    
                    countryTreatments: res.data,
                    filteredCountryTreatments: res.data,
                    treatmentMap: treatmentMap
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

    filterStdCadreByFaType(faTypeCode){

        let cadres = this.state.stdCadres;
        
        if(faTypeCode === "0"){
            this.setState({stdCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredStdCadres: filtered});
        }
    }

    filterCtCadreByFaType(faTypeCode){

        let cadres = this.state.countryCadres;
        
        if(faTypeCode === "0"){
            this.setState({countryCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCountryCadres: filtered});
        }
    }
    
    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div>
                        <div className="cadres-container">
                            <div className="div-flex-table-left">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Standard treatments</b> ({this.state.filteredStdTreatments.length})
                                        </div>
                                        <hr />
                                    </Col>
                                </FormGroup>
                                
                                <FormGroup>
                                    <table className="tbl-multiselect">
                                            <tr>
                                                <td><b>Select facility type</b></td>
                                                <td>
                                                    <FormGroup>
                                                        <Col sm={10}>
                                                            <FormControl
                                                                componentClass="select"
                                                                onChange={e => this.filterStdCadreByFaType(e.target.value)}>
                                                                <option value="0" key="000">Filter by facility type</option>
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
                                            <tr>
                                                <td><b>Filter by cadre</b></td>
                                                <td>
                                                    <FormGroup>
                                                        <Col sm={10}>
                                                            <FormControl
                                                                componentClass="select"
                                                                onChange={e => this.filterStdTreatement(e.target.value)}>
                                                                <option value="0" key="000">Filter by cadre</option>
                                                                {this.state.filteredStdCadres.map(cadre =>
                                                                    <option
                                                                        key={cadre.code}
                                                                        value={cadre.code}>
                                                                        {cadre.name_fr + '/' + cadre.name_en}
                                                                    </option>
                                                                )}
                                                            </FormControl>
                                                        </Col>
                                                    </FormGroup>
                                                </td>
                                                {this.state.showButtons &&
                                                    <td>
                                                        <button className="button" onClick={() => this.bulkUseStdTreatment()}><FaCheck /> Use treatments  attached to this cadre</button>
                                                    </td>
                                                }
                                            </tr>
                                        </table>
                                </FormGroup>
                                <hr />
                                
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>Name (fr)</th>
                                            <th>Name (en)</th>
                                            <th>Duration (min)</th>
                                            <th colSpan="2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.filteredStdTreatments.map(treatment =>

                                            <tr key={treatment.code} >
                                                <td>
                                                    {treatment.name_fr}
                                                </td>
                                                <td>
                                                    {treatment.name_en}
                                                </td>
                                                <td align="center">
                                                    {treatment.duration}
                                                </td>
                                                <td colSpan="2">
                                                    {!this.state.treatmentMap.has(treatment.code) &&
                                                        <a href="#" onClick={() => this.useStdTreatment(`${treatment.code}`)}>
                                                            <FaCheckSquare />use
                                                        </a>
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <br />
                                <br />
                            </div>

                            <div className="div-flex-table-right">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Country customized treatments</b> ({this.state.filteredCountryTreatments.length})
                                        </div>
                                        <hr />
                                    </Col>
                                </FormGroup>
                                <table className="tbl-multiselect">
                                    <tr>
                                        <td><b>Select facility type</b></td>
                                        <td>
                                            <FormGroup>
                                                <Col sm={10}>
                                                    <FormControl
                                                        componentClass="select"
                                                        onChange={e => this.filterCtCadreByFaType(e.target.value)}>
                                                        <option value="0" key="000">Filter by facility type</option>
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
                                    <tr>
                                        <td><b>Filter by cadre</b></td>
                                        <td>
                                            <div>
                                                <FormControl
                                                        componentClass="select"
                                                        onChange={e => this.filterCountryTreatementByCadre(e.target.value)}>
                                                        <option value="0" key="000">Filter by cadre</option>
                                                        {this.state.filteredCountryCadres.map(cadre =>
                                                            <option
                                                                key={cadre.std_code}
                                                                value={cadre.std_code}>
                                                                {cadre.name}
                                                            </option>
                                                        )}
                                                </FormControl>
                                            </div>
                                        </td>

                                        
                                    </tr>
                                    <tr>
                                        <td><b>Filter by treatment</b></td>
                                        <td>
                                            <div>
                                                <FormGroup>
                                                    <Col sm={15}>
                                                        <input typye="text" className="form-control"
                                                            placeholder="Filter by treatment" onChange={e => this.filterCountryTreatmentByName(e.target.value)} />
                                                    </Col>
                                                </FormGroup>
                                            </div>
                                        </td>
                                    </tr>
                                </table>

                                <hr />
                                {this.state.state == 'loading' &&
                                    <div style={{ marginTop: 120, marginBottom: 65 }}>
                                        <div className="loader"></div>
                                    </div>
                                }
                                {localStorage.getItem('role') !== 'viewer' &&
                                    <div className="div-add-new-link">
                                        <a href="#" className="add-new-link" onClick={() => this.setState({ showingNew: true})}>
                                            <FaPlusSquare /> Add new
                                        </a>
                                    </div>
                                }
                                <br />
            
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>Standard name</th>
                                            <th>Customized name</th>
                                            <th>Duration (min)</th>
                                        </tr>
                                    </thead>
                                    {
                                        this.state.showingNew &&
                                        <CtNewTreatmentComponent 
                                            facilityTypes={this.state.facilityTypes}
                                            cadres={this.state.countryCadres}
                                            save={info => this.newCountryTreatmentSave(info)}
                                            cancel={() => this.setState({ showingNew: false })}/>
                                    }
                                    <tbody>
                                        {this.state.filteredCountryTreatments.map(treatment =>
                                            <tr key={treatment.code} >
                                                <td>
                                                    {treatment.name_std}
                                                </td>
                                                <td>
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={(treatment.name_cust.length == 0) ? 'customize' : treatment.name_cust}
                                                                paramName={treatment.code + '|name_customized'}
                                                                change={this.handleTreatmentChange}
                                                                style={{
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
                                                                text={`` + treatment.duration}
                                                                paramName={treatment.code + '|duration'}
                                                                change={this.handleTreatmentChange}
                                                                style={{
                                                                    minWidth: 100,
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
                                                    <a href="#" onClick={() => this.deleteTreatment(`${treatment.code}`)}>
                                                        <FaTrash />
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <br /><br />
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }

};
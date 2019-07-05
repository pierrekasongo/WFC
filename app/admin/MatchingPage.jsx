import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Radio, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import Multiselect from 'react-multiselect-checkboxes';
import { FaCheck, FaCapsules, FaClinicMedical, FaTrash, FaUserMd } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

export default class MatchingPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            checked: false,
            checkedTreatment: '',
            dhis2TreatmentCombo: [],
            dhis2TreatmentComboSelected: [],
            dhis2TreatmentInput: [],
            selectedDhis2Treatments: {},

            countryTreatments: [],
            filteredCountryTreatments: [],

            countryCadres: [], 
            filteredCountryCadres:[],

            countryFacilities: [],
            filteredCountryFacilities: [],
            ihrisFacilityCombo: [],
            ihrisFacilities: [],
            ihrisCadres: [],

            dhis2CodeToDelete: '',

            rolesCombo: [],

            showButtons: false,
            stateDhis2Treatment : 'loading',
            facilityTypes: []
        };
        this.selectMultipleDHIS2Treatments = this.selectMultipleDHIS2Treatments.bind(this);
        this.matchTreatments = this.matchTreatments.bind(this);
        this.matchFacilities = this.matchFacilities.bind(this);
        this.matchCadres = this.matchCadres.bind(this);

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => this.setState({ countryCadres: res.data }))
            .catch(err => console.log(err));
        axios.get(`/hris/getiHRIS_cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => this.setState({ ihrisCadres: res.data }))
            .catch(err => console.log(err));
        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => this.setState({
            countryFacilities: res.data,
            filteredCountryFacilities: res.data
        })).catch(err => console.log(err));

        axios.get(`/hris/getiHRIS_facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({ ihrisFacilities: res.data });

        }).catch(err => {
            console.log(err);
        });

        axios.get(`/hris/getiHRIS_PractitionerRoles/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let rolesCombo = [];

            res.data.forEach(role => {

                rolesCombo.push({ label: role.name, value: role.code });

            })
            this.setState({ rolesCombo: rolesCombo });

        }).catch(err => {
            console.log(err);
        });

        axios.get(`/dhis2/getDhis2_treatments/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let dhis2TreatmentCombo = [];

            let dhis2TreatmentInput = [];

            res.data.forEach(tr => {

                dhis2TreatmentInput[tr.code] = {
                    code: tr.code,
                    name: tr.name,
                    dataset: tr.dataset
                };
                dhis2TreatmentCombo.push({ label: tr.name, value: tr.code });

            })
            this.setState({
                dhis2TreatmentCombo: dhis2TreatmentCombo,
                dhis2TreatmentInput: dhis2TreatmentInput,
                stateDhis2Treatment:'done'
            });

        }).catch(err => {
            console.log(err);
        });

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

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({ countryCadres: res.data });

        }).catch(err => console.log(err));
    }

    handleCadreChange(obj) {

        const ident = Object.keys(obj)[0].split("-");

        const code = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            std_code: code,
            param: param,
            value: value,
        };
        axios.patch('/countrycadre/editCadre', data,{
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

    launchToastr(msg) {
        toastr.options = {
            positionClass: 'toast-top-full-width',
            hideDuration: 15,
            timeOut: 6000
        }
        toastr.clear()
        setTimeout(() => toastr.error(msg), 300)
    }

    deleteCode(id) {

        this.setState({
            dhis2CodeToDelete: id
        });

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.delete(`/dhis2/deleteDhis2Code/${id}`,{
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

    filterCountryTreatement(cadreCode) {

        let treats = [];

        treats = this.state.countryTreatments;

        if(cadreCode === "0"){
            
            this.setState({filteredCountryTreatments : treats});
            return;
        }
        this.setState({ filteredCountryTreatments: treats.filter(tr => tr.cadre_code.includes(cadreCode)) });
    }

    filterDHIS2Treatment() {
        let treats = this.state.dhis2Treatments;
        this.setState({ filterDHIS2Treatment: treats.filter(tr => tr.name.toLowerCase().includes(name.toLowerCase())) })
    }

    selectMultipleDHIS2Treatments(values) {

        let selectedDhis2Treatments = [];

        this.setState({ showButtons: (values.length > 0) });

        values.forEach(val => {
            let name = val.label;
            let code = val.value;

            selectedDhis2Treatments.push({
                code: code,
                name: name,
                dataset: this.state.dhis2TreatmentInput[code].dataset
            });
        })
        this.setState({ selectedDhis2Treatments: selectedDhis2Treatments });
    }

    matchTreatments() {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let data = {
            treatmentCode: this.state.checkedTreatment,
            selectedDhis2Treatments: this.state.selectedDhis2Treatments,            
        }
        axios.post(`/countrytreatment/match_dhis2_codes`, data,{
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

            this.setState({
                dhis2TreatmentComboSelected: [],
                checked: false,
                checkedTreatment: ''
            });

        }).catch(err => console.log(err));
    }

    matchFacilities(code, ihrisCode) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let data = {
            facilityCode: code,
            ihrisCode: ihrisCode
        }
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to match this?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.post(`/dhis2/match_facility`,data,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then(res => {
                                    axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
                                        headers :{
                                            Authorization : 'Bearer '+localStorage.getItem('token')
                                        }
                                    }).then(res => this.setState({ countryFacilities: res.data }))
                                        .catch(err => console.log(err));
                                }).catch(err => console.log(err));

                                onClose();
                            }}>
                            Yes
                        </button>
                    </div>
                );
            }
        });
    }

    matchCadres(stdCode, ihrisCode) {
        
        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }
        let data = {
            ihrisCode: ihrisCode,
            stdCode: stdCode
        }
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to match this?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.post(`/hris/match_cadre`, data,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then(res => {
                                    axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                                        headers :{
                                            Authorization : 'Bearer '+localStorage.getItem('token')
                                        }
                                    })
                                        .then(res => this.setState({ countryCadres: res.data }))
                                        .catch(err => console.log(err));
                                }).catch(err => console.log(err));

                                onClose();
                            }}>
                            Yes
                        </button>
                    </div>
                );
            }
        });
    }

    countryTreatmentCheck(code) {
        this.setState({
            checked: true,
            checkedTreatment: code
        });
    }
    cancelMatchTreatments() {
        this.setState({
            checked: false,
            checkedTreatment: ''
        });
        //Remove selectedCode from array
    }

    filterCtCadreByFaType(faTypeCode){

        let cadres = this.state.countryCadres;
        
        if(faTypeCode === "0"){
            this.setState({filteredCountryCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCountryCadres: filtered});
        }
    }

    filterFacilitiesByType(faTypeCode){

        let facilities = this.state.countryFacilities;
        
        if(faTypeCode === "0"){
            this.setState({filteredCountryFacilities:facilities});
        }else{

            let filtered = facilities.filter(fa => fa.faTypeCode.includes(faTypeCode));

            this.setState({filteredCountryFacilities: filtered});
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
            <Panel bsStyle="primary" header="Match treatments with DHIS2">
                <Tabs>
                    <TabList>
                        <Tab><FaCapsules /> Match treatments to DHIS2</Tab>
                        <Tab><FaClinicMedical /> Match facilities to iHRIS</Tab>
                        <Tab><FaUserMd /> Match cadres to iHRIS</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="tab-main-container">
                            <div className="scrollable-container">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Match DHIS2 and country treatments</b>
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
                                                    <FormGroup>
                                                        <Col sm={10}>
                                                            <FormControl
                                                                componentClass="select"
                                                                onChange={e => this.filterCountryTreatement(e.target.value)}>
                                                                <option value="0" key="000">Filter by cadre</option>
                                                                {this.state.filteredCountryCadres.map(cadre =>
                                                                    <option
                                                                        key={cadre.std_code}
                                                                        value={cadre.std_code}>
                                                                        {cadre.name}
                                                                    </option>
                                                                )}
                                                            </FormControl>
                                                        </Col>
                                                    </FormGroup>
                                                </td>
                                            </tr>
                                        </table>
                                </FormGroup>
                                <hr />
                                
                                {this.state.checked &&
                                    <div>
                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={10}>
                                                Choose DHIS2 treatments to match ({this.state.dhis2TreatmentCombo.length})
                                            </Col>
                                        </FormGroup>

                                        <br />
                                        <table className="tbl-multiselect">
                                            <tr>
                                                <td>
                                                    <div className="div-multiselect">
                                                        <Multiselect
                                                            options={this.state.dhis2TreatmentCombo}
                                                            onChange={this.selectMultipleDHIS2Treatments} />
                                                    </div>
                                                </td>
                                                <td>
                                                    {this.state.stateDhis2Treatment == 'loading' &&
                                                        <span className="loader-text">Loading...</span>
                                                    }
                                                </td>
                                                {this.state.showButtons &&
                                                    <td>
                                                        <button className="button" onClick={this.matchTreatments}><FaCheck /> Match</button>
                                                    </td>
                                                }
                                                <td>
                                                    <button className="button-cancel" onClick={() => this.cancelMatchTreatments()}><FaTrash /> Cancel</button>
                                                </td>
                                            </tr>
                                        </table>
                                        <hr />
                                    </div>
                                }

                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th>Standard name</th>
                                            <th>Customized name</th>
                                            <th>Dhis2</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.filteredCountryTreatments.map(treatment =>

                                            <tr key={treatment.code} >
                                                <td>
                                                    <input type="radio" onChange={() => this.countryTreatmentCheck(treatment.code)} checked={this.state.checkedTreatment == treatment.code} />
                                                </td>
                                                <td>
                                                    {treatment.name_std}
                                                </td>
                                                <td>
                                                    {treatment.name_cust}
                                                </td>
                                                <td>
                                                    <ul>
                                                        {treatment.dhis2_codes.map(c =>
                                                            <li>
                                                                <a className="match-delete" href="#" onClick={() => this.deleteCode(c.id)}>{c.name}</a>
                                                            </li>
                                                        )}
                                                    </ul>
                                                </td>

                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <br />
                            </div>
                        </div>
                    </TabPanel>
                    {/*******Facilities matching tab************/}
                    <TabPanel>
                        <div className="tab-main-container">
                            <div className="scrollable-container">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Facilities</b>
                                        </div>
                                    </Col>
                                </FormGroup>
                                <hr />
                                <div>
                                    <table>
                                        <tr>
                                            <td><b>Filter by facility type</b></td>
                                            <td>
                                                <FormGroup>
                                                    <Col sm={15}>
                                                        <FormControl
                                                            componentClass="select"
                                                            onChange={e => this.filterFacilitiesByType(e.target.value)}>
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
                                    </table>
                                </div>
                                <br/>
                                <table className="table-list" cellSpacing="10">
                                    <thead>
                                        <th>Parent</th>
                                        <th>Facility</th>
                                        <th>iHRIS</th>
                                    </thead>
                                    <tbody>
                                        {this.state.filteredCountryFacilities.map(fac =>
                                            <tr key={fac.id}>
                                                <td>{fac.parentName}</td>
                                                <td>{fac.name}</td>
                                                <td>{fac.ihrisCode}</td>
                                                <td>
                                                    <Col sm={10}>
                                                        <FormControl componentClass="select"
                                                            onChange={e => this.matchFacilities(fac.code, e.target.value)}>
                                                            <option key="000" value="000">Select value</option>
                                                            {(this.state.ihrisFacilities.map(fa =>
                                                                <option key={fa.code} value={fa.code} selected={(fac.ihrisCode == fa.code) ? true : false}>{fa.name}</option>
                                                            ))}
                                                        </FormControl>
                                                    </Col>
                                                    {/*<Col sm={15}>
                                                        <Multiselect
                                                            options={this.state.ihrisFacilityCombo}
                                                            onChange={this.selectMultipleCadres} />
                                                    </Col>*/}
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <br />
                            </div>
                            <br />
                        </div>
                    </TabPanel>

                    <TabPanel>
                    <div className="scrollable-container">
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={20}>
                                <div className="div-title">
                                    <b>Match cadres with iHRIS</b>
                                </div>
                                <hr />
                            </Col>
                        </FormGroup>
                        <div>
                            <table>
                                <tr>
                                    <td><b>Filter from facility type</b></td>
                                    <td>
                                        <FormGroup>
                                            <Col sm={15}>
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
                            </table>
                        </div>
                        <br/>
                        <table className="table-list" cellspacing="5">
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Hris code</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.state.filteredCountryCadres.map(cadre =>
                                    <tr key={cadre.std_code} >
                                        <td>
                                            {cadre.name}
                                        </td>
                                        <td>
                                            <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={(cadre.hris_code.length == 0 ? 'match hris code' : cadre.hris_code)}
                                                    paramName={cadre.std_code + '-hris_code'}
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
                                        </td>

                                        <td>
                                            <Col sm={10}>
                                                <FormControl componentClass="select"
                                                    onChange={e => this.matchCadres(cadre.std_code, e.target.value)}>
                                                    <option key="000" value="000">Select value</option>
                                                    {(this.state.ihrisCadres.map(c =>
                                                        <option key={c.id} value={c.id} selected={(cadre.hris_code == c.id) ? true : false}>{c.name}</option>
                                                    ))}
                                                </FormControl>
                                            </Col>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                        <br />
                    </div>
                    </TabPanel>
                </Tabs>
            </Panel>
        );

    }
};
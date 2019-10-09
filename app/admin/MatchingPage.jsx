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
import MatchCadreComponent from './MatchCadreComponent';
import MatchedItemsComponent from './MatchedItemsComponent';

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
            showFilters:false,
            countryTreatments: [],
            filteredCountryTreatments: [],
            selectedCadre:'',
            countryTreatmentTemp:[],
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
            facilityTypes: [],
            match_with_dhis2:false,
            match_without_dhis2:true,
            match_with_ihris:false,
            match_without_ihris:true
        };
        this.selectMultipleDHIS2Treatments = this.selectMultipleDHIS2Treatments.bind(this);
        this.matchTreatmentsToDHIS2 = this.matchTreatmentsToDHIS2.bind(this);
        this.matchFacilitiesToiHRIS = this.matchFacilitiesToiHRIS.bind(this);

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

        axios.get(`/countrytreatment/treatments/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                countryTreatments: res.data,
                filteredCountryTreatments: res.data,
                countryTreatmentTemp:res.data
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

    launchToastr(msg,type) {
        toastr.options = {
            positionClass: 'toast-top-full-width',
            hideDuration: 15,
            timeOut: 6000
        }
        toastr.clear()
        if(type === "ERROR"){
            setTimeout(() => toastr.error(msg), 300);
        }else if(type === "WARNING"){
            setTimeout(() => toastr.warning(msg), 300);
        }else{
            setTimeout(() => toastr.success(msg), 300);
        }
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
                                            countryTreatmentTemp:res.data
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

        this.setState({selectedCadre : cadreCode});

        if(cadreCode === "0"){
            
            this.setState({
                filteredCountryTreatments : treats,
                countryTreatmentTemp : treats
            });
            return;
        }
        this.setState({ filteredCountryTreatments: treats.filter(tr => tr.cadre_code.includes(cadreCode)),
            countryTreatmentTemp:treats.filter(tr => tr.cadre_code.includes(cadreCode))
         });
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
            })
        })
        this.setState({ selectedDhis2Treatments: selectedDhis2Treatments });
    }

    matchTreatmentsToSelf(){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.","ERROR");
            return;
        }

        if(this.state.selectedCadre === '0'){
            this.launchToastr("No cadre selected. Please select a cadre to filter the treatment list.","ERROR");
            return;
        }
        let treatments = [];

        let data = {
            treatments: this.state.filteredCountryTreatments,    
        }

        axios.post(`/countrytreatment/match_dhis2_codes_with_self/${localStorage.getItem('countryId')}`, data,{
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
                this.launchToastr("Treatments validated successfully!","SUCCESS");
            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
    }

    matchTreatmentsToDHIS2() {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.","ERROR");
            return;
        }

        let data = {
            treatmentCode: this.state.checkedTreatment,
            selectedDhis2Treatments: this.state.selectedDhis2Treatments,            
        }
        axios.post(`/countrytreatment/match_dhis2_codes_with_dhis2/${localStorage.getItem('countryId')}`, data,{
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

    matchFacilitiesToiHRIS(code, ihrisCode) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.","ERROR");
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

                                axios.post(`/dhis2/match_facility_iHRIS`,data,{
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

    matchFacilitiesToSelf() {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.","ERROR");
            return;
        }

        let data = {
            facilities: this.state.countryFacilities,
        }
        axios.post(`/dhis2/match_facility_self`,data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({ countryFacilities: res.data });
                this.launchToastr("Facilities validated successfully!","SUCCESS");
            })
                .catch(err => console.log(err));
        }).catch(err => console.log(err));
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

    filterTreatmentByName(name) {

        if(name.length > 0){

            let treats = this.state.filteredCountryTreatments;

            this.setState({ filteredCountryTreatments: treats.filter(tr => tr.name_std.toLowerCase().includes(name.toLowerCase()) || 
                    tr.name_cust.toLowerCase().includes(name.toLowerCase()) ) });

        }else{
            this.setState({filteredCountryTreatments: this.state.countryTreatmentTemp});
        }   
    }

    setTreatmentMatchOption(event){

        let value = event.target.value;

        if(value === "DHIS2"){
            this.setState({
                match_with_dhis2 : true,
                match_without_dhis2 :false
            })
            //Load treatments from DHIS2
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
        }else{
            this.setState({
                match_without_dhis2 : true,
                match_with_dhis2 : false
            })
        }
    }
    setFacilityMatchOption(event){

        let value = event.target.value;

        if(value === "IHRIS"){
            this.setState({
                match_with_ihris : true,
                match_without_ihris :false
            });
            //Load facilities from iHRIS
            axios.get(`/hris/getiHRIS_facilities/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
    
                this.setState({ ihrisFacilities: res.data });
    
            }).catch(err => {
                console.log(err);
            });
        }else{
            this.setState({
                match_without_ihris : true,
                match_with_ihris : false
            })
        }
    }
    render() {

        return (
            <Panel bsStyle="primary" header="Match treatments with">
                <Tabs>
                    <TabList>
                        <Tab><FaCapsules /> Match treatments</Tab>
                        <Tab><FaClinicMedical /> Match facilities</Tab>
                        <Tab><FaUserMd /> Match cadres</Tab>
                    </TabList>

                    <TabPanel>
                        <div className="tab-main-container">
                            
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Match treatments</b>
                                        </div>
                                        <hr />
                                    </Col>
                                </FormGroup>
                                <div onChange={this.setTreatmentMatchOption.bind(this)}>
                                    <table className="radio-table" cellspacing="10">
                                        <tr>
                                            <td><input type="radio" value="DHIS2" name="treatment_match_option" /> Match to DHIS2</td>
                                            <td><input type="radio" value="SELF" name="treatment_match_option"/> No DHIS2</td>
                                        </tr>
                            
                                    </table>
                                </div>
                                <hr/>
                                <FormGroup>
                                <a href="#" onClick={() => this.setState({showFilters : !this.state.showFilters})} >
                                    Show/Hide filters
                                </a>
                                {this.state.showFilters && 
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
                                            <tr>
                                                <td><b>Search treatment</b></td>
                                                <td>
                                                    <div>
                                                        <FormGroup>
                                                            <Col sm={15}>
                                                                <input typye="text" className="form-control"
                                                                    placeholder="Treatment name" onChange={e => this.filterTreatmentByName(e.target.value)} />
                                                            </Col>
                                                        </FormGroup>
                                                    </div>
                                                </td>
                                            </tr>
                                        </table>
                                    }
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
                                        {this.state.match_with_dhis2 &&
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
                                                        <button className="button" onClick={this.matchTreatmentsToDHIS2}><FaCheck /> Match</button>
                                                    </td>
                                                }
                                                <td>
                                                    <button className="button-cancel" onClick={() => this.cancelMatchTreatments()}><FaTrash /> Cancel</button>
                                                </td>
                                            </tr>
                                        </table>
                                        }
                                        <hr />
                                    </div>
                                }
                            {this.state.match_without_dhis2 && 
                            <div className="div-btn-no-dhis2">
                                <button className="button" onClick = {() => this.matchTreatmentsToSelf()}><FaCheck /> Validate</button>
                            </div>
                            }
                            <div className="div-table">
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            {this.state.match_with_dhis2 &&
                                                <th></th>
                                            }
                                            <th>Standard name</th>
                                            <th>Customized name</th>

                                            {this.state.match_with_dhis2 &&
                                                <th>Dhis2 elements</th>
                                            }
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.filteredCountryTreatments.map(treatment =>

                                            <tr key={treatment.code} >
                                                {this.state.match_with_dhis2 &&
                                                <td>
                                                    <input type="radio" onChange={() => this.countryTreatmentCheck(treatment.code)} checked={this.state.checkedTreatment == treatment.code} />
                                                </td>
                                                }
                                                <td>
                                                    {treatment.name_std}
                                                </td>
                                                <td>
                                                    {treatment.name_cust}
                                                </td>
                                                {this.state.match_with_dhis2 &&
                                                <td>
                                                    <MatchedItemsComponent 
                                                        dhis2Codes={treatment.dhis2_codes}
                                                        delete={id => this.deleteCode(id)}
                                                        />
                                                </td>
                                                }
                                                {/*<td>
                                                    
                                                    <ul>
                                                        {treatment.dhis2_codes.map(c =>
                                                            <li>
                                                                <a className="match-delete" href="#" onClick={() => this.deleteCode(c.id)}>{c.name}</a>                                                 
                                                            </li>
                                                        )}
                                                    </ul>
                                                </td>*/}

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
                            
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Match facilities</b>
                                        </div>
                                    </Col>
                                </FormGroup>
                                <hr />
                                <div onChange={this.setFacilityMatchOption.bind(this)}>
                                    <table className="radio-table" cellspacing="10">
                                        <tr>
                                            <td><input type="radio" value="IHRIS" name="facility_match_option" /> Match to iHRIS</td>
                                            <td><input type="radio" value="SELF" name="facility_match_option"/> No iHRIS</td>
                                        </tr>
                            
                                    </table>
                                </div>
                                <hr/>
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
                                <div className="div-table">
                                {this.state.match_without_ihris && 
                                <div className="div-btn-no-dhis2">
                                    <button className="button" onClick = {() => this.matchFacilitiesToSelf()}><FaCheck /> Validate</button>
                                </div>
                                }
                                <table className="table-list" cellSpacing="10">
                                    <thead>
                                        <th>Parent</th>
                                        <th>Facility</th>
                                        {this.state.match_with_ihris  && 
                                        <th>iHRIS</th>
                                        }
                                    </thead>
                                    <tbody>
                                        {this.state.filteredCountryFacilities.map(fac =>
                                            <tr key={fac.id}>
                                                <td>{fac.parentName}</td>
                                                <td>{fac.name}</td>
                                                {this.state.match_with_ihris  && 
                                                <td>{fac.ihrisCode}</td>
                                                }
                                                 {this.state.match_with_ihris  && 
                                                <td>
                                                    <Col sm={10}>
                                                        <FormControl componentClass="select"
                                                            onChange={e => this.matchFacilitiesToiHRIS(fac.code, e.target.value)}>
                                                            <option key="000" value="000">Select value</option>
                                                            {(this.state.ihrisFacilities.map(fa =>
                                                                <option key={fa.code} value={fa.code} selected={(fac.ihrisCode == fa.code) ? true : false}>{fa.name}</option>
                                                            ))}
                                                        </FormControl>
                                                    </Col>
                                                </td>
                                                 }
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
                        <MatchCadreComponent 
                            countryCadres={this.state.countryCadres}
                            ihrisCadres={this.state.ihrisCadres}
                            facilityTypes={this.state.facilityTypes}
                            launchToastr={(msg, type) => this.launchToastr}
                            />
                    </TabPanel>
                </Tabs>
            </Panel>
        );

    }
};
import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import Multiselect from 'react-multiselect-checkboxes';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaTrash, FaCheck, FaCheckSquare, FaArrowRight, FaFileCsv,FaFileImport } from 'react-icons/fa';
import { CSVLink, CSVDownload } from "react-csv";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import HRUploadPanel from '../import/HRUploadPanel';

export default class StatisticsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            results: [],
            cadres: [],
            filteredCadres: [],
            facilities: [],
            years: [],//Save years to db
            regions: [],
            districts: [],
            selectedPeriod: "",
            selectedFacility: "",
            selectedCadre: "",
            filteredFacility: "",
            filteredCadre: "",
            statistics: [],
            filteredStats: [],
            state: 'done',

            facilitiesCombo: [],

            cadresCombo: [],
            facilityTypes: [],
            selectedFacilities: [],
            selectedCadres: [],
            csvData: []
        };
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.selectMultipleCadres = this.selectMultipleCadres.bind(this);

        this.csvLink=React.createRef();

        this.importStatisticsFromDhis2 = this.importStatisticsFromDhis2.bind(this);

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));

        axios.get(`/countrystatistics/statistics/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                statistics: res.data,
                filteredStats: res.data
            })
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

        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let facilities = res.data;

            let facilitiesCombo = [];

            facilities.forEach(fa => {

                let code = fa.ihrisCode;

                facilitiesCombo.push({ label: fa.name, value: code });
            });
            this.setState({
                facilities: facilities,
                facilitiesCombo: facilitiesCombo
            });
        }).catch(err => console.log(err));

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let cadresCombo = [];

            res.data.forEach(cadre => {

                cadresCombo.push({ label: cadre.name, value: cadre.std_code });
            });
            this.setState({
                cadresCombo: cadresCombo,
                cadres:res.data
            });

        }).catch(err => console.log(err));

    }

    handlePatientsChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        const ident = Object.keys(obj)[0].split("-");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };
        axios.patch('/countrystatistics/editPatientsCount', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/countrystatistics/statistics/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({
                    statistics: res.data,
                    filteredStats: res.data
                })

            }).catch(err => console.log(err));
        }).catch(err => {

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

    filterStatByFacility(facility) {

        let stats = this.state.statistics;

        this.setState({ filteredStats: stats.filter(st => st.facility.toLowerCase().includes(facility.toLowerCase())) });

    }

    filterStatByCadre(cadreCode) {

        let stats = this.state.statistics;

        if (cadreCode === "0") {
            this.setState({filteredStats: stats});
        }else{
            let filtered = stats.filter(st => st.cadre_code.includes(cadreCode));

            this.setState({filteredStats: filtered});
        }
    }

    generateCSV(){

        let facilities = this.state.selectedFacilities;
        let cadres = this.state.selectedCadres;
        let year = this.state.selectedPeriod;
        let csvData = [];
        let value="";

        if(!facilities.length > 0){
            this.launchToastr("No facility selected.");
            return;
        }
        if(!cadres.length > 0){
            this.launchToastr("No cadre selected.");
            return;
        }if(year === ""){
            this.launchToastr("No period selected.");
            return;
        }

        let data = {
            cadres: this.state.selectedCadres,
            countryId: localStorage.getItem('countryId')
        }

        axios.post(`/countrytreatment/treatments`,data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let treatments = res.data;

            facilities.forEach(fa =>{

                treatments.forEach(tr =>{

                    let treat = tr;

                    let tr_name =(treat.name_cust.length > 0)?treat.name_cust:treat.name_std;

                    csvData.push({
                        facility_code:fa.code,
                        facilicity:fa.name,
                        cadre_code:treat.cadre_code,
                        cadre:treat.cadre_name,
                        treatment_code:treat.code,
                        treatment:tr_name,
                        period:year,
                        value:value
                    });

                });
            });

            this.setState({
                csvData:csvData
            });
    
            this.csvLink.current.link.click();

        }).catch(err => console.log(err));

        
    }

    importStatisticsFromDhis2() {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        if (this.state.selectedPeriod.length == 0) {
            this.launchToastr("Please, select a year first before calculating.");
            return;
        }
        if (typeof (this.state.selectedFacilities) == 'undefined') {
            this.launchToastr("No facility selected.");
            return;
        }
        if (typeof (this.state.selectedCadres) == 'undefined') {
            this.launchToastr("No cadre selected.");
            return;
        }

        let data = {
            selectedPeriod: this.state.selectedPeriod,
            selectedFacilities: this.state.selectedFacilities,
            selectedCadres: this.state.selectedCadres,
            countryId : localStorage.getItem('countryId')
        };

        this.setState({ state: 'loading' });

        axios.post(`/dhis2/import_statistics`, data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/countrystatistics/statistics/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({
                    statistics: res.data,
                    filteredStats: res.data,
                    state:'done'
                })

            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

    }

    useStatistics(){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        if (this.state.selectedPeriod.length == 0) {
            this.launchToastr("Please, select a year before calculating.");
            return;
        }
        if (typeof (this.state.selectedFacilities) == 'undefined') {
            this.launchToastr("No facility selected.");
            return;
        }
        if (typeof (this.state.selectedCadres) == 'undefined') {
            this.launchToastr("No cadre selected.");
            return;
        }

        let data = {
            selectedPeriod: this.state.selectedPeriod,
            selectedFacilities: this.state.selectedFacilities,
            selectedCadres: this.state.selectedCadres,
            countryId: localStorage.getItem('countryId')
        };

        axios.post(`/dhis2/import_statistics`, data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/countrystatistics/statistics/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({
                    statistics: res.data,
                    filteredStats: res.data,
                })

            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

    }
    filterCtCadreByFaType(faTypeCode){

        let cadres = this.state.cadres;
        
        if(faTypeCode === "0"){
            this.setState({cadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCadres: filtered});
        }
    }

    selectMultipleCadres(values) {

        let selectedCadres = [];

        values.forEach(val => {

            selectedCadres.push({
                code:val.value,
                name:val.label
            });
        })
        this.setState({ selectedCadres: selectedCadres });
    }

    selectMultipleFacilities(values) {

        let selectedFacilities = [];

        values.forEach(val => {
            selectedFacilities.push({
                code: val.value,
                name:val.label
            });
        })
        this.setState({ selectedFacilities: selectedFacilities });
    }

    filterCadreFacilitiesByFaType(faTypeCode){

        let cadresCombo = [];

        let facilitiesCombo = [];

        if(faTypeCode === "0"){

            this.setState({
                cadresCombo: cadresCombo,
                facilitiesCombo: facilitiesCombo
            });

        }else{

            let cadres = this.state.cadres;

            let filteredCadres = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            filteredCadres.forEach(cd =>{
                cadresCombo.push({ label: cd.name, value: cd.std_code });
            });

            let filteredFacilities = this.state.facilities.filter(fa => fa.faTypeCode.includes(faTypeCode));

            filteredFacilities.forEach(fa =>{

                let id = fa.id + '|' + fa.code;

                facilitiesCombo.push({ label: fa.name, value: id });
            });

            this.setState({
                cadresCombo: cadresCombo,
                facilitiesCombo: facilitiesCombo
            });
        }
    }

    render() {
        return (
            <Panel bsStyle="primary" header="Import yearly treatments statistics from DHIS2">
                <Tabs>
                    <TabList>
                        <Tab>Treatments statistics</Tab>
                        <Tab>Workforce statistics</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="calc-container">
                            <div className="calc-container-left">
                                <Form horizontal>
                                    <div className="div-title">
                                        <b>Set import values</b>
                                    </div>
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
                                    <br/>

                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={10}>
                                            <b>Select facility type</b>
                                        </Col>
                                        <Col sm={15}>
                                            <FormControl
                                                componentClass="select"
                                                onChange={e => this.filterCadreFacilitiesByFaType(e.target.value)}>
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
                                    <br/>
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
                                    <br/>
                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={10}>
                                            <b>Cadres({(this.state.cadresCombo.length)})</b>
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
                                    <div style={{ textAlign: "right", padding: 10 }}>
                                        <Button bsStyle="warning" bsSize="medium" onClick={this.importStatisticsFromDhis2}>
                                            <FaFileImport /> Import statistics from DHIS2
                                        </Button>
                                        <br/><br/>
                                        <Button bsStyle="info" bsSize="medium" onClick={() => this.generateCSV()}>
                                            <FaFileCsv /> Generate csv
                                        </Button>
                                    </div>

                                    <div>
                                        <CSVLink data={this.state.csvData} 
                                                filename="treatment_statistics.csv"
                                                className="hidden"
                                                ref={this.csvLink}
                                                target="_blank" /> 
                                    </div>
                                </Form>
                            </div>

                            <div className="calc-container-right">
                                <div className="scrollable-container">
                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={20}>
                                            <div className="div-title">
                                                <b>Annual treatment statistics - </b>({this.state.filteredStats.length})
                                            </div>
                                        </Col>
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
                                                                    onChange={e => this.filterStatByCadre(e.target.value)}>
                                                                    <option key="000" value="0">Filter by cadre</option>
                                                                    {this.state.filteredCadres.map(cd =>
                                                                        <option key={cd.std_code} value={cd.std_code}>{cd.name}</option>
                                                                    )}
                                                                </FormControl>
                                                            </Col>
                                                        </FormGroup>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td><b>Filter by facility</b></td>
                                                    <td>
                                                        <FormGroup>
                                                            <Col sm={15}>
                                                                <input typye="text" className="form-control"
                                                                    placeholder="Filter by facility" onChange={e => this.filterStatByFacility(e.target.value)} />
                                                            </Col>
                                                        </FormGroup>
                                                    </td>
                                                </tr>
                                            </table>
                                        </FormGroup>
                                        <hr />
                                    </FormGroup>
                                    <hr />
                                    {this.state.state == 'loading' &&
                                        <div style={{ marginTop: 120, marginBottom: 65 }}>
                                            <div className="loader"></div>
                                        </div>
                                    }
                                    <table className="table-list">
                                        <thead>
                                            <tr>
                                                <th>Facility</th>
                                                <th>Cadre</th>
                                                <th>Treatment</th>
                                                <th># patients</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.filteredStats.map(st =>
                                                <tr key={st.id}>
                                                    <td>{st.facility}</td>
                                                    <td>{st.cadre}</td>
                                                    <td>{st.treatment}</td>
                                                    <td>
                                                        <div>
                                                            <a href="#">
                                                                <InlineEdit
                                                                    validate={this.validateTextValue}
                                                                    activeClassName="editing"
                                                                    text={`` + st.patients}
                                                                    paramName={st.id + '-caseCount'}
                                                                    change={this.handlePatientsChange}
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
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                    
                                    <br/>
                                
                                </div>
                            </div>
                            <br />
                        </div>
                        <br />                       
                    </TabPanel>

                    <TabPanel>
                        <HRUploadPanel 
                            cadres ={this.state.cadres}
                            facilities={this.state.facilities} />
                    </TabPanel>
                </Tabs>
            </Panel>
        );

    }
};
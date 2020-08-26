import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import Multiselect from 'react-multiselect-checkboxes';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaTrash, FaCheck, FaCheckSquare, FaArrowRight, FaFileCsv,FaFileImport,FaCloudUploadAlt } from 'react-icons/fa';
import { CSVLink, CSVDownload } from "react-csv";
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

<<<<<<< HEAD
import HRUploadPanel from './HRUploadPanel';

import ServiceUploadPanel from './ServiceUploadPanel';
=======
import HRUploadPanel from '../import/HRUploadPanel';
import StatisticsContentComponent from './StatisticsContentComponent';
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

export default class StatisticsPage extends React.Component {

    constructor(props) {
        super(props);

<<<<<<< HEAD
        this.state = {      
        };
=======
        this.state = {
            results: [],
            cadres: [],
            filteredCadres: [],
            filteredFacilities:[],
            filteredCadresLeft:[],
            facilities: [],
            years: [],//Save years to db
            regions: [],
            districts: [],
            selectedPeriod: "",
            selectedFacility: "",
            selectedCadreRight: "",
            selectedCadreLeft:'',
            filteredFacility: "",
            filteredCadre: "",
            statistics: [],
            filteredStats: [],
            state: 'done',
            progress:'',
            facilitiesCombo: [],
            csvData:[],

            cadresCombo: [],
            facilityTypes: [],
            selectedFacilities: [],
            selectedCadres: [],
            
            importStatus:'done',
            import_patients_from_dhis2 : false,
            import_patients_from_file :false,
            showFilters:false,
            showUploader:false
        };
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.selectMultipleCadres = this.selectMultipleCadres.bind(this);

        this.csvLink=React.createRef();

        this.importStatisticsFromDhis2 = this.importStatisticsFromDhis2.bind(this);
        this.handleUploadPatients= this.handleUploadPatients.bind(this);

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
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

                let code = fa.code;

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

            this.setState({
                filteredCadresLeft:res.data,
                cadres:res.data
            });

        }).catch(err => console.log(err));

    }

    handlePatientsChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.","ERROR");
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

    filterStatByFacility(facility) {

        let selectedCadre = this.state.selectedCadreRight;

        axios.get(`/countrystatistics/statistics/${facility}/${selectedCadre}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({statistics: res.data})
        }).catch(err => console.log(err));
    }

    filterCadreByFaType(faType) {

        let cadres = this.state.cadres;

        if (faType !== "0") {

            let filtered = cadres.filter(ca => ca.facility_type_code.includes(faType));

            this.setState({filteredCadres: filtered});
        }
    }

    generateCSV(){

        let csvData = [];
        let value="";

        if(this.state.selectedPeriod === '0'){
            this.launchToastr("No period selected.", "ERROR");
            return;
        }
        if(!this.state.selectedFacilities.length > 0){
            this.launchToastr("No facility selected.", "ERROR");
            return;
        }
        if(this.state.selectedCadreLeft === '0' || this.state.selectedCadreLeft === "0"){
            this.launchToastr("No cadre selected.", "ERROR");
            return;
        }

        let facilities = this.state.selectedFacilities;

        let data = {
            selectedCadre: this.state.selectedCadreLeft,
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
                        facilicity_name:fa.name,
                        cadre_code:treat.cadre_code,
                        cadre_name:treat.cadre_name,
                        treatment_code:treat.code,
                        treatment_name:tr_name,
                        period:this.state.selectedPeriod,
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
            this.launchToastr("You don't have permission for this.", "ERROR");
            return;
        }

        if (this.state.selectedPeriod.length == 0) {
            this.launchToastr("Please, select a year first before calculating.", "ERROR");
            return;
        }
        if (typeof (this.state.selectedFacilities) == 'undefined') {
            this.launchToastr("No facility selected.", "ERROR");
            return;
        }
        if (typeof (this.state.selectedCadreLeft) === '' || this.state.selectedCadreLeft === '0') {
            this.launchToastr("No cadre selected.", "ERROR");
            return;
        }

        let data = {
            selectedPeriod: this.state.selectedPeriod,
            selectedFacilities: this.state.selectedFacilities,
            selectedCadreLeft: this.state.selectedCadreLeft,
            countryId : localStorage.getItem('countryId')
        };

        this.setState({ importStatus: 'loading' });

        axios.post(`/dhis2/import_statistics_from_dhis2`, data,{
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
                    importStatus:'done'
                })

            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

    }

    useStatistics(){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.", "ERROR");
            return;
        }

        if (this.state.selectedPeriod.length == 0) {
            this.launchToastr("Please, select a year before calculating.", "ERROR");
            return;
        }
        if (typeof (this.state.selectedFacilities) == 'undefined') {
            this.launchToastr("No facility selected.", "ERROR");
            return;
        }
        if (typeof (this.state.selectedCadres) == 'undefined') {
            this.launchToastr("No cadre selected.", "ERROR");
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

>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
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

    setImportPatientOption(event){

        let value = event.target.value;

        if(value === "DHIS2"){
            this.setState({
                import_patients_from_dhis2 : true,
                import_patients_from_file :false
            })
        }else{
            this.setState({
                import_patients_from_file : true,
                import_patients_from_dhis2 : false
            })
        }
    }

    handleUploadPatients(ev) {

        ev.preventDefault();

        const data = new FormData();

        if (this.uploadPatientsInput.files.length == 0) {
            this.launchToastr("No file selected","ERROR");
            return;
        }

        data.append('file', this.uploadPatientsInput.files[0]);

        axios.post(`/countrystatistics/upload/${localStorage.getItem('countryId')}`, data,
            {
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            },
            {
                onUploadProgress: progressEvent => {
                    var prog = (progressEvent.loaded / progressEvent.total) * 100;
                    var pg = (prog < 100) ? prog.toFixed(2) : prog.toFixed(0);
                    this.setState({ progress: pg });
                    //console.log(pg+"%");
                }
            })
            .then((result) => {

                this.setState({
                    progress: result.data,

                });

                this.launchToastr("Data uploaded successfully.", "SUCCESS");

                //Selecte all statistics
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
<<<<<<< HEAD
            <Panel bsStyle="primary" header="Import service and HR data">
                <Tabs>
                    <TabList>
                        <Tab>Activity statistics</Tab>
                        <Tab>HR data</Tab>   
                    </TabList>

                    <TabPanel>
                        <ServiceUploadPanel />     
=======
            <Panel bsStyle="primary" header="Data import">
                <Tabs>
                    <TabList>
                        <Tab>Yearly statistics</Tab>
                        <Tab># Staff</Tab>
                    </TabList>
                    <TabPanel>
                        <div className="calc-container">
                            <div className="calc-container-left">
                                <Form horizontal>
                                    <div className="div-title">
                                        <b>Set import values</b>
                                    </div>

                                    <div onChange={this.setImportPatientOption.bind(this)}>
                                        <table className="radio-table" cellspacing="10">
                                            <tr>
                                                <td><input type="radio" value="DHIS2" name="import_patient_option" /> Import from DHIS2</td>
                                                <td><input type="radio" value="CSV" name="import_patient_option"/> Import from file</td>
                                            </tr>            
                                        </table>
                                    </div>
                                    <hr/>
                                    <a href="#" onClick={() => this.setState({showFilters : !this.state.showFilters})} >
                                        Show/Hide filters
                                    </a>
                                    {this.state.showFilters &&
                                    <div>
                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={10}>
                                                <b>Year</b>
                                            </Col>

                                            <Col sm={15}>
                                                <div className="div-multiselect">
                                                    <FormControl componentClass="select"
                                                        onChange={e => this.setState({ selectedPeriod: e.target.value })}>
                                                        <option key="000" value="0">Select year </option>
                                                        {(this.state.years.map(yr =>
                                                            <option key={yr.id} value={yr.year}>{yr.year}</option>
                                                        ))}
                                                    </FormControl>
                                                </div>
                                            </Col>
                                        </FormGroup>
                                        <br/>

                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={10}>
                                                <b>Select facility type</b>
                                            </Col>
                                            <Col sm={15}>
                                                <div className="div-multiselect">
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
                                                </div>
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
                                                <b>Cadres({(this.state.filteredCadresLeft.length)})</b>
                                            </Col>
                                            <Col sm={15}>
                                                <div className="div-multiselect">
                                                    <FormControl
                                                        componentClass="select"
                                                        onChange={e => this.setState({selectedCadreLeft: e.target.value})}>
                                                        <option key="000" value="0">Filter by cadre</option>
                                                            {this.state.filteredCadresLeft.map(cd =>
                                                                <option key={cd.std_code} value={cd.std_code}>{cd.name}</option>
                                                        )}
                                                    </FormControl>
                                                </div>
                                                {/*<div className="div-multiselect">
                                                    <Multiselect
                                                        options={this.state.cadresCombo}
                                                        onChange={this.selectMultipleCadres} />
                                                </div>*/}
                                            </Col>
                                        </FormGroup>
                                    </div>
                                    }
                                    <hr />
                                    <table>
                                        {this.state.import_patients_from_dhis2 &&
                                        <tr>
                                            <td>
                                                {(this.state.importStatus == 'loading') && 
                                                    <span className="loader-text"> Loading... </span>
                                                }
                                            </td>
                                           
                                            <td>
                                                    <Button bsStyle="warning" bsSize="medium" onClick={this.importStatisticsFromDhis2}>
                                                        <FaFileImport /> Import statistics from DHIS2
                                                    </Button>
                                                {/*<div className="div-btn-no-dhis2">
                                                    <button className="button" onClick={this.importStatisticsFromDhis2}><FaFileImport /> Import statistics from DHIS2</button>
                                                </div>*/}
                                            </td>
                                            
                                        </tr>
                                        }
                                        {this.state.import_patients_from_file &&
                                        <tr>
                                            <td></td>
                                            <td>
                                                {/*<div className="div-btn-no-dhis2">
                                                    <button className="button" onClick = {() => this.generateCSV()}><FaFileCsv /> Generate file template</button>
                                                </div>*/}
                                                <Button bsStyle="info" bsSize="medium" onClick={() => this.generateCSV()}>
                                                    <FaFileCsv /> Generate template file
                                                </Button>
                                            </td>
                                        </tr>
                                        }
                                    </table>
                                    <br/>
                                    {this.state.import_patients_from_file && 
                                    <div>
                                        <form onSubmit={this.handleUploadPatients}>
                                            {/*<div>
                                                <input ref={(ref) => { this.uploadCadreInput = ref; }} type="file" />
                                            </div>*/}
                                            <div class="upload-btn-wrapper">
                                                <button class="btn">
                                                    <FaCloudUploadAlt /> Load generated file...
                                                </button>
                                                <input ref={(ref) => { this.uploadPatientsInput = ref; }} type="file" />
                                            </div>
                                            <br />
                                            <br />
                                            <div>
                                                <span>
                                                    <button className="button">
                                                        <FaCheck /> Upload this file
                                                    </button><span> {this.state.progress}</span>
                                                </span>
                                            </div>
                                        </form>
                                    </div>
                                    }
                                    {/*<div style={{ textAlign: "right", padding: 10 }}>
                                        <div className="import-stat">
                                            <div>
                                                <Button bsStyle="warning" bsSize="medium" onClick={this.importStatisticsFromDhis2}>
                                                    <FaFileImport /> Import statistics from DHIS2
                                                </Button>
                                            </div>
                                            {(this.state.importStatus == 'loading') && 
                                                <div>
                                                    <span className="loader-text"> Loading... </span>
                                                </div>
                                            }
                                        </div>
                                            
                                        <br/><br/>
                                        <Button bsStyle="info" bsSize="medium" onClick={() => this.generateCSV()}>
                                            <FaFileCsv /> Generate csv
                                        </Button>
                                    </div>*/}

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
                                        <StatisticsContentComponent 
                                                years={this.state.years}
                                                cadres={this.state.cadres}
                                                facilities={this.state.facilities}
                                                facilityTypes={this.state.facilityTypes}/>
                                </div>
                            </div>
                            <br />
                        </div>
                        <br />                       
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
                    </TabPanel>
                    <TabPanel>
                        <HRUploadPanel 
                            cadres ={this.state.cadres}
                            facilities={this.state.facilities} 
                            launchToastr={(msg,type) => this.launchToastr(msg,type)}/>
                    </TabPanel>
                </Tabs>
            </Panel>
        );

    }
};
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


export default class StatisticsContentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            results: [],
            cadres: [],
            facilities: [],
            filteredCadres: [],
            filteredFacilities:[],
            years: [],
            selectedPeriod: "",
            selectedFacility: "",
            selectedType:"",
            selectedCadre: "",
            statistics: [],
            filteredStatistics:[],
            state: 'done',
            facilityTypes: [],
            showFilters:false,
        };
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

        this.setState({ selectedFacility:facility});

        let selectedCadre = this.state.selectedCadre;

        axios.get(`/countrystatistics/statistics/${facility}/${selectedCadre}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                statistics: res.data,
                filteredStatistics: res.data
            })
        }).catch(err => console.log(err));
    }

    filterCadreByFaType(faType) {

        let cadres = this.state.cadres;

        if (faType !== "0") {

            let filtered = cadres.filter(ca => ca.facility_type_code.includes(faType));

            this.setState({filteredCadres: filtered});
        }
    }

    filterStatByYear(year) {

        let stats = this.state.statistics;

        if (year !== "") {

            let filtered = stats.filter(st => st.year.includes(year));

            this.setState({filteredStatistics: filtered});
        }
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
                    filteredStatistics: res.data,
                })

            }).catch(err => console.log(err));
        }).catch(err => console.log(err));

    }

    filterCtCadreByFaType(faTypeCode){

        let cadres = this.props.cadres;
        
        let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

        this.setState({
            filteredCadres: filtered,
            selectedType:faTypeCode
        });

        this.filterFacilityByType(faTypeCode);
    }

    filterFacilityByType(faTypeCode){

        let facilities = this.props.facilities;

        let filtered = facilities.filter(fa => fa.faTypeCode.includes(faTypeCode));

        this.setState({
            filteredFacilities:filtered
        });
    }

    render() {
        return (
            <div>
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={20}>
                                                <div className="div-title">
                                                    <b>Annual treatment statistics - </b>({this.state.statistics.length})
                                                </div>
                                            </Col>
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
                                                                        onChange={e => this.setState({selectedCadre: e.target.value})}>
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
                                                                <Col sm={10}>
                                                                    <FormControl
                                                                        componentClass="select"
                                                                        onChange={e => this.filterStatByFacility(e.target.value)}>
                                                                        <option key="000" value="0">Filter by facility</option>
                                                                        {this.state.filteredFacilities.map(fa =>
                                                                            <option key={fa.code} value={fa.code}>{fa.name}</option>
                                                                        )}
                                                                    </FormControl>
                                                                </Col>
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td><b>Filter by year</b></td>
                                                        <td>
                                                            <FormGroup>
                                                                <Col sm={15}>
                                                                    <input typye="text" className="form-control"
                                                                        placeholder="Filter by year" onChange={e => this.filterStatByYear(e.target.value)} />
                                                                </Col>
                                                            </FormGroup>
                                                        </td>
                                                    </tr>
                                                </table>
                                            }
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
                                                    <th>Treatment</th>
                                                    <th>Year</th>
                                                    <th># patients</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {this.state.filteredStatistics.map(st =>
                                                    <tr key={st.id}>
                                                        <td>{(st.name_customized.length > 0)? st.name_customized:st.name_std}</td>
                                                        <td>{st.year}</td>
                                
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
        );

    }
};
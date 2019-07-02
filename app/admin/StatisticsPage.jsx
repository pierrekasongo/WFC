import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import Multiselect from 'react-multiselect-checkboxes';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaTrash, FaCheck, FaCheckSquare, FaArrowRight } from 'react-icons/fa';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import HRUploadPanel from '../import/HRUploadPanel';

export default class StatisticsPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            results: [],
            cadres: [],
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
        };

        this.importStatisticsFromDhis2 = this.importStatisticsFromDhis2.bind(this);

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

                cadresCombo.push({ label: cadre.name, value: cadre.hris_code });
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

        this.setState({ filteredStats: stats.filter(st => st.facility.toLowerCase().includes(facility.toLowerCase())) })
        //let cadre = st.cadre.toUpperCase();
        //item => item.name.includes(this.state.input)
        //let filter = this.state.filteredCadre.toUpperCase();
        // return this.state.statistics.indexOf(filter) > -1;
    }
    filterStatByCadre(cadreCode) {

        let stats = this.state.filteredStats;

        if (cadreCode !== "000") {

            this.setState({
                filteredStats: stats.filter(st => st.cadre_code.includes(cadreCode))
            })
        }
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

                                    <FormGroup>
                                        <Col sm={15}>
                                            <FormGroup>
                                                <Col componentClass={ControlLabel} sm={10}>
                                                    <b>Facilities ({(this.state.facilities.length)})</b>
                                                </Col>
                                                <Col sm={15}>
                                                    <FormControl componentClass="select"
                                                        onChange={e => this.setState({ selectedFacilities: e.target.value })}>
                                                        <option key="000" value="000">Select value</option>
                                                        {(this.state.facilities.map(fa =>
                                                            <option key={fa.code} value={fa.code}>{fa.name}</option>
                                                        ))}
                                                    </FormControl>
                                                </Col>
                                            </FormGroup>
                                        </Col>
                                    </FormGroup>

                                    <FormGroup>
                                        <Col sm={15}>
                                            <FormGroup>
                                                <Col componentClass={ControlLabel} sm={10}>
                                                    <b>Cadres ({(this.state.cadres.length)})</b>
                                                </Col>
                                                <Col sm={15}>
                                                    <FormControl componentClass="select"
                                                        onChange={e => this.setState({ selectedCadres: e.target.value })}>
                                                        <option key="000" value="000">Select value</option>
                                                        {(this.state.cadres.map(cd =>
                                                            <option key={cd.code} value={cd.code}>{cd.name}</option>
                                                        ))}
                                                    </FormControl>
                                                </Col>
                                            </FormGroup>
                                        </Col>
                                    </FormGroup>
                                    <hr />
                                    <div style={{ textAlign: "right", paddingTop: 10 }}>
                                        <Button bsStyle="warning" bsSize="medium" onClick={this.importStatisticsFromDhis2}>Import statistics from DHIS2</Button>
                                    </div>
                                </Form>
                            </div>
                            <div className="calc-container-right">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Annual treatment statistics - </b>({this.state.filteredStats.length})
                                        </div>
                                    </Col>
                                    <table>
                                        <tr>
                                            <td>
                                                <FormGroup>
                                                    <Col sm={15}>
                                                        <FormControl componentClass="select"
                                                            onChange={e => this.filterStatByCadre(e.target.value)}>
                                                            <option key="000" value="000">Filter by cadre</option>
                                                            {this.state.cadres.map(cd =>
                                                                <option key={cd.code} value={cd.code}>{cd.name}</option>
                                                            )}
                                                        </FormControl>
                                                    </Col>
                                                </FormGroup>
                                            </td>

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
                                {/*<button className="button" onClick={this.useStatistics}><FaCheck /> Use this</button>*/}
                            </div>
                            <br />
                        </div>
                        <br />                       
                    </TabPanel>

                    <TabPanel>
                        <HRUploadPanel 
                            cadresCombo ={this.state.cadresCombo}
                            facilitiesCombo={this.state.facilitiesCombo} />
                    </TabPanel>
                </Tabs>
            </Panel>
        );

    }
};
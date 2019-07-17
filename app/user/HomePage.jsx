import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, FormControl, Col, Checkbox,PanelGroup,Accordion } from 'react-bootstrap';
import axios from 'axios';
import {FaStethoscope,FaUserMd,FaClinicMedical,FaCapsules,FaCheck,FaTable,FaRegChartBar} from 'react-icons/fa';
import  { withRouter } from 'react-router-dom';
import Multiselect from 'react-multiselect-checkboxes';
import {BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Label} from 'recharts'

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state={
            activitiesCount:0,
            facilitiesCount:0,
            staffCount:0,
            cadreCount:0,
            facilitiesCombo: [],
            facilityInputs: {},
            selectedFacilities: {},
            showChart:true,
            showTable:false,
            dashboards:[],
            facilityTypes:[],
            filteredFacilities:[]
        };
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);

        //this.fillLists();
        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                facilities : res.data,
                filteredFacilities : res.data
            })
        }).catch(err => console.log(err));

        axios.get('/dhis2/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({facilityTypes : res.data})
        }).catch(err => console.log(err));

        axios.get(`/countrytreatment/count_treatments/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
                this.setState({
                    activitiesCount: res.data[0].nb
                });
                
        }).catch(err => console.log(err));

        axios.get(`/dhis2/count_facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                facilitiesCount: res.data[0].nb
            });           
        }).catch(err => console.log(err));

        axios.get(`/countrycadre/count_cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                cadreCount: res.data[0].nb
            });           
        }).catch(err => console.log(err));
    }

    selectMultipleFacilities(values) {

        let selectedFacilities = {};

        values.forEach(val => {

            let name = val.label;
            let ident = val.value.split("|");
            let id = ident[0];
            let code = ident[1];

            selectedFacilities[id] = {
                id: id,
                code: code,
                name: name
            };
        })
        this.setState({ 
            selectedFacilities: selectedFacilities,
            showChart:false
        });
    }

    loadChart(){

        let data = {
            selectedFacilities : this.state.selectedFacilities
        }
        this.setState({
            showChart: false,
            showTable: false
        });
        axios.post(`/dashboard`,data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                dashboards: res.data,
                showChart:true
            });
                
        }).catch(err => console.log(err));
    }

    displayToggle(type){

        if(type === "TABLE"){
            this.setState({
                showTable:true,
                showChart:false
            })
        }else{
            this.setState({
                showChart:true,
                showTable:false
            })
        }
    }

    filterFacilityByType(faTypeCode){

        let facilities = this.state.facilities;
        
        if(faTypeCode === "0"){
            this.setState({filteredFacilities:facilities});
        }else{

            let filtered = facilities.filter(fa => fa.faTypeCode.includes(faTypeCode));

            //this.setState({filteredFacilities: filtered});
            let facilitiesCombo = [];

            filtered.forEach(fa => {

                let id = fa.id+'|'+fa.code

                facilitiesCombo.push({ label: fa.name, value: id });
            });
            this.setState({facilitiesCombo: facilitiesCombo});
        }
    }

    renderDashboard() {
        return (
            <div className="intro-screen">
                <div className="welcome-box">
                    <p>Welcome <b>{localStorage.getItem('username')}</b>, logedin as <b>{localStorage.getItem('role')}</b></p>
                </div>
                <Panel bsStyle="primary" header="Home">
                <br/>
                
                <div class="container">
                    <div class="row">
                        <div class="col-md-4 col-xl-3">
                                <div class="card bg-c-pink order-card">
                                    <div class="card-block">
                                        <h6 class="m-b-20"><b>Cadres</b></h6>
                                        <h2 class="text-right">
                                            <FaUserMd />
                                            <span>
                                                <a href="#">
                                                    {this.state.cadreCount}
                                                </a>  
                                            </span>
                                        </h2>
                                        {/*<h2 class="text-right"><i class="fa fa-users f-left"></i><span>{this.state.cadreCount}</span></h2>
                                        <ul>
                                            {Object.keys(this.state.cadres).map(id => 
                                                <li>{this.state.cadres[id].name}</li>
                                            )}
                                        </ul>*/}
                                    </div>
                                </div>
                            </div>
                            {/*<div class="col-md-4 col-xl-3">
                                <div class="card bg-c-yellow order-card">
                                    <div class="card-block">
                                        <h6 class="m-b-20">Staffs</h6>
                                        <ul>
                                            {Object.keys(this.state.staffs).map(id => 
                                                <li key={id}>{this.state.staffs[id].cadre}&nbsp;: {this.state.staffs[id].nb}</li>
                                            )}
                                        </ul>
                                         
                                    </div>
                                </div>
                            </div>*/}
                            
                            <div class="col-md-4 col-xl-3">
                                <div class="card bg-c-blue order-card">
                                    <div class="card-block">
                                        <h6 class="m-b-20"><b>Treatments</b></h6>
                                        <h2 class="text-right"><FaCapsules /><span>{this.state.activitiesCount}</span></h2>
                                        {/*<p class="m-b-0">Completed Orders<span class="f-right">351</span></p>*/}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4 col-xl-3">
                                <div class="card bg-c-green order-card">
                                    <div class="card-block">
                                        <h6 class="m-b-20"><b>Facilities</b></h6>
                                        <h2 class="text-right"><FaClinicMedical /><span>{this.state.facilitiesCount}</span></h2>
                                        {/*<p class="m-b-0">Completed Orders<span class="f-right">351</span></p>*/}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                        <hr/>
                        <Col componentClass={ControlLabel} sm={20}>
                            <div className="div-title">
                                <b>Archived workforce pressure</b>
                            </div>
                        </Col>
                        <table cellpadding="15">
                            <tr>
                                <td><b>Filter by facility type</b></td>
                                <td>
                                <FormGroup>
                                    <Col sm={15}>
                                        <FormControl
                                            componentClass="select"
                                            onChange={e => this.filterFacilityByType(e.target.value)}>
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
                                <td><b>Select facilities</b></td>
                                <td>
                                    <FormGroup>
                                        <Col sm={15}>
                                            <div className="div-multiselect">
                                                <Multiselect
                                                        options={this.state.facilitiesCombo}
                                                        onChange={this.selectMultipleFacilities} />
                                            </div>
                                        </Col>
                                    </FormGroup>
                                </td>
                                <td>
                                    <div>
                                        <button className="button" onClick={() => this.loadChart()}><FaCheck /> Display</button>
                                    </div>
                                </td>
                            </tr>
                        </table>
                        <hr/>
                        <table cellPadding="5">
                            <tr>
                                <td>
                                    <a href="#" onClick={() => this.displayToggle("TABLE")}><FaTable /></a>
                                </td>

                                <td>
                                    <a href="#" onClick={() => this.displayToggle("CHART")}><FaRegChartBar /></a>
                                </td>
                            </tr>
                        </table>
                        {this.state.showChart &&
                            <div className="chart-container">
                                {this.state.dashboards.map(dashData =>
                                    <div className="chart-div">
                                        <div className="graph-title">{dashData.facility}</div>
                                        <div>
                                            <BarChart width={500} height={250} data={dashData.dash}
                                                                        margin={{top: 10, right: 10, left: 10, bottom: 5}}>
                                                <CartesianGrid strokeDasharray="3 3"/>
                                                <XAxis dataKey="cadre"/>
                                                <YAxis/>
                                                <Tooltip/>
                                                <Legend />
                                                <Bar dataKey="current" fill="#8884d8" />
                                                <Bar dataKey="needed" fill="#82ca9d" />
                                            </BarChart>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                        {this.state.showTable && 
                            <div className="chart-container">
                                {this.state.dashboards.map(dashData =>
                                    <div className="chart-div">
                                        <div className="graph-title">{dashData.facility}</div>
                                        <div>
                                            <table className="table-list">
                                                <th>Cadre</th>
                                                <th>Current</th>
                                                <th>Needed</th>
                                                {dashData.dash.map(d =>
                                                    <tr>
                                                        <td>{d.cadre}</td>
                                                        <td>{d.current}</td>
                                                        <td>{d.needed}</td>
                                                    </tr>
                                                )}
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        }
                    </div>
                    <br/>
                </Panel>
                
            </div>
        );
    }
    render() {
        return (
            this.renderDashboard()
        );
    }

};
export default withRouter(HomePage)

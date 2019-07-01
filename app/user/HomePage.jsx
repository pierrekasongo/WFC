import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, FormControl, Col, Checkbox,PanelGroup,Accordion } from 'react-bootstrap';
import axios from 'axios';
import {FaStethoscope,FaUserMd,FaClinicMedical,FaCapsules} from 'react-icons/fa';
import  { withRouter } from 'react-router-dom'

class HomePage extends React.Component {

    constructor(props) {
        super(props);

        this.state={
            activitiesCount:0,
            facilitiesCount:0,
            staffCount:0,
            cadreCount:0,
            staffs:[],
            cadres:[]
        };

        /*axios.get('/admin/count')
            .then(res => this.setState({ count: res.nb }))
            .catch(err => console.log(err));*/

        axios.get('/admin/count_activities',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
                this.setState({
                    activitiesCount: res.data[0].nb
                });
                
        }).catch(err => console.log(err));

        axios.get('/user/count_facilities',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({
                facilitiesCount: res.data[0].nb
            });           
        }).catch(err => console.log(err));

        axios.get('/user/count_staffs',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({
                staffCount: res.data[0].nb
            });           
        }).catch(err => console.log(err));

        axios.get('/user/staff_per_cadre',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({
                staffs:res.data
            });

        }).catch(err => console.log(err));

        axios.get('/user/count_cadres',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({
                cadreCount: res.data[0].nb
            });           
        }).catch(err => console.log(err));

        axios.get('/user/cadres',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({
                cadres:res.data
            });

        }).catch(err => console.log(err));
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
                                        <h6 class="m-b-20">Cadres</h6>
                                        <h2 class="text-right">
                                            <FaUserMd />
                                            <span>
                                                <a href="#">
                                                    {this.state.cadres.length}
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
                                        <h6 class="m-b-20">Treatments</h6>
                                        <h2 class="text-right"><FaCapsules /><span>{this.state.activitiesCount}</span></h2>
                                        {/*<p class="m-b-0">Completed Orders<span class="f-right">351</span></p>*/}
                                    </div>
                                </div>
                            </div>
                            
                            <div class="col-md-4 col-xl-3">
                                <div class="card bg-c-green order-card">
                                    <div class="card-block">
                                        <h6 class="m-b-20">Facilities</h6>
                                        <h2 class="text-right"><FaClinicMedical /><span>{this.state.facilitiesCount}</span></h2>
                                        {/*<p class="m-b-0">Completed Orders<span class="f-right">351</span></p>*/}
                                    </div>
                                </div>
                            </div>
                            
                        </div>
                    </div>
                    {/*<hr/>
                    <div class="container-fluid bg-3">
                        <div class="row">
                            <div class="col-sm-4">
                                <a href="/import">
                                    <button type="button" class="btn btn-info">1</button>
                                </a>
                                <p>Import all required data from dhis2, ihris or csv files into the system.</p>
                            </div>
                            <div class="col-sm-4">
                                <a href="/admin">
                                    <button type="button" class="btn btn-info">2</button>
                                </a>
                                <p>Set time(duration) for each treatment(activity) involved in the calculation.</p>
                            </div>
                            <div class="col-sm-4">
                                <a href="/statistics">
                                    <button type="button" class="btn btn-info">3</button>
                                </a>
                                <p>Import annual treatments data.</p>
                            </div>
                            <div class="col-sm-4">
                                    <a href="/user">
                                        <button type="button" class="btn btn-info">4</button>
                                    </a>
                                <p>Import all required data from dhis2, ihris or csv files into the system.</p>
                            </div>
                        </div>
                    </div>*/}
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

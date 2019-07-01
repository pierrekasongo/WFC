import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaCheck, FaTrash, FaEdit, FaCheckSquare } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import InlineEdit from 'react-edit-inline2';

export default class CadreTimePage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stdCadres: [],
            countryCadres: [],
            cadreToDelete: '',
            cadreMap: new Map(),
            config:{},
        };

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let cadreMap = new Map();

            res.data.forEach(cd => {

                cadreMap.set(cd.std_code, "");
            })
            this.setState({

                countryCadres: res.data,

                cadreMap: cadreMap
            });
        }).catch(err => console.log(err));

        axios.get(`/configuration/getCountryHolidays/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let config = {};

            res.data.forEach(cf => {

                config={
                    id:cf.id,
                    parameter:cf.parameter,
                    value:cf.value
                }
            })
            this.setState({config:config});
        }).catch(err => console.log(err));
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

    deleteCadre(code) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        this.setState({
            cadreToDelete: code
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this cadre?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.delete(`/countrycadre/deleteCadre/${this.state.cadreToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            let cadreMap = new Map();
                                            res.data.forEach(cd => {
                                                cadreMap.set(cd.std_code, "");
                                            })
                                            this.setState({
                                                countryCadres: res.data,
                                                cadreMap: cadreMap
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

    handleHolidaysChange(obj){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        const id= Object.keys(obj)[0];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            value: value,
        };
        axios.patch('/configuration/config', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/configuration/getCountryHolidays/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {

            }).catch(err => console.log(err));

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    handleCadreChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

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

    render() {
        return (
            <div className="tab-main-container">
                <Panel bsStyle="primary" header="Cadre working / not working time">
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={20}>
                            <div className="div-title">
                                <b>Cadre working and not working time</b> ({this.state.countryCadres.length})
                            </div>
                            <hr />
                        </Col>
                    </FormGroup>

                    <FormGroup>
                        <table>
                            <tr>
                                <td><b>Country public holidays: </b></td>
                                <td>
                                    <div>
                                        <a href="#">
                                            <InlineEdit
                                                validate={this.validateTextValue}
                                                activeClassName="editing"
                                                text={this.state.config.value}
                                                paramName={this.state.config.id}
                                                change={this.handleHolidaysChange}
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
                            </tr>
                        </table>
                    </FormGroup>
                    <br/>
                    <table className="table-list" cellspacing="5">
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>Days per week</th>
                                <th>Hours per day</th>
                                <th>Annual leave</th>
                                <th>Sick leave</th>
                                <th>Other leave</th>
                                <th>Admin task (%)</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.countryCadres.map(cadre =>
                                <tr key={cadre.std_code} >
                                    <td>
                                        {cadre.name}
                                    </td>
                                    <td align="center">
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={"" + cadre.work_days}
                                                    paramName={cadre.std_code + '-work_days'}
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
                                                    paramName={cadre.std_code + '-work_hours'}
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
                                                    paramName={cadre.std_code + '-annual_leave'}
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
                                                    paramName={cadre.std_code + '-sick_leave'}
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
                                                    paramName={cadre.std_code + '-other_leave'}
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
                                                    text={"" + cadre.admin_task}
                                                    paramName={cadre.std_code + '-admin_task'}
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
                                    <td>
                                        <a href="#" onClick={() => this.deleteCadre(cadre.std_code)}>
                                            <FaTrash />
                                        </a>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <br />
                    <br />
                </Panel>
                <br />
            </div>
        )
    }
};
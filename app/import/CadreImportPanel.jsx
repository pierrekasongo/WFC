import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaCheck, FaTrash, FaEdit, FaCheckSquare } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import InlineEdit from 'react-edit-inline2';

export default class CadreImportPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            stdCadres: [],
            countryCadres: [],
            cadreToDelete: '',
            cadreMap: new Map(),
        };
        axios.get('/metadata/cadres',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({ stdCadres: res.data });

        }).catch(err => console.log(err));

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
                                        Authorization : 'Bearer '+this.props.token
                                    }
                                })
                                    .then((res) => {
                                        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                                            headers :{
                                                Authorization : 'Bearer '+this.props.token
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
                Authorization : 'Bearer '+this.props.token
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

    useStdCadre(code) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        axios.get(`/metadata/getCadre/${code}`,{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {

            let stdCadre = res.data[0];

            let code = stdCadre.code;

            let workDay = stdCadre.work_days;

            let workHours = stdCadre.work_hours;

            let annualLeave = stdCadre.annual_leave;

            let sickLeave = stdCadre.sick_leave;

            let otherLeave = stdCadre.other_leave;

            let adminTask = stdCadre.admin_task;

            let data = {
                stdCode: code,
                workDay:workDay,
                workHours:workHours,
                annualLeave:annualLeave,
                sickLeave:sickLeave,
                otherLeave:otherLeave,
                adminTask: adminTask
            }

            axios.post(`/countrycadre/insertCadre`, data,{
                headers :{
                    Authorization : 'Bearer '+this.props.token
                }
            }).then(res => {

                axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                    headers :{
                        Authorization : 'Bearer '+this.props.token
                    }
                }).then(res => {

                    let cadreMap = new Map();

                    res.data.forEach(cd => {
                        cadreMap.set(cd.std_code, "")
                    })
                    this.setState({
                        countryCadres: res.data,
                        cadreMap: cadreMap
                    });

                }).catch(err => console.log(err));

            }).catch(err => console.log(err));


        }).catch(err => console.log(err));
    }

    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div>
                        <div class="alert alert-warning" role="alert">
                            <p>You can choose cadres from the left side by clicking the "Use" button.</p>
                            <p>This will copy the selected standard cadre to your country database.</p>
                        </div>

                        <div className="cadres-container">
                            <div className="div-flex-table-left">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Standard cadres</b> ({this.state.stdCadres.length})
                                        </div>
                                    </Col>
                                </FormGroup>

                                <table className="table-list" cellSpacing="50">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Name (fr)</th>
                                            <th>Name (en)</th>
                                            <th colSpan="2"></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.stdCadres.map(cadre =>
                                            <tr key={cadre.code} >
                                                <td>
                                                    {cadre.code}
                                                </td>
                                                <td>{cadre.name_fr}</td>
                                                <td>{cadre.name_en}</td>
                                                {/*<td align="center">{cadre.worktime}</td>
                                                    <td align="center">{cadre.admin_task}</td>*/}
                                                <td colSpan="3">
                                                    {!this.state.cadreMap.has(cadre.code) &&
                                                        <a href="#" onClick={() => this.useStdCadre(`${cadre.code}`)}>
                                                            <FaCheckSquare />use
                                                        </a>
                                                    }
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="div-flex-table-right">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Country customized cadres</b> ({this.state.countryCadres.length})
                                        </div>
                                    </Col>
                                </FormGroup>

                                <table className="table-list" cellSpacing="50">
                                    <thead>
                                        <tr>
                                            <th>Name</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.countryCadres.map(cadre =>
                                            <tr key={cadre.std_code} >
                                                <td>
                                                    {cadre.name}
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
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }

};
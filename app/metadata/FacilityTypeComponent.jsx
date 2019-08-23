import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Row, Radio, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';
import { Route, Redirect, Switch, Link } from 'react-router-dom';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import "react-tabs/style/react-tabs.css";
import InlineEdit from 'react-edit-inline2';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaTrash, FaCloudUploadAlt, FaCheck, FaPlusSquare } from 'react-icons/fa';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import NewFacilityTypeComponent from './NewFacilityTypeComponent';

export default class FacilityTypeComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            facilityTypes: this.props.facilityTypes,
            showingNew: false,
            typeToDelete: ''
        };
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

    validateTextValue(text) {
        return (text.length > 0 && text.length < 64);
    }

    delete(id) {

        this.setState({
            typeToDelete: id
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this type?</p>
                        <p>This will also delete treatments attached to it.</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.delete(`/metadata/deleteType/${this.state.typeToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/facilityTypes',{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            this.setState({ facilityTypes: res.data });
                                        }).catch(err => console.log(err));
                                    }).catch(err => {
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
    handleTypeChange(obj) {

        const ident = Object.keys(obj)[0].split("|");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };

        axios.patch('/metadata/editType', data,{
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

    newTypeSave(info) {

        let code = info.code;
        let name_fr = info.name_fr;
        let name_en = info.name_en;
        let data = {
            code: code,
            name_fr: name_fr,
            name_en: name_en
        };

        //Insert cadre in the database
        axios.post('/metadata/insertType', data,{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            //Update the cadres list
            axios.get('/metadata/facilityTypes',{
                headers :{
                    Authorization : 'Bearer '+this.props.token
                }
            }).then(res => {
                this.setState({
                    facilityTypes: res.data,
                    showingNew: false
                });
            }).catch(err => console.log(err));

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
                <div className="div-title">
                    <b>Available facility types ({this.state.facilityTypes.length})</b>
                 </div>
                <hr />
                <div className="div-table">
                    <div className="div-add-new-link">
                        <a href="#" className="add-new-link" onClick={() => this.setState({ showingNew: true })}>
                            <FaPlusSquare /> Add new
                        </a>
                    </div>
                    <br />
                    <table className="table-list">
                        <thead>
                            <tr>
                                <th>Name (fr)</th>
                                <th>Name (en)</th>
                                <th colSpan="2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.showingNew &&
                                <NewFacilityTypeComponent
                                    save={info => this.newTypeSave(info)}
                                    cancel={() => this.setState({ showingNew: false })} />
                            }
                            {this.state.facilityTypes.map(ft =>
                                <tr key={ft.code} >
                                    <td>
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={ft.name_fr}
                                                    paramName={ft.code + '|name_fr'}
                                                    change={this.handleTypeChange}
                                                    style={{
                                                        /*backgroundColor: 'yellow',*/
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
                                    <td>
                                        {/*cadre.name_en*/}
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={ft.name_en}
                                                    paramName={ft.code + '|name_en'}
                                                    change={this.handleTypeChange}
                                                    style={{
                                                        /*backgroundColor: 'yellow',*/
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
                                    
                                    <td colSpan="2">
                                        <a href="#" onClick={() => this.delete(`${ft.code}`)}>
                                            <FaTrash />
                                        </a>
                                    </td>
                                </tr>
                            )}

                        </tbody>
                    </table>
                </div>
            </div>
        )
    }
};
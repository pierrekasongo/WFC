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
import { FaTrash, FaCloudUploadAlt, FaCheck, FaPlusSquare,FaFileExcel } from 'react-icons/fa';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import * as FileSaver from 'file-saver';

import * as XLSX from 'xlsx';

import NewFacilityTypeComponent from './NewFacilityTypeComponent';

export default class FacilityTypeComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            facilityTypes: this.props.facilityTypes,
            showingNew: false,
            typeToDelete: ''
        };
<<<<<<< HEAD:app/admin/FacilityTypeComponent.jsx
        axios.get('/facility/facilityTypes').then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));
=======
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/FacilityTypeComponent.jsx
    }
    
    createTemplate(facilityTypes){

        const template = [];

        facilityTypes.forEach(ft => {

            template.push({"Code":ft.code,"Name":ft.name});
        });

        return template;
    }
  
    async generateTemplate(facilityTypes){

        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const fileName = 'facilityType';

        const template = await this.createTemplate(facilityTypes);

        
        const wb = XLSX.utils.book_new();

        const ws_template = XLSX.utils.json_to_sheet(template);
        XLSX.utils.book_append_sheet(wb,ws_template,"FACILITY TYPES");
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
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

<<<<<<< HEAD:app/admin/FacilityTypeComponent.jsx
                                axios.delete(`/facility/deleteType/${this.state.typeToDelete}`)
                                    .then((res) => {
                                        //Update cadres
                                        axios.get('/facility/facilityTypes').then(res => {
=======
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
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/FacilityTypeComponent.jsx
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

<<<<<<< HEAD:app/admin/FacilityTypeComponent.jsx
        axios.patch('/facility/editType', data).then(res => {
=======
        axios.patch('/metadata/editType', data,{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/FacilityTypeComponent.jsx

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
        let name= info.name;
        let data = {
            code: code,
            name: name
        };

        //Insert cadre in the database
<<<<<<< HEAD:app/admin/FacilityTypeComponent.jsx
        axios.post('/facility/insertType', data).then(res => {
            //Update the cadres list
            axios.get('/facility/facilityTypes').then(res => {
=======
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
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/FacilityTypeComponent.jsx
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
                    <table>
                        <tr>
                            {/*<td>
                                <div className="div-add-new-link">
                                    <a href="#" className="add-new-link" onClick={() => this.setState({ showingNew: true })}>
                                        <FaPlusSquare /> Add new
                                    </a>
                                </div>
                            </td>*/}
                            <td>
                                <div>
                                    <button className="button" onClick={() => this.generateTemplate(this.state.facilityTypes)}>
                                    <FaFileExcel /> Download</button>
                                </div>  
                            </td>
                        </tr>
                    </table>
                    
                    <br />
                    <br />
                    <table className="table-list">
                        <thead>
                            <tr>
                                <th>Name</th>
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
                                        {/*cadre.name_en*/}
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={ft.name}
                                                    paramName={ft.code + '|name'}
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
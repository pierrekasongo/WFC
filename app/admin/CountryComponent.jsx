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

import NewCountryComponent from './NewCountryComponent';

export default class CountryComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            countries: this.props.countries,
            showingNewCountry: false,
            countryToDelete: ''
        };

        axios.get('/metadata/countries',{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            this.setState({ countries: res.data });
        }).catch(err => {
            console.log(err);
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
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

    validateTextValue(text) {
        return (text.length > 0 && text.length < 64);
    }

    deleteCountry(id) {

        this.setState({
            countryToDelete: id
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this country?</p>
                        <p>This will also delete users attached to this country</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                  <button
                            onClick={() => {

                                axios.delete(`/metadata/deleteCountry/${this.state.countryToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+this.props.token
                                    }
                                }).then((res) => {
                                        //Update cadres
                                        axios.get('/metadata/countries',{
                                            headers :{
                                                Authorization : 'Bearer '+this.props.token
                                            }
                                        }).then(res => {
                                            this.setState({ countries: res.data });
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
    handleCountryChange(obj) {

        const ident = Object.keys(obj)[0].split("-");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };

        axios.patch('/metadata/editCountry', data,{
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

    newCountrySave(info) {

        let code = info.code;
        let name_fr = info.name_fr;
        let name_en = info.name_en;
        let holidays = info.holidays;
        let data = {
            code: code,
            name_fr: name_fr,
            name_en: name_en,
            holidays: holidays
        };

        //Insert cadre in the database
        axios.post('/metadata/insertCountry', data,{
            headers :{
                Authorization : 'Bearer '+this.props.token
            }
        }).then(res => {
            //Update the cadres list
            axios.get('/metadata/countries').then(res => {
                this.setState({
                    countries: res.data,
                    showingNewCountry: false
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
                    Available countries ({this.state.countries.length})
                 </div>
                <hr />
                <div className="div-table">
                    <div className="div-add-new-link">
                        <a href="#" className="add-new-link" onClick={() => this.setState({ showingNewCountry: true })}>
                            <FaPlusSquare /> Add new
                                    </a>
                    </div>
                    <br />
                    <table className="table-list">
                        <thead>
                            <tr>
                                <th>Code</th>
                                <th>Name (fr)</th>
                                <th>Name (en)</th>
                                <th># Public holidays</th>
                                <th colSpan="2"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {
                                this.state.showingNewCountry &&
                                <NewCountryComponent
                                    save={info => this.newCountrySave(info)}
                                    cancel={() => this.setState({ showingNewCountry: false })} />
                            }
                            {this.state.countries.map(ct =>
                                <tr key={ct.id} >
                                    <td>
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={ct.code}
                                                    paramName={ct.id + '-code'}
                                                    change={this.handleCountryChange}
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
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={ct.name_fr}
                                                    paramName={ct.id + '-name_fr'}
                                                    change={this.handleCountryChange}
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
                                                    text={ct.name_en}
                                                    paramName={ct.id + '-name_en'}
                                                    change={this.handleCountryChange}
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
                                    <td align="center">
                                        <div>
                                            <a href="#">
                                                <InlineEdit
                                                    validate={this.validateTextValue}
                                                    activeClassName="editing"
                                                    text={`` + ct.holidays}
                                                    paramName={ct.id + '-holidays'}
                                                    change={this.handleCountryChange}
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
                                        <a href="#" onClick={() => this.deleteCountry(`"${ct.id}"`)}>
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
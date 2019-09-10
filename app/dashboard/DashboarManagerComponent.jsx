import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Button, Table, FormGroup,Col } from 'react-bootstrap';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import Multiselect from 'react-multiselect-checkboxes';
import {FaCheck, FaEdit} from 'react-icons/fa';
import InlineEdit from 'react-edit-inline2';

export default class DashboardManagerComponent extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
        };
    }

    handleDashEdit(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You need edit permission to perform this action.");
            return;
        }

        const ident = Object.keys(obj)[0].split("|");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };
        axios.patch('/dashboard/edit', data,{
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
            <div>
                <div className="div-title">
                    <h3 className="manage-dashboard-head-title">
                        <a href="#">
                            <InlineEdit
                                validate={this.validateTextValue}
                                activeClassName="editing"
                                text={this.props.dashboard.name}
                                paramName={this.props.dashboard.id + '|name'}
                                change={this.handleDashEdit}
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
                    </h3>
                    <p className="manage-dashboard-head-subtitle">               
                        <a href="#">
                            <InlineEdit
                                validate={this.validateTextValue}
                                activeClassName="editing"
                                text={this.props.dashboard.detail}
                                paramName={this.props.dashboard.id+'|detail'}
                                change={this.handleDashEdit}
                                style={{
                                    minWidth: 250,
                                    display: 'inline-block',
                                    margin: 0,
                                    padding: 0,
                                    fontSize: 11,
                                    outline: 0,
                                    border: 0
                                }}
                            />
                        </a>
                    </p>
                </div>
                <table>
                    <tr>
                        <td><b>Select elements</b></td>
                        <td>
                            <FormGroup>
                                <Col sm={15}>
                                    <div className="div-multiselect">
                                        <Multiselect
                                            options={this.props.favoritesCombo}
                                            onChange={this.selectMultipleFacilities} />
                                    </div>
                                </Col>
                            </FormGroup>
                        </td>
                        <td>
                            <div>
                                <button className="button" onClick={() => this.loadChart()}><FaCheck /> Add selected</button>
                            </div>
                        </td>
                    </tr>
                </table>
            </div>
        )
    }

};
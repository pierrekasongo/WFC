import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import {FaTrash} from 'react-icons/fa';
import InlineEdit from 'react-edit-inline2';
import axios from 'axios';

export default class MatchedItemsComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
        }
    }

    handleShareChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        const ident = Object.keys(obj)[0].split("-");

        const code = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: code,
            param: param,
            value: value,
        };
        axios.patch('/dhis2/updateDhis2CodeShare', data,{
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
            <table className="table-list-sub" cellSpacing="5">
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Share (%)</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.dhis2Codes.map(c =>
                        <tr>
                            <td>{c.name}</td>
                            <td>
                                <div align="center">
                                    <a href="#">
                                        <InlineEdit
                                            validate={this.validateTextValue}
                                            activeClassName="editing"
                                            text={"" + c.share}
                                            paramName={c.id + '-share'}
                                            change={this.handleShareChange}
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
                                <a href="#" onClick={() => this.props.delete(c.id)}>
                                    <FaTrash />
                                </a>
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        );
    }

}
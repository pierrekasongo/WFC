import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import {FaCheck,FaTrash} from 'react-icons/fa';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

export default class PasswordComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            newPassword:'',
            newPasswordConf:''
        }
    }
    
    render() {
        return (
            <div className="tab-main-container">
                <FormGroup>
                    <Col componentClass={ControlLabel} sm={20}>
                        <div className="div-title">
                            <b>Change your password</b>
                        </div>
                    </Col>
                </FormGroup>
                <hr/>
                <br/>
                <div className="form-div">
                    <h3><b>Current password</b></h3>
                    <FormControl type="password" placeholder="Current password" value={this.state.oldPassword}
                        onChange={e => this.setState({ oldPassword: e.target.value })} />
                    <br />
                    <h3><b>New password</b></h3>
                    <FormControl type="password" placeholder="New password" value={this.state.newPassword}
                        onChange={e => this.setState({ newPassword: e.target.value })} />
                    <br />
                    <h3><b>Confirm new password</b></h3>
                    <FormControl type="password" placeholder="Confirm new password" value={this.state.newPasswordConf}
                        onChange={e => this.setState({ newPasswordConf: e.target.value })} />
                    <br />
                    <table>
                        <tr>
                            <td>
                                <button className="button-cancel" onClick={() => this.props.cancel()}><FaTrash /> Cancel</button>
                            </td>
                            <td>
                                <button className="button" onClick={() => this.props.validate(this.state)}><FaCheck /> Apply</button>
                            </td>
                        </tr>
                    </table>
                </div>
                
               
                <br/>
            </div>
        );
    }
};
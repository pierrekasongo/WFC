import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';
import { FaTrash,FaArrowRight } from 'react-icons/fa';
import InlineEdit from 'react-edit-inline2';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

import PasswordComponent from './PasswordComponent';

export default class AccountPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            user:{},
            languages:[],
            editLanguage:false,
            showPasswordForm:false
        }
        axios.get(`/configuration/getLanguages`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ languages: res.data })
        }).catch(err => console.log(err));

        axios.get(`/auth/get_user/${localStorage.getItem('userId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ user: res.data })
        }).catch(err => console.log(err));
    }

    handleChange(obj) {

        const id = Object.keys(obj)[0];

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

            console.log('Value updated successfully');

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

    changeLanguage(code){

        let data = {
           userId: localStorage.getItem('userId'),
            codeLang: code
        };
        axios.patch('/auth/change_language', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.launchToastr("Language changed successfully. Please logout and login again to see change.")
            this.setState({editLanguage:false});

            axios.get(`/auth/get_user/${localStorage.getItem('userId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({ user: res.data })
            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
    }

    changePassword(info) {

        if(info.newPassword !== info.newPasswordConf){
            this.launchToastr("New password different from confirmation password.");
            return;
        }

        let data = {
            userId: localStorage.getItem('userId'),
            password: info.newPassword,
        };

        axios.patch('/auth/change_password', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({showPasswordForm:false});

        }).catch(err => console.log(err));
    }

    render() {
        return (
        <Panel bsStyle="primary" header="My account">
            <div className="tab-main-container">
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={20}>
                            <div className="div-title">
                                <b>{localStorage.getItem('username')}</b>
                            </div>
                        </Col>
                    </FormGroup>
                    <table className="table-list">
                        <thead>
                            <th>Field</th>
                            <th>Value</th>
                        </thead>
                        <tbody>
                                <tr>
                                    <td><b>Name</b></td>
                                    <td>{this.state.user.name}</td>
                                </tr>
                                <tr>
                                    <td><b>Email</b></td>
                                    <td>{this.state.user.email}</td>
                                </tr>
                                <tr>
                                    <td><b>Role</b></td>
                                    <td>{this.state.user.role}</td>
                                    
                                </tr>
                                <tr>
                                    <td><b>Language</b></td>
                                    {!this.state.editLanguage &&
                                        <td>
                                            <a href="#" onClick={() => this.setState({editLanguage:true})}>{this.state.user.language}</a>
                                        </td>
                                    }
                                    {this.state.editLanguage && 
                                    <div>
                                        <td>
                                            <FormGroup>
                                                        <Col sm={10}>
                                                            <FormControl
                                                                componentClass="select"
                                                                onChange={e => this.changeLanguage(e.target.value)}>
                                                                <option value="0" key="000">Change language</option>
                                                                {this.state.languages.map(lang =>
                                                                    <option
                                                                        key={lang.code}
                                                                        value={lang.code}>
                                                                        {lang.name}
                                                                    </option>
                                                                )}
                                                            </FormControl>
                                                        </Col>
                                            </FormGroup>                                                             
                                        </td>
                                        <td>
                                            <a href="#" onClick={() => this.setState({editLanguage:false})}>
                                                <FaTrash />        
                                            </a> 
                                        </td>
                                    </div>    
                                    }
                                </tr>
                                <tr>
                                    <td><b>Last login</b></td>
                                    <td>{this.state.user.last_login}</td>
                                </tr>
                        </tbody>
                    </table>
                    <hr/>
                    {!this.state.showPasswordForm && 
                        <a href="#" onClick={() => this.setState({showPasswordForm:true})}><FaArrowRight/> Change your password</a> 
                    }
                    {this.state.showPasswordForm && 
                        <PasswordComponent 
                            validate = {info => this.changePassword(info)} 
                            cancel ={() => this.setState({showPasswordForm:false})} />
                    }
            </div>
        </Panel>
        );
    }
};
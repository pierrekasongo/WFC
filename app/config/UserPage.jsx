import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';
import { FaPlusSquare } from 'react-icons/fa';
import InlineEdit from 'react-edit-inline2';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { confirmAlert } from 'react-confirm-alert';

import NewUserComponent from './NewUserComponent';

export default class UserPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            users:[],
            filteredUsers:[],
            showingNewUser:false,
            countries:[],
            roles:[]
        }

        axios.get('/metadata/countries',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ countries: res.data });
        }).catch(err => console.log(err));

        axios.get('/configuration/roles',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ roles: res.data });
        }).catch(err => console.log(err)); 

        axios.get(`/auth/users/${localStorage.getItem('countryId')}/${localStorage.getItem('role')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => this.setState({
            users: res.data,
            filteredUsers:res.data
        }))
        .catch(err => console.log(err));
    }

    validateValue(text) {
        return (text.length > 0 && text.length < 64);
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

    newUserSave(info){

        let login = info.login;
        let name = info.name;
        let email = info.email;
        let countryId = info.countryId;
        let roleId = info.roleId;

        let data = {
            login: login,
            name: name,
            email: email,
            countryId: countryId,
            roleId: roleId
        };
  
        axios.post('/auth/signup', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/auth/users/${localStorage.getItem('countryId')}/${localStorage.getItem('role')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => this.setState({
                users: res.data,
                filteredUsers:res.data
            }))
            .catch(err => console.log(err));

        }).catch(err => console.log(err));
        this.setState({showingNewUser:false});
    }

    filterUsersByCountry(countryId) {

        let users = [];

        users = this.state.users;

        if(countryId === "0"){
            
            this.setState({filteredUsers : users});
            return;
        }
        this.setState({ filteredUsers: users.filter(us => us.countryId == countryId) });
    }

    filterUsersByLogin(login){

        let users = [];

        users = this.state.users;

        this.setState({ filteredUsers: users.filter(us => us.login.includes(login)) });
    }

    resetPassword(user){
        
        let data = {
            userId:user.id,
            login:user.login
        }

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Do you really want to reset this user's password?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick = {() => {
                                axios.patch('/auth/reset_password', data,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then(res =>{
                                    this.launchToastr('Password reset successfully!');
                                }).catch(err => console.log(err));
                                onClose();
                            }}>
                            Yes
                        </button>
                    </div>
                );
            }
        });
    }

    render() {
        return (
        <Panel bsStyle="primary" header="Users">
            <div className="tab-main-container">
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={20}>
                            <div className="div-title">
                                <b>Manage users</b>({this.state.filteredUsers.length})
                                
                            </div>
                        </Col>
                        <hr/>
                    </FormGroup>

                    {/*{(localStorage.getItem('role') == 'super_user') &&
                    <Col sm={20}>
                        <FormControl
                                    componentClass="select"
                                    onChange={e => this.filterUsersByCountry(e.target.value)}>
                                    <option value="0" key="000">Filter by country</option>
                                    {this.state.countries.map(ct =>
                                        <option
                                            key={ct.id}
                                            value={ct.id}>
                                            {ct.name_en}
                                        </option>
                                    )}
                        </FormControl>
                    </Col>
                    }*/}
                    <table>
                        <tr>
                            <td>
                                <FormGroup>
                                    <Col sm={20}>
                                        <FormControl componentClass="select"
                                            onChange={e => this.filterUsersByCountry(e.target.value)}>
                                            <option key="000" value="0">Filter by country</option>
                                            {this.state.countries.map(ct =>
                                                <option key={ct.id} value={ct.id}>
                                                    {ct.name_en}
                                                </option>
                                            )}
                                        </FormControl>
                                    </Col>
                                </FormGroup>
                            </td>
                            <td>
                                <FormGroup>
                                    <Col sm={15}>
                                        <input typye="text" className="form-control"
                                            placeholder="Filter by login" onChange={e => this.filterUsersByLogin(e.target.value)} />
                                    </Col>
                                </FormGroup>
                            </td>
                        </tr>
                    </table>
                    <br/>
                    {(localStorage.getItem('role') == 'super_user') &&
                        <div className="div-add-new-link">
                            <a href="#" className="add-new-link" onClick={() => this.setState({ showingNewUser: true })}>
                                <FaPlusSquare /> Add new
                            </a>
                        </div>
                    }
                    <br />
                    <table className="table-list">
                        <thead>
                            <tr>
                                <th>Login</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Country</th>
                                {!this.state.showingNewUser &&
                                    <th>Last login</th>
                                }
                            </tr>
                        </thead>
                        <tbody>
                            {this.state.showingNewUser &&
                                 <NewUserComponent
                                     roles={this.state.roles}
                                     countries={this.state.countries}
                                     save={info => this.newUserSave(info)}
                                     cancel={() => this.setState({ showingNewUser: false })} />
                            }
                            {this.state.filteredUsers.map(user =>
                                <tr key={user.id}>
                                    <td>{user.login}</td>
                                    <td>{user.name}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.country}</td>
                                    {!this.state.showingNewUser &&
                                        <td>{user.last_login}</td>
                                    }
                                    {(localStorage.getItem('role') == 'super_user') &&
                                        <td>
                                            <div className="div-add-new-link">
                                                <a href="#" className="add-new-link" onClick={() => this.resetPassword(user)}>
                                                    Reset password
                                                </a>
                                            </div>
                                        </td>
                                    }
                                </tr>
                            )}
                        </tbody>
                    </table>
                    <br/>
            </div>
        </Panel>
        );
    }
};
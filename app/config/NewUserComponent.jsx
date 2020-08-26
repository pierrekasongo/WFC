import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import {FaCheck,FaTimes } from 'react-icons/fa';

export default class NewUserComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            login:'',
            name:'',
            email:'',
            countryId:'',
            roleId:'',
        }
    }
    render() {
        return (
            <tr>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Login"
                            value={this.state.login}
                            onChange={e => this.setState({ login: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Username"
                            value={this.state.name}
                            onChange={e => this.setState({ name: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="E-mail"
                            value={this.state.email}
                            onChange={e => this.setState({ email: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <FormControl
                                componentClass="select"
                                onChange={e => this.setState({ roleId: e.target.value })}>
                                <option value="0" key="000">Role</option>
                                {this.props.roles.map(r =>
                                    <option
                                        key={r.id}
                                        value={r.id}>
                                        {r.name}
                                    </option>
                                )}
                    </FormControl>
                </td>

                <td style={{fontSize:14}}>
                    <FormControl
                                componentClass="select"
                                onChange={e => this.setState({ countryId: e.target.value })}>
                                <option value="0" key="000">Country</option>
                                {this.props.countries.map(ct =>
                                    <option
                                        key={ct.id}
                                        value={ct.id}>
                                        {ct.name_en}
                                    </option>
                                )}
                    </FormControl>
                </td>
                
                <td>
                    <a href="#" className="add-new-link" onClick={() => this.props.cancel()}><FaTimes /></a>
                </td> 
                <td>
                    <a href="#" className="add-new-link" onClick={() => this.props.save(this.state)}><FaCheck /></a>
                </td>
            </tr>
        );
    }

}
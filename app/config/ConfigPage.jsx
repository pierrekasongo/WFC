import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import * as axios from 'axios';

import InlineEdit from 'react-edit-inline2';
import UserPage from './UserPage';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

export default class ConfigPage extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            configs: {},
            filter: "",
        }

        axios.get(`/configuration/configs/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let configs = {};

            //this.setState({ configs: res.data });

            res.data.forEach(cf =>{

                let value='';

                if(cf.parameter.includes('PWD')){
                    value='*******'
                }else{
                    value = cf.value
                }
                
                configs[cf.id] = {
                    id:cf.id,
                    parameter:cf.parameter,
                    value:value
                }
            });
            this.setState({configs:configs});
        }).catch(err => console.log(err));

        this.handleChange = this.handleChange.bind(this);
    }

    validateValue(text) {
        return (text.length > 0 && text.length < 64);
    }

    handleChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

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

    getFilteredConfigs() {
        return Object.keys(this.state.configs).filter(val => {
            let config = this.state.configs[val].parameter.toUpperCase();
            let filter = this.state.filter.toUpperCase();
            return config.indexOf(filter) > -1;
        });
    }

    render() {
        return (
            <Panel bsStyle="primary" header="Configuration">
                <div className="tab-main-container">
                    <FormGroup>
                        <Col componentClass={ControlLabel} sm={20}>
                            <div className="div-title">
                                <b>Variables de configuration</b>
                            </div>
                        </Col>
                    </FormGroup>
                    <table className="table-list">
                        <thead>
                            <tr>
                                <th>Parameter</th>
                                <th>Value</th>
                            </tr>
                        </thead>
                        <tbody>
                            {this.getFilteredConfigs().map(paramId =>
                                <tr key={paramId}>
                                    <td><b>{this.state.configs[paramId].parameter}</b></td>
                                    <td>
                                        { localStorage.getItem('role') !== 'viewer' &&
                                            <div>
                                                <InlineEdit
                                                    validate={this.validateValue}
                                                    activeClassName="editing"
                                                    text={this.state.configs[paramId].value}
                                                    paramName={this.state.configs[paramId].id}
                                                    change={this.handleChange}
                                                    style={{
                                                        /*backgroundColor: 'yellow',*/
                                                        minWidth: 150,
                                                        display: 'inline-block',
                                                        margin: 0,
                                                        padding: 0,
                                                        fontSize: 15,
                                                        outline: 0,
                                                        border: 0
                                                    }}
                                                />
                                            </div>
                                        }
                                        { localStorage.getItem('role') === 'viewer' && 
                                            this.state.configs[paramId].value
                                        }
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <br/>
            </Panel>  
        );
    }
};
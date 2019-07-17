import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Radio, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import Multiselect from 'react-multiselect-checkboxes';
import { FaCheck, FaCapsules, FaClinicMedical, FaTrash, FaUserMd } from 'react-icons/fa';
import { confirmAlert } from 'react-confirm-alert';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';

export default class MatchCadreComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ihrisCadres: this.props.ihrisCadres,
            countryCadres:this.props.countryCadres,
            filteredCountryCadres: this.props.countryCadres,
            facilityTypes:this.props.facilityTypes
        };
    
        this.matchCadres = this.matchCadres.bind(this);
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

    matchCadres(stdCode, ihrisCode) {
        
        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }
        let data = {
            ihrisCode: ihrisCode,
            stdCode: stdCode
        }
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to match this?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.post(`/hris/match_cadre`, data,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then(res => {
                                    axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                                        headers :{
                                            Authorization : 'Bearer '+localStorage.getItem('token')
                                        }
                                    })
                                        .then(res => this.setState({ countryCadres: res.data }))
                                        .catch(err => console.log(err));
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

    filterCtCadreByFaType(faTypeCode){

        let cadres = this.state.countryCadres;
        
        if(faTypeCode === "0"){
            this.setState({filteredCountryCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCountryCadres: filtered});
        }
    }

    render() {

        return (
            <div>
                        <FormGroup>
                            <Col componentClass={ControlLabel} sm={20}>
                                <div className="div-title">
                                    <b>Match cadres to iHRIS</b>
                                </div>
                                <hr />
                            </Col>
                        </FormGroup>
                        <div>
                            <table>
                                <tr>
                                    <td><b>Filter from facility type</b></td>
                                    <td>
                                        <FormGroup>
                                            <Col sm={15}>
                                                <FormControl
                                                            componentClass="select"
                                                            onChange={e => this.filterCtCadreByFaType(e.target.value)}>
                                                            <option value="0" key="000">Filter by facility type</option>
                                                            {this.state.facilityTypes.map(ft =>
                                                                <option
                                                                    key={ft.id}
                                                                        value={ft.code}>
                                                                        {ft.name_fr+'/'+ft.name_en}
                                                                </option>
                                                            )}
                                                </FormControl>
                                            </Col>
                                        </FormGroup>
                                    </td>
                                </tr>
                            </table>
                        </div>
                        <br/>
                        <div className="div-table">
                            <table className="table-list" cellspacing="5">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Hris code</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {this.state.filteredCountryCadres.map(cadre =>
                                        <tr key={cadre.std_code} >
                                            <td>
                                                {cadre.name}
                                            </td>
                                            <td>
                                                <InlineEdit
                                                        validate={this.validateTextValue}
                                                        activeClassName="editing"
                                                        text={(cadre.hris_code.length == 0 ? 'match hris code' : cadre.hris_code)}
                                                        paramName={cadre.std_code + '-hris_code'}
                                                        change={this.handleCadreChange}
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
                                            </td>

                                            <td>
                                                <Col sm={10}>
                                                    <FormControl componentClass="select"
                                                        onChange={e => this.matchCadres(cadre.std_code, e.target.value)}>
                                                        <option key="000" value="000">Select value</option>
                                                        {(this.state.ihrisCadres.map(c =>
                                                            <option key={c.id} value={c.id} selected={(cadre.hris_code == c.id) ? true : false}>{c.name}</option>
                                                        ))}
                                                    </FormControl>
                                                </Col>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <br />
                        </div>
                    </div>
        );

    }
};
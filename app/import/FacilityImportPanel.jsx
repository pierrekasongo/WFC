import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import { FaCheck, FaTrash } from 'react-icons/fa';
import toastr from 'toastr';
import { confirmAlert } from 'react-confirm-alert';
import 'toastr/build/toastr.min.css';
import Multiselect from 'react-multiselect-checkboxes';

export default class FacilityImportPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            state: 'done',
            stateFacilities:'loading',
            bulkFacilities: {},
            bulkFacilitiesParent:[],

            facilitiesMap: new Map(),
            showButtons:false,
            facilityTypes :[],
            facilitiesCombo: [],

            facilities: [],
            cadres: [],
        }
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.deleteFacility = this.deleteFacility.bind(this);
        this.insertFacilities = this.insertFacilities.bind(this);

        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilities: res.data });
        }).catch(err => console.log(err));

        axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ cadres: res.data });
        });

        axios.get('/dhis2/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({facilityTypes : res.data})
        }).catch(err => console.log(err));

        axios.get(`/dhis2/import_facilities_from_dhis2/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            let bulkFacilities = {};

            let bulkFacilitiesParent = [];

            res.data.forEach(bf => {

                if(bulkFacilitiesParent.indexOf(bf.parent) < 0){
                    bulkFacilitiesParent.push(bf.parent);
                }

                bulkFacilities[bf.id] = {
                    id: bf.id,
                    level: bf.level,
                    name: bf.name,
                    parent: bf.parent
                }
            });
            this.setState({ 
                bulkFacilities: bulkFacilities,
                bulkFacilitiesParent: bulkFacilitiesParent
            });

            console.log("PARENT ",this.state.bulkFacilitiesParent);

            let facilitiesCombo = [];

            res.data.forEach(fa => {

                let facility = "";

                if (bulkFacilities[fa.id].parent) {
                    facility = bulkFacilities[fa.parent.id].name + '/' + fa.name;
                } else {
                    facility = fa.name;
                }
                facilitiesCombo.push({ label: facility, value: fa.id });
            });
            this.setState({
                facilitiesCombo: facilitiesCombo,
                stateFacilities:'done'
            });

        }).catch(err => console.log(err));
    }

    deleteFacility(id) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this facility?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                this.setState({ state: 'loading' });

                                axios.delete(`/dhis2/deleteFacility/${id}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {

                                        axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {

                                            let facilitiesMap = new Map();

                                            res.data.forEach(dt => {
                                                facilitiesMap.set(dt.code, dt.name);
                                            })
                                            this.setState({
                                                facilities: res.data,
                                                facilitiesMap: facilitiesMap
                                            });
                                        }).catch(err => console.log(err));

                                        this.setState({ state: 'done' });

                                    }).catch(err => {
                                        console.log(err);
                                    });
                                onClose();
                            }}>
                            Yes
                        </button>
                    </div>
                );
            }
        });
    }
    insertFacilities() {

        let data = {
            selectedFacilities: this.state.selectedFacilities,
            countryId : localStorage.getItem('countryId')
        };

        this.setState({ state: 'loading' });

        axios.post(`/dhis2/insert_facilities`, data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {

                let facilitiesMap = new Map();

                res.data.forEach(dt => {
                    facilitiesMap.set(dt.code, dt.name);
                })
                this.setState({
                    facilities: res.data,
                    facilitiesMap: facilitiesMap
                });
                this.setState({ state: 'done' });

            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }
    selectMultipleFacilities(values) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let selectedFacilities = [];

        this.setState({showButtons:(values.length > 0)});

        values.forEach(val => {
            let names = val.label.split("/");
            let parent = names[0];
            let facility = names[1];
            let id = val.value;
            if (this.state.facilitiesMap.has(id)) {
                this.launchToastr("This facility has been added already");
                return;
            } else {
                selectedFacilities.push({
                    id: id,
                    name: facility,
                    parent: parent,
                });
            }
        })
        this.setState({ selectedFacilities: selectedFacilities });
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

    changeType(facilityCode, facilityType) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let data = {
            facilityCode: facilityCode,
            facilityType: facilityType
        }
        axios.post(`/dhis2/setFacility_type`, data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            axios.get(`/countrycadre/cadres/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {

                axios.get(`/dhis2/facilities/${localStorage.getItem('countryId')}`,{
                    headers :{
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {

                    let facilitiesMap = new Map();
    
                    res.data.forEach(dt => {
                        facilitiesMap.set(dt.code, dt.name);
                    })
                    this.setState({
                        facilities: res.data,
                        facilitiesMap: facilitiesMap
                    });
                    this.setState({ state: 'done' });
    
                }).catch(err => console.log(err));

            }).catch(err => console.log(err));

        }).catch(err => console.log(err));
    }



    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div className="cadres-container">

                        <div>
                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={20}>
                                    <div className="div-title">
                                        <b>Import facilities from DHIS2</b>
                                    </div>
                                    <hr />
                                </Col>
                            </FormGroup>
                            <div class="alert alert-warning" role="alert">
                                Select facilities from below and click the button to import.
                            </div>

                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={10}>
                                    <b>Filter by parent</b>
                                </Col>

                                <Col sm={15}>
                                    <FormControl componentClass="select"
                                        onChange={e => this.setState({ selectedPeriod: e.target.value })}>
                                        <option key="000" value="000">Filter by parent </option>
                                        {(this.state.bulkFacilitiesParent.map(p =>
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </FormControl>
                                </Col>
                            </FormGroup>

                            <FormGroup>
                                <Col componentClass={ControlLabel} sm={10}>
                                    Choose from DHIS2 ({this.state.facilitiesCombo.length})
                                </Col>
                                <table className="tbl-multiselect">
                                    <tr>
                                        <td>
                                            <div className="div-multiselect">
                                                <Multiselect
                                                    options={this.state.facilitiesCombo}
                                                    onChange={this.selectMultipleFacilities} />
                                            </div>
                                        </td>                                        
                                        <td>
                                            {this.state.stateFacilities == 'loading' &&
                                                <span className="loader-text">Loading...</span>
                                            }
                                        </td>
                                        {this.state.showButtons &&
                                            <td>
                                                <button className="button" onClick={() => this.insertFacilities()}><FaCheck /> Import</button>
                                            </td>
                                        }
                                    </tr>
                                </table>
                                <hr />
                            </FormGroup>

                            {this.state.state == 'loading' &&
                                <div style={{ marginTop: 120, marginBottom: 65 }}>
                                    <div className="loader"></div>
                                </div>
                            }
                            {this.state.state == 'done' &&
                                <table className="table-list" cellSpacing="10">
                                    <thead>
                                        <th>Parent</th>
                                        <th>Facility</th>
                                        <th>Facility type</th>
                                        <th></th>
                                        <th></th>
                                    </thead>
                                    <tbody>
                                        {this.state.facilities.map(fac =>
                                            <tr key={fac.code}>
                                                <td>{fac.parentName}</td>
                                                <td>{fac.name}</td>
                                                <td>{fac.faTypeName}</td>
                                                <td>
                                                    <Col sm={10}>
                                                        <FormControl componentClass="select"
                                                                onChange={e => this.changeType(fac.code, e.target.value)}>
                                                                <option key="000" value="000">Select value</option>
                                                                {(this.state.facilityTypes.map(ft =>
                                                                    <option key={ft.code} value={ft.code} >{ft.name_en+'/'+ft.name_fr}</option>
                                                                ))}
                                                        </FormControl>
                                                    </Col>
                                                </td>                                               
                                                <td>
                                                    <a href="#" onClick={() => this.deleteFacility(fac.id)}>
                                                        <FaTrash />
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            }
                        </div>
                    </div>
                </Form>
            </div>
        );
    }
};
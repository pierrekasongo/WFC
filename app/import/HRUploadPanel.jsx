import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { FaTrash, FaCloudUploadAlt, FaCheck, FaFileCsv, FaFolderOpen } from 'react-icons/fa';
import Multiselect from 'react-multiselect-checkboxes';
//import TreeView from 'react-pretty-treeview';

export default class HRUploadPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            progress: '',
            staffs: [],
            
            staffToDelete: '',

            selectedFacilities: [],
            selectedCadres: [],

            facilitiesCombo: [],
            cadresCombo: [],
        };

        this.handleUploadHR = this.handleUploadHR.bind(this);
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.selectMultipleCadres = this.selectMultipleCadres.bind(this);

        axios.get(`/hris/workforce/${localStorage.getItem('countryId')}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ staffs: res.data });
        }).catch(err => console.log(err));
        
    }

    componentDidMount(){

        this.setState({
            facilitiesCombo : this.props.facilitiesCombo, 
            cadresCombo : this.props.cadresCombo,
        })
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

    handleUploadHR(ev) {

        ev.preventDefault();

        const data = new FormData();

        data.append('file', this.uploadHRInput.files[0]);

        if (this.uploadHRInput.files.length == 0) {
            this.launchToastr("No file selected");
            return;
        }

        axios.post('/hris/uploadHR', data,
            {
                onUploadProgress: progressEvent => {
                    var prog = (progressEvent.loaded / progressEvent.total) * 100;
                    var pg = (prog < 100) ? prog.toFixed(2) : prog.toFixed(0);
                    this.setState({ progress: pg });
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/hris/workforce').then(res => {
                    this.setState({ staffs: res.data });
                }).catch(err => console.log(err));

            }).catch(err => {
                if (err.response.status === 401) {
                    this.props.history.push(`/login`);
                } else {
                    console.log(err);
                }
            });
    }

    selectMultipleCadres(values) {

        let selectedCadres = [];

        values.forEach(val => {
            let code = val.value;
            selectedCadres.push(code);
        })
        this.setState({ selectedCadres: selectedCadres });
    }

    selectMultipleFacilities(values) {

        let selectedFacilities = [];

        values.forEach(val => {
            let code = val.value
            selectedFacilities.push(code);
        })
        this.setState({ selectedFacilities: selectedFacilities });
    }

    handleStaffChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        const ident = Object.keys(obj)[0].split("-");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };
        axios.patch('/hris/editHR', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            axios.get(`/hris/workforce/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({ staffs: res.data });
            }).catch(err => console.log(err));
        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    async loadStaffFromiHRIS(){

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        let data = {
            facilities: this.state.selectedFacilities,
            cadres: this.state.selectedCadres,
            countryId: localStorage.getItem('countryId'),
        };

        let staffs = await axios.post('/hris/getiHRIS_staffs',data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res =>{

            axios.get(`/hris/workforce/${localStorage.getItem('countryId')}`,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
                this.setState({ staffs: res.data });
            }).catch(err => console.log(err));
        });
    }

    deleteStaff(id) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        this.setState({
            staffToDelete: id
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this record?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {
                                axios.delete(`/hris/deleteWorkforce/${this.state.staffToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        axios.get(`/hris/workforce/${localStorage.getItem('countryId')}`,{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            this.setState({ staffs: res.data });
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

    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div>
                        <div className="cadres-container">
                            <div className="div-flex-table-left">
                                {/*<FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Uploading workforce data</b>
                                        </div>
                                        <hr />
                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={20}>

                                                <div class="alert alert-warning" role="alert">
                                                    <p>Make sure it's a csv file with following headers and order.</p>
                                                    <p><b>"Facility code","Facility name","Cadre code", "Cadre name", "Staff count"</b></p>
                                                </div>

                                                <form onSubmit={this.handleUploadHR}>
                                                    <div class="upload-btn-wrapper">
                                                        <button class="btn"><FaFolderOpen /> Choose file...</button>
                                                        <input ref={(ref) => { this.uploadHRInput = ref; }} type="file" />
                                                    </div>
                                                    <br />
                                                    <br />
                                                    <div>
                                                        <span>
                                                            <button className="button"><FaCloudUploadAlt /> Upload file</button><span> {this.state.progress}</span>
                                                        </span>
                                                    </div>
                                                </form>
                                            </Col>
                                        </FormGroup>
                                    </Col>
                                </FormGroup>
                                <hr />*/}
                                <div style={{ textAlign: "left", paddingTop: 10 }}>
                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={20}>
                                            <div className="div-title">
                                                <b>Load HR from iHRIS</b>
                                            </div>
                                            <hr />
                                        </Col>
                                    </FormGroup>
                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={10}>
                                            <b>Facilities({(this.state.facilitiesCombo.length)})</b>
                                        </Col>
                                        <Col sm={15}>
                                            <div className="div-multiselect">
                                                <Multiselect
                                                    options={this.state.facilitiesCombo}
                                                    onChange={this.selectMultipleFacilities} />
                                            </div>

                                        </Col>
                                    </FormGroup>
                                    <br/>
                                    <FormGroup>
                                        <Col componentClass={ControlLabel} sm={10}>
                                            <b>Cadres({(this.state.cadresCombo.length)})</b>
                                        </Col>
                                        <Col sm={15}>
                                            <div className="div-multiselect">
                                                <Multiselect
                                                    options={this.state.cadresCombo}
                                                    onChange={this.selectMultipleCadres} />
                                            </div>
                                        </Col>
                                    </FormGroup>
                                    <hr/>
                                    <Button bsStyle="warning" bsSize="small" onClick={() => this.loadStaffFromiHRIS()}>Upload from iHRIS</Button>
                                </div>
                            </div>
                            <br/><br/>

                            <div className="div-flex-table-right">
                                <FormGroup>
                                    <div className="div-title">
                                        <b>Workforce</b>
                                    </div>
                                    <hr />
                                </FormGroup>
                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th>Facility</th>
                                            <th>Cadre</th>
                                            <th align="center"># staff</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.staffs.map(st =>
                                            <tr key={st.id} >
                                                <td>
                                                    {st.facility}
                                                </td>
                                                <td>
                                                    {st.cadre}
                                                </td>
                                                <td align="center">
                                                    <div>
                                                        <a href="#">
                                                            <InlineEdit
                                                                validate={this.validateTextValue}
                                                                activeClassName="editing"
                                                                text={`` + st.staff}
                                                                paramName={st.id + '-staff'}
                                                                change={this.handleStaffChange}
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
                                                    </div>
                                                </td>
                                                <td>
                                                    <a href="#" onClick={() => this.deleteStaff(`${st.id}`)}>
                                                        <FaTrash />
                                                    </a>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                                <br /><br />
                            </div>
                        </div>
                    </div>
                </Form>
            </div>
        )
    }
};
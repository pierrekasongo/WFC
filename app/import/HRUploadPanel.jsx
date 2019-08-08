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
            cadres: [],
            facilities: [],

            facilityTypes: []
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

        axios.get('/metadata/facilityTypes',{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({ facilityTypes: res.data });
        }).catch(err => console.log(err));
        
    }

    componentDidMount(){

        this.setState({
            cadres : this.props.cadres, 
            facilities : this.props.facilities,
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

    filterCadreFacilitiesByFaType(faTypeCode){

        let cadresCombo = [];

        let facilitiesCombo = [];

        if(faTypeCode === "0"){

            this.setState({
                cadresCombo: cadresCombo,
                facilitiesCombo: facilitiesCombo
            });

        }else{

            let cadres = this.state.cadres;

            let filteredCadres = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            filteredCadres.forEach(cd =>{
                let val = cd.hris_code+'-'+cd.std_code;
                cadresCombo.push({ label: cd.name, value: val });
            });

            let filteredFacilities = this.state.facilities.filter(fa => fa.faTypeCode.includes(faTypeCode));

            filteredFacilities.forEach(fa =>{

                let id = fa.ihrisCode + '-' + fa.code;

                facilitiesCombo.push({ label: fa.name, value: id });
            });

            this.setState({
                cadresCombo: cadresCombo,
                facilitiesCombo: facilitiesCombo
            });
        }
    }

    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div>
                        <div className="calc-container">
                            <div className="calc-container-left">
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
                                            <b>Select facility type</b>
                                        </Col>
                                        <Col sm={15}>
                                            <FormControl 
                                                componentClass="select" 
                                                onChange={e => this.filterCadreFacilitiesByFaType(e.target.value)}>
                                                <option value="0" key="000">Filter by facility type</option>
                                                {this.state.facilityTypes.map(ft =>
                                                    <option key={ft.id}
                                                        value={ft.code}>
                                                        {ft.name_fr+'/'+ft.name_en}
                                                    </option>
                                                )}
                                            </FormControl>
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

                            <div className="calc-container-right">
                                <div className="scrollable-container">
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
                                                <th align="center">#Staff</th>
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
                    </div>
                </Form>
            </div>
        )
    }
};
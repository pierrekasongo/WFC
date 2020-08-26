import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Row, FormControl, Col, Checkbox, Button, Table } from 'react-bootstrap';
import axios from 'axios';
import InlineEdit from 'react-edit-inline2';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { CSVLink} from "react-csv";
import { FaTrash, FaCloudUploadAlt, FaCheck, FaFileCsv, FaFileImport } from 'react-icons/fa';
import Multiselect from 'react-multiselect-checkboxes';
//import TreeView from 'react-pretty-treeview';

export default class HRUploadPanel extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            progress: '',
            staffs: [],
            filteredStaffs:[],
            staffToDelete: '',

            selectedFacilities: [],
            selectedCadres: [],
            filteredCountryCadres:[],

            facilitiesCombo: [],
            cadresCombo: [],
            cadres: [],
            facilities: [],

            facilityTypes: [],

            importStatus:'done',

            showFilters:false,

            showFiltersLeft:false,

            csvData: [],

            import_staff_from_file : false,
            import_staff_from_iHRIS : false,
        };

        this.csvLink = React.createRef();

        this.handleUploadHR = this.handleUploadHR.bind(this);
        this.selectMultipleFacilities = this.selectMultipleFacilities.bind(this);
        this.selectMultipleCadres = this.selectMultipleCadres.bind(this);

        axios.get('/staff/workforce').then(res => {
            this.setState({ staffs: res.data });
        }).catch(err => console.log(err));

        axios.get('/cadre/cadres').then(res => {

            this.setState({ cadres: res.data });

        }).catch(err => console.log(err));
        
    }

    componentDidMount(){

        if (cadreCode == "0") {
            axios.get('/staff/workforce').then(res => {
                this.setState({ staffs: res.data });
            }).catch(err => console.log(err));
        } else {
            axios.get(`/staff/workforce/${cadreCode}`).then(res => {
                this.setState({ staffs: res.data });
            }).catch(err => {
                console.log(err);
                if (err.response.status === 401) {
                    this.props.history.push(`/login`);
                } else {
                    console.log(err);
                }
            });
        }

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

        if (this.uploadHRInput.files.length == 0) {
            this.launchToastr("No file selected. Please select a valid file before validating.");
            return;
        }

        axios.post('/staff/uploadHR', data,
            {
                onUploadProgress: progressEvent => {
                    var prog = (progressEvent.loaded / progressEvent.total) * 100;
                    var pg = (prog < 100) ? prog.toFixed(2) : prog.toFixed(0);
                    this.setState({ progress: pg });
                }
            })
            .then((result) => {
                this.setState({ progress: result.data });
                axios.get('/staff/workforce').then(res => {
                    this.setState({ staffs: res.data });
                }).catch(err => console.log(err));

                if(result.status === 200){

                    this.props.launchToastr("File imported successfully","SUCCESS");

                    axios.get(`/hris/workforce/${localStorage.getItem('countryId')}`,{
                        headers :{
                            Authorization : 'Bearer '+localStorage.getItem('token')
                        }
                    }).then(res => {
                        this.setState({
                            staffs: res.data,
                            filteredStaffs: res.data
                         });
                    }).catch(err => console.log(err));
                }else{
                    this.props.launchToastr(result.statusText,"ERROR");
                }
                
            }).catch(err => {
                this.launchToastr(err,"ERROR");
            });
    }

    selectMultipleCadres(values) {

        let selectedCadres = [];

        values.forEach(val => {

            let codes = val.value.split("-");

            let code = codes[1];

            let name = val.label;

            selectedCadres.push({
                code:code,
                name:name
            });
        })
        this.setState({ 
            selectedCadres: selectedCadres
        });
    }

    selectMultipleFacilities(values) {

        let selectedFacilities = [];

        values.forEach(val => {

            let codes = val.value.split("-");

            let code = codes[1];

            let name = val.label;

            selectedFacilities.push({
                code:code,
                name:name
            });
        })
        this.setState({ selectedFacilities: selectedFacilities });
    }

    handleStaffChange(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.props.launchToastr("You don't have permission for this.","ERROR");
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
        axios.patch('/staff/editHR', data).then(res => {
            axios.get('/staff/workforce').then(res => {
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
            this.props.launchToastr("You don't have permission for this.","ERRO");
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
                this.setState({
                    staffs: res.data,
                    filteredStaffs: res.data
                });
            }).catch(err => console.log(err));
        });
    }

    deleteStaff(id) {

        if(localStorage.getItem('role') === 'viewer'){
            this.props.launchToastr("You don't have permission for this.","ERROR");
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
                                            this.setState({
                                                staffs: res.data,
                                                filteredStaffs: res.data
                                             });
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

    filterCtCadreByFaType(faTypeCode){

        let cadres = this.state.cadres;
        
        if(faTypeCode === "0"){
            this.setState({filteredCadres:cadres});
        }else{

            let filtered = cadres.filter(cd => cd.facility_type_code.includes(faTypeCode));

            this.setState({filteredCountryCadres: filtered});
        }
    }

    filterStaffByFacility(name) {

        let staffs = this.state.filteredStaffs;

        if(name.length == 0){

            staffs = this.state.staffs;

            this.setState({filteredStaffs: staffs});
        }else{
            this.setState({ filteredStaffs: staffs.filter(st => st.facility.toLowerCase().includes(name.toLowerCase())) });
        } 
    }

    filterStaffByCadre(cadreCode) {

        let staffs = this.state.staffs;

        if(cadreCode != "0"){

            this.setState({

                filteredStaffs:staffs.filter(st => st.cadreCode.includes(cadreCode))
            });
        }else{
            this.setState({

                filteredStaffs:staffs
            });
        }
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

    setImportStaffOption(event){

        let value = event.target.value;

        if(value === "iHRIS"){
            this.setState({
                import_staff_from_iHRIS : true,
                import_staff_from_file :false
            })
        }else{
            this.setState({
                import_staff_from_file : true,
                import_staff_from_iHRIS : false
            })
        }
    }

    generateCSV(){

        let csvData = [];

        if(!this.state.selectedFacilities.length > 0){
            this.props.launchToastr("No facility selected. Please select some facilities.", "ERROR");
            return;
        }
        if(!this.state.selectedCadres.length > 0){
            this.props.launchToastr("No cadre selected. Please select some cadres ", "ERROR");
            return;
        }

        let max = this.state.selectedFacilities.length;

        let count = 1;

        this.state.selectedFacilities.forEach(fa =>{

            this.state.selectedCadres.forEach(cd =>{

                csvData.push({
                    facility_code:fa.code,
                    facilicity_name:fa.name,
                    cadre_code:cd.code,
                    cadre_name:cd.name,
                    staff_count:0
                });
            });
            if(count == max){

                this.setState({
                    csvData:csvData
                });

                this.csvLink.current.link.click();
            }
            count++;
        });
        /*this.setState({
            csvData:csvData
        });
        this.csvLink.current.link.click();*/
    }

    render() {
        return (
            <div className="tab-main-container">
                <Form horizontal>
                    <div>
                        <div className="cadres-container">
                            <div className="div-flex-table-left">
                                <FormGroup>
                                    <Col componentClass={ControlLabel} sm={20}>
                                        <div className="div-title">
                                            <b>Uploading workforce data</b>
                                        </div>
                                        <hr />
                                        <FormGroup>
                                            <Col componentClass={ControlLabel} sm={20}>

                                                <div class="alert alert-warning" role="alert">
                                                    <p>Make sure it's a csv file with following headers and order.</p>
                                                    <p><b>"Region","District","Facility type","Facility code","Facility name","Cadre code", "Cadre name", "Staff count"</b></p>
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
                                <hr />
                            </div>
                            <br/><br/>
        
                            <div className="calc-container-right">
                                <div className="scrollable-container">
                                    <FormGroup>
                                        <div className="div-title">
                                            <b>Number of staffs</b>
                                        </div>
                                        <hr />                                      
                                    </FormGroup>
                                    <a href="#" onClick={() => this.setState({showFilters : !this.state.showFilters})} >
                                        Show filter options
                                    </a>
                                    {this.state.showFilters &&
                                    <table className="tbl-multiselect">
                                        <tr>
                                            <td><b>Filter cadre by facility type</b></td>
                                            <td>
                                                <div>
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
                                                </div>
                                            </td>
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
                                                                paramName={st.id + '-staffCount'}
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
                                        </thead>
                                        <tbody>
                                            {this.state.filteredStaffs.map(st =>
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
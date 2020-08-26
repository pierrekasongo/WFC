import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Button, Table, FormGroup,Col,Checkbox } from 'react-bootstrap';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import Multiselect from 'react-multiselect-checkboxes';
import {FaCheck, FaArrowLeft,FaTrash} from 'react-icons/fa';
import InlineEdit from 'react-edit-inline2';
import { confirmAlert } from 'react-confirm-alert';

export default class DashboardManagerComponent extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            dashboardItems : [],
            filteredDashboardItems : [],
            itemToDelete : 0,
            favorites:[],
            fovoritesCombo:[],
            selectedItems:{},
            checked : this.props.dashboard.is_default
        };
        this.selectMultipleItems = this.selectMultipleItems.bind(this);

        axios.get(`/dashboard/get_dashboard_items/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.setState({
                dashboardItems : res.data,
                filteredDashboardItems : res.data
            });
        }).catch(err => console.log(err));

        //Get available dashboard items
        axios.get(`/dashboard/get_favorites/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{

            headers :{

                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            this.setState({favorites: res.data});

            let favoritesCombo = [];

            res.data.forEach(fv => {

                favoritesCombo.push({ label: fv.label, value: fv.id });
            });
            this.setState({favoritesCombo: favoritesCombo});       
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

    deleteItem(id) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You don't have permission for this.");
            return;
        }

        this.setState({
            itemToDelete: id
        });
        confirmAlert({
            customUI: ({ onClose }) => {
                return (
                    <div className='custom-ui'>
                        <h3>Confirmation</h3>
                        <p>Are you sure you want to delete this item?</p>
                        <button onClick={onClose}>No</button> &nbsp;&nbsp;
                        <button
                            onClick={() => {

                                axios.delete(`/dashboard/delete_dashboard_item/${this.state.itemToDelete}`,{
                                    headers :{
                                        Authorization : 'Bearer '+localStorage.getItem('token')
                                    }
                                }).then((res) => {
                                        
                                        let arr = this.state.dashboardItems;

                                        for(var i =0; i < arr.length; i++){

                                            if(arr.item_id ==  this.state.itemToDelete){
                                                arr.splice(i,1);
                                            }
                                        }
                                        this.setState({
                                            dashboardItems:arr,
                                            filteredDashboardItems:arr
                                        })

                                        axios.get(`/dashboard/get_dashboard_items/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{
                                            headers :{
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                            this.setState({
                                                dashboardItems : res.data,
                                                filteredDashboardItems : res.data
                                            });
                                        }).catch(err => console.log(err));

                                        axios.get(`/dashboard/get_favorites/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{

                                            headers :{
                                
                                                Authorization : 'Bearer '+localStorage.getItem('token')
                                            }
                                        }).then(res => {
                                
                                            this.setState({favorites: res.data});
                                
                                            let favoritesCombo = [];
                                
                                            res.data.forEach(fv => {
                                
                                                favoritesCombo.push({ label: fv.label, value: fv.id });
                                            });
                                            this.setState({favoritesCombo: favoritesCombo});       
                                        }).catch(err => console.log(err));

                                    }).catch(err => {
                                        console.log(err);
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

    handleDashEdit(obj) {

        if(localStorage.getItem('role') === 'viewer'){
            this.launchToastr("You need edit permission to perform this action.");
            return;
        }

        const ident = Object.keys(obj)[0].split("|");

        const id = ident[0];

        const param = ident[1];

        const value = Object.values(obj)[0];

        let data = {
            id: id,
            param: param,
            value: value,
        };
        axios.patch('/dashboard/edit', data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {

            console.log('Value updated successfully');

        }).catch(err => {
            if (err.response.status === 401) {
                this.props.history.push(`/login`);
            } else {
                console.log(err);
            }
        });
    }

    filterItemsByFacility(facility) {
        let items = this.state.dashboardItems;
        this.setState({ filteredDashboardItems: items.filter(it => it.facility.toLowerCase().includes(facility.toLowerCase())) })
    }

    selectMultipleItems(values){

        let selectedItems = {};

        values.forEach(val => {

            let name = val.label;
            let id= val.value

            selectedItems[id] = {
                id: id,
                name: name
            };
        })
        this.setState({ selectedItems: selectedItems });
    }

    AddItemsToDashboard(){

        let size=Object.keys(this.state.selectedItems).length;

        if(size > 0){

            let data = {

                dashId : this.props.dashboard.id,

                selectedItems:this.state.selectedItems
            }

            axios.post(`/dashboard/addItems`,data,{
                headers :{

                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(res => {
    
                axios.get(`/dashboard/get_favorites/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{

                    headers :{
        
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {
        
                    this.setState({favorites: res.data});
        
                    let favoritesCombo = [];
        
                    res.data.forEach(fv => {
        
                        favoritesCombo.push({ label: fv.label, value: fv.id });
                    });
                    this.setState({favoritesCombo: favoritesCombo});       
                }).catch(err => console.log(err));

                axios.get(`/dashboard/get_dashboard_items/${localStorage.getItem('countryId')}/${this.props.dashboard.id}`,{
                    headers :{
                        Authorization : 'Bearer '+localStorage.getItem('token')
                    }
                }).then(res => {
                    this.setState({
                        dashboardItems : res.data,
                        filteredDashboardItems : res.data
                    });
                }).catch(err => console.log(err));
    
            }).catch(err => {
                console.log(err);
            });

        }else{
            this.launchToastr("No item selected. Select some items in list please.");
        }
    }

    render() {
        return (
            <div>
                <div className="div-title">
                    <h3 className="manage-dashboard-head-title">
                        <a href="#">
                            <InlineEdit
                                validate={this.validateTextValue}
                                activeClassName="editing"
                                text={this.props.dashboard.name}
                                paramName={this.props.dashboard.id + '|name'}
                                change={this.handleDashEdit}
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
                    </h3>
                    <p className="manage-dashboard-head-subtitle">               
                        <a href="#">
                            <InlineEdit
                                validate={this.validateTextValue}
                                activeClassName="editing"
                                text={this.props.dashboard.detail}
                                paramName={this.props.dashboard.id+'|detail'}
                                change={this.handleDashEdit}
                                style={{
                                    minWidth: 250,
                                    display: 'inline-block',
                                    margin: 0,
                                    padding: 0,
                                    fontSize: 11,
                                    outline: 0,
                                    border: 0
                                }}
                            />
                        </a>
                    </p>
                </div>
                <hr/>
                <table>
                    <tr>
                        <td>
                            <button className="button" onClick={() => this.props.back()}><FaArrowLeft /> Go back</button>
                        </td>
                        <td>
                            <button className="button-cancel" onClick={() => this.props.delete(this.props.dashboard.id)}><FaTrash /> Delete this dashboard</button>                  
                        </td>
                    </tr>
                </table>
                <hr/>
                <table>
                    <tr>
                        <td><b>Select elements to add</b></td>
                        <td>
                            <FormGroup>
                                <Col sm={15}>
                                    <div className="div-multiselect">
                                        <Multiselect
                                            options={this.state.favoritesCombo}
                                            onChange={this.selectMultipleItems} />
                                    </div>
                                </Col>
                            </FormGroup>
                        </td>
                        <td>
                            <div>
                                <button className="button" onClick={() => this.AddItemsToDashboard()}><FaCheck /> Add selected</button>
                            </div>
                        </td>
                    </tr>
                    
                </table>
                <hr/>
                <table>
                    <tr>
                        <td>
                            <FormGroup>
                                <Col sm={15}>
                                    <input typye="text" className="form-control"
                                        placeholder="Filter by facility" onChange={e => this.filterItemsByFacility(e.target.value)} />
                                </Col>
                            </FormGroup>
                        </td>
                    </tr>
                </table>
                <br/>
                <table className="table-list">
                    <thead>
                        <tr>
                            <th>Facility</th>
                            <th>Cadre</th>
                            <th>Current staffs</th>
                            <th>Needed staffs</th>                       
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.filteredDashboardItems.map(de => 
                            <tr>
                                <td>{de.facility}</td>
                                <td>{de.cadre}</td>
                                <td>{de.current}</td>
                                <td>{de.needed}</td>
                                <td>
                                    <a href="#" onClick={() => this.deleteItem(`${de.item_id}`)}>
                                        <FaTrash />
                                    </a>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        )
    }

};
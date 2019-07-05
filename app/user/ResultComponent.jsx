import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Button, Table, FormGroup } from 'react-bootstrap';
import axios from 'axios';
import CsvComponent from './CsvComponent';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

export default class ResultComponent extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            cadreDict: props.cadreDict,
            results: props.results
        };
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

    addToDashboard(facilityId, cadreId, current,needed){

        let data = {
            facilityCode :facilityId,
            cadreCode : cadreId,
            current : current,
            needed : needed
        };

        axios.post(`/dashboard/insert`,data,{
            headers :{
                Authorization : 'Bearer '+localStorage.getItem('token')
            }
        }).then(res => {
            this.launchToastr('Results successfully added to dashboard.');
        }).catch(err => console.log(err));
    }
    render() {
        return (
            <div>
                <CsvComponent
                    results={this.state.results}
                    cadreDict={this.state.cadreDict}
                />
                {Object.keys(this.state.results).map(id =>
                    <Collapsible trigger={this.state.results[id].facility}>
                        <div >
                            <h3>Results for {this.state.results[id].facility}</h3>
                            <br />

                            <table className="table-list">
                                <thead>
                                    <tr>
                                        <th>Cadre</th>
                                        <th>A. Current Workers</th>
                                        <th>B. Workers Needed </th>
                                        <th>Gap(A-B)</th>
                                        <th>Workforce Pressure(A/B)</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.keys(this.state.results[id].workersNeeded).map(cadreId =>
                                        <tr key={cadreId}>
                                            <td>
                                                <h4 key={cadreId + 'cadre'}>{this.state.cadreDict[cadreId]}</h4>
                                            </td>
                                            <td>
                                                <h4 key={cadreId + 'current'}>{this.state.results[id].currentWorkers[cadreId]}</h4>
                                            </td>
                                            <td>
                                                <h4 key={cadreId + 'needed'}>{Math.round(this.state.results[id].workersNeeded[cadreId])}</h4>
                                            </td>
                                            <td>
                                                <h4 
                                                    key={cadreId + 'gap'}
                                                    style={{ color: (this.state.results[id].currentWorkers[cadreId]-Math.round(this.state.results[id].workersNeeded[cadreId])) < 1 ? "red":"green" }}>
                                                    {(this.state.results[id].currentWorkers[cadreId]-Math.round(this.state.results[id].workersNeeded[cadreId]))}
                                                </h4>
                                            </td>
                                            <td>
                                                {this.state.results[id].pressure[cadreId] &&
                                                    <h4
                                                        key={cadreId}
                                                        style={{ color: this.state.results[id].pressure[cadreId] < 1 ? "red" : "green" }}>
                                                        {Number(this.state.results[id].pressure[cadreId]).toFixed(2)}x
                                                    </h4>
                                                }
                                                {!this.state.results[id].pressure[cadreId] &&
                                                    <h4 key={cadreId} style={{ color: "gray" }}>N/A</h4>
                                                }
                                            </td>
                                            <td>
                                                <div className="div-add-new-link">
                                                    <a href="#" className="add-new-link" onClick={() => this.addToDashboard(this.state.results[id].facilityId,
                                                        cadreId,
                                                        this.state.results[id].currentWorkers[cadreId],
                                                        Math.round(this.state.results[id].workersNeeded[cadreId]))}>
                                                        Add to dashboard
                                                    </a>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                            <br />

                        </div>
                    </Collapsible>
                )}
            </div>
        )
    }

};
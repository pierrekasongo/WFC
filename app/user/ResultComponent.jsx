import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Button, Table, FormGroup,Checkbox } from 'react-bootstrap';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import { CSVLink, CSVDownload } from "react-csv";
import {FaFileCsv,FaFilePdf,FaChartBar} from 'react-icons/fa';
import PdfComponent from './PdfComponent';


export default class ResultComponent extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            cadreDict: props.cadreDict,
            results: props.results,
            getPDF:false,
            getCSV:false,
            data:this.fetchData(props.results,props.cadreDict),
            dashboardData:new Map()
        };

        this.csvLink=React.createRef();

        /*this.state={
            data:this.fetchData(props.results)
        }*/
    }

    clicked(){
        this.csvLink.current.link.click();
    }

    fetchData(reslt,cadres){

        let printable=[];

        let results = reslt;

        let cadreDict = cadres;

        let currFacility="";

        Object.keys(results).map(id => {
            
            let facility="";
            
            let cadre="";

            let curr_workers="";

            let needed_workers="";

            let pressure="";

            let gap="0";

            Object.keys(results[id].workersNeeded).map(cadreId =>{

                cadre=cadreDict[cadreId];
                curr_workers=(results[id].currentWorkers[cadreId])?results[id].currentWorkers[cadreId].toString():'0';
                needed_workers=(results[id].workersNeeded[cadreId])?results[id].workersNeeded[cadreId].toFixed(1).toString():'0';
                pressure=results[id].pressure[cadreId].toString();
                gap=(results[id].currentWorkers[cadreId]-results[id].workersNeeded[cadreId]).toFixed(1).toString();
                facility=results[id].facility.toString();

                if(facility !== currFacility){

                    currFacility = facility;

                    printable.push({
                        facility:currFacility,
                        cadre:'',
                        current:'',
                        needed:'',
                        difference:'',
                        ratio:''
                    });
                }

                printable.push({
                    '':'',
                    cadre:cadre,
                    current:curr_workers,
                    needed:needed_workers,
                    gap:gap,
                    ratio:pressure
                });
            });
            //facility=this.state.results[id].facility; 
        });
        return printable;
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

    saveForDashboard(event,facilityId,cadreId, currentWorkers,neededWorkers,currentSalary,neededSalary){

        let key=`${facilityId}-${cadreId}`;

        if(event.target.checked){

            let value=`${currentWorkers}|${neededWorkers}|${currentSalary}|${neededSalary}`;

            if(this.state.dashboardData.has(key)){

                this.state.dashboardData.delete(key);

            }
            this.state.dashboardData.set(key,value);

        }else{
            if(this.state.dashboardData.has(key)){

                this.state.dashboardData.delete(key);
            }
        }
    }
    render() {
        return (
            <div>
                {/* */}
                <div>
                    <table>
                        <tr>
                            <td><a href="#" onClick={() => this.setState({getPDF:true})}><FaFilePdf />Export to pdf</a></td>
                            <td><a href="#" onClick={() => this.clicked()}><FaFileCsv />Export to csv</a></td>
                        </tr>
                    </table>
                    <div>
                        <Button bsStyle="warning" bsSize="medium" onClick={() => this.props.saveAsFavorite(this.state.dashboardData)}>
                            <FaChartBar /> Add selected to favorite
                        </Button>
                    </div>
                </div>
                <hr/>
                <br/>
                <div>
                    <CSVLink data={this.state.data} 
                            filename="pressure_calculation.csv"
                            className="hidden"
                            ref={this.csvLink}
                            target="_blank" /> 
                </div>

                {this.state.getPDF && 
                    <PdfComponent results={this.state.results}
                                cadreDict={this.state.cadreDict}/>
                }
                {!this.state.getPDF && 
                <div>
                    {Object.keys(this.state.results).map(id =>
                        <Collapsible trigger={this.state.results[id].facility}>
                            <div >
                                <h3>Results for {this.state.results[id].facility}</h3>
                                <br />

                                <table className="table-list">
                                    <thead>
                                        <tr>
                                            <th><a href="#">#</a></th>
                                            <th>Cadre</th>
                                            <th>A. Current Workers</th>
                                            <th>B. Workers Needed </th>
                                            <th>Gap(A-B)</th>
                                            <th>Ratio(A/B)</th>
                                            <th>Current salary</th>
                                            <th>Needed salary</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.keys(this.state.results[id].workersNeeded).map(cadreId =>
                                            <tr key={cadreId}>
                                                <td>
                                                    <Checkbox
                                                            key={cadreId+'checked'}
                                                            onChange={(e) => this.saveForDashboard(e,
                                                                this.state.results[id].facilityId,//FacilityId
                                                                cadreId,//CadreId
                                                                this.state.results[id].currentWorkers[cadreId],//Current workers
                                                                Number(this.state.results[id].workersNeeded[cadreId]).toFixed(1),//Needed workers
                                                                (this.state.results[id].currentWorkers[cadreId])*(this.state.cadreDict[cadreId].average_salary),//Current salary
                                                                (Number(this.state.results[id].workersNeeded[cadreId]).toFixed(1))*(this.state.cadreDict[cadreId].average_salary)//Needed salary
                                                        )}
                                                    /> 
                                                </td>
                                                <td>
                                                    <h4 key={cadreId + 'cadre'}>{this.state.cadreDict[cadreId].name}</h4>
                                                </td>
                                                <td>
                                                    <h4 key={cadreId + 'current'}>{this.state.results[id].currentWorkers[cadreId]}</h4>
                                                </td>
                                                <td>
                                                    <h4 key={cadreId + 'needed'}>{Number(this.state.results[id].workersNeeded[cadreId]).toFixed(1)}</h4>
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
                                                            {Number(this.state.results[id].pressure[cadreId]).toFixed(1)}x
                                                        </h4>
                                                    }
                                    
                                                </td>
                                                <td>
                                                    <h4 key={cadreId + 'current_salary'}><b>{(this.state.results[id].currentWorkers[cadreId])*(this.state.cadreDict[cadreId].average_salary)}</b></h4>
                                                </td>
                                                <td>
                                                    <h4 key={cadreId + 'needed_salary'} style={{color:"red"}}><b>{(Number(this.state.results[id].workersNeeded[cadreId]).toFixed(1))*(this.state.cadreDict[cadreId].average_salary)}</b></h4>
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
                }
            </div>
        )
    }

};
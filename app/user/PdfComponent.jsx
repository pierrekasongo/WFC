import * as React from 'react';

//import Report from 'bv-react-data-report';

import Report from 'react-data-report';

export default class PdfComponent extends React.Component {
    constructor(props) {

        super(props);

        this.state = {
            cadreDict:props.cadreDict,
            results:props.results,
        }

        this.state={
            data:this.fetchData(props.results)
        }
    }

    fetchData(results){

        let printable=[];
        
        Object.keys(this.state.results).map(id => {
            
            let facility="";
            
            let cadre="";

            let curr_workers="";

            let needed_workers="";

            let pressure="";

            let gap="0";

            let currFacility="";

            Object.keys(results[id].workersNeeded).map(cadreId =>{

                cadre=this.state.cadreDict[cadreId];
                curr_workers=(results[id].currentWorkers[cadreId])?results[id].currentWorkers[cadreId].toString():'0';
                needed_workers=(results[id].workersNeeded[cadreId])?results[id].workersNeeded[cadreId].toFixed(1).toString():'0';
                pressure=results[id].pressure[cadreId].toString();
                gap=(results[id].currentWorkers[cadreId]-results[id].workersNeeded[cadreId]).toFixed(1).toString();
                facility=results[id].facility.toString();

                if(facility !== currFacility){

                    currFacility = facility;

                    printable.push({
                        facility:`<b>`+currFacility+`</b>`,
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
                    difference:gap,
                    ratio:pressure
                });
            });
            //facility=this.state.results[id].facility; 
        });
        return printable;
    }

    render() {
        return (
            <Report data={this.state.data} 
                    opening={(<h2>Workforce Pressure Calculator - Results</h2>)}/>           
        );
    }
}
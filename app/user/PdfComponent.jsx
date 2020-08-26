import * as React from 'react';

//import Report from 'bv-react-data-report';

<<<<<<< HEAD:app/user/ResultExcelComponent.jsx
import {FaFileExcel } from 'react-icons/fa';

import * as FileSaver from 'file-saver';

import * as XLSX from 'xlsx';

export default class ResultExcelComponent extends React.Component {

=======
import Report from 'react-data-report';

export default class PdfComponent extends React.Component {
    
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/user/PdfComponent.jsx
    constructor(props) {

        super(props);

        this.state = {
            cadreDict:props.cadreDict,
            results:props.results,
        }

    }

    createTemplate(results){

        let printable=[];
<<<<<<< HEAD:app/user/ResultExcelComponent.jsx

        Object.keys(results).map(id => {
=======
        
        Object.keys(this.state.results).map(id => {
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/user/PdfComponent.jsx
            
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
        });
        return printable;
    }
  
    async generateTemplate(results){

<<<<<<< HEAD:app/user/ResultExcelComponent.jsx
        const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const fileExtension = '.xlsx';
        const fileName = 'results';

        const template = await this.createTemplate(results);

        
        const wb = XLSX.utils.book_new();

        const ws_template = XLSX.utils.json_to_sheet(template);
        XLSX.utils.book_append_sheet(wb,ws_template,"RESULTS");
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const data = new Blob([excelBuffer], {type: fileType});
        FileSaver.saveAs(data, fileName + fileExtension);
    }
    render() {
        return (
            <div>
                <button className="button" onClick={() => this.generateTemplate(this.props.results)}>
                    <FaFileExcel /> Download</button>
            </div>    
=======
    render() {
        return (
            <Report data={this.state.data} 
                    opening={(<h2>Workforce Pressure Calculator - Results</h2>)}/>           
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/user/PdfComponent.jsx
        );
    }
}
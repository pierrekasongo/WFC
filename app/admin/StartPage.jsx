import * as React from 'react';
import { Panel } from 'react-bootstrap';
import {FaArrowLeft,FaArrowRight} from 'react-icons/fa';

import 'rc-steps/assets/index.css';
import 'rc-steps/assets/iconfont.css';
import Steps, { Step } from 'rc-steps';


import ImportPage from '../import/ImportPage';
import CadreTimePage from '../user/CadreTimePage';
import StatisticsPage from '../admin/StatisticsPage';
import CalculationPage from '../user/CalculationPanel';
import MatchingPage from '../admin/MatchingPage';

const importData_desc = 'Import all required metadata into the system.';

//const activityDuration_desc='Set time(duration) for each treatment(activity) involved in the calculation.';

const cadreTime_desc ='Set cadre working and not working time.';

const Match_desc ='Match treatments to Dhis2 and facilities to iHRIS.';

const startImport_desc = 'Import treatments annual statistics and workforce data';

const calculation_desc='Calculate the workforce pressure.';

export default class StartPage extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            currentStep:0,
            maxSteps:4,
        }
    }
    nexStep(){

        let current=this.state.currentStep;

        let maxSteps=this.state.maxSteps;
        
        if(current < maxSteps){
            current++;
            this.setState({
                currentStep:current
            });
            
        }else{
            this.setState({currentStep:0});
        }
    }
    previousStep(){

        let current=this.state.currentStep;
        
        if(current >= 0){
            current--;
            this.setState({
                currentStep:current
            });
            
        }else{
            this.setState({currentStep:0});
        }
    }
    render() {
        return (
            <div>
                <Panel bsStyle="primary" header="Start process">                
                    <div class="container-fluid bg-3">
                        <div style={{marginTop:5}}>
                            <Steps current={this.state.currentStep}>
                                <Step title="Metadata import" description={importData_desc} />
                                {/*<Step title="Time on treatment" description={activityDuration_desc} />*/}
                                <Step title="Cadre worktime" description={cadreTime_desc} />
                                <Step title="Treatments/facilities matching" description={Match_desc} />
                                <Step title="Annual/Workforce statistics" description={startImport_desc} />
                                <Step title="Workload calculation" description={calculation_desc} />
                            </Steps>
                            <div className="div-steps">
                                <span>
                                    <button className="button-step" onClick={() => this.previousStep()}><FaArrowLeft /></button>
                                </span>
                                <span>
                                    <button className="button-step" onClick={() => this.nexStep()}><FaArrowRight /></button>
                                </span>
                            </div>
                            <hr/>
                            {(this.state.currentStep == 0) && 
                                <ImportPage />
                            }
                            {(this.state.currentStep == 1) && 
                                <CadreTimePage />
                            }
                            {(this.state.currentStep == 2) && 
                                <MatchingPage />
                            }
                            {(this.state.currentStep == 3) && 
                                <StatisticsPage />
                            }
                            {(this.state.currentStep == 4) && 
                                <CalculationPage />
                            }
                        </div>
                    </div>                        
                </Panel>
                <br/>
            </div>
        );
    }

};
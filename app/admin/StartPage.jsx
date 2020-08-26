import * as React from 'react';
import { Panel } from 'react-bootstrap';
import {FaArrowLeft,FaArrowRight} from 'react-icons/fa';

import 'rc-steps/assets/index.css';
import 'rc-steps/assets/iconfont.css';
import Steps, { Step } from 'rc-steps';


<<<<<<< HEAD
import TemplatePage from '../template/TemplatePage';
import StatisticsPage from '../admin/StatisticsPage';
import CaluclationPage from '../user/CalculationPage';
=======
import ImportPage from '../import/ImportPage';
import CadreTimePage from '../user/CadreTimePage';
import StatisticsPage from '../admin/StatisticsPage';
import CalculationPage from '../user/CalculationPanel';
import MatchingPage from '../admin/MatchingPage';
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed

const generate_template_desc ='Generate service and HR data template.';

const upload_data_desc = 'Upload service  and HR statistics data.';

const calculation_desc='Calculate the workforce pressure.';

export default class StartPage extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            currentStep:0,
            maxSteps:3,
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
                                <Step title="Generate service and HR template" description={generate_template_desc} />
                                <Step title="Service and HR Data upload" description={upload_data_desc} />
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
                                <TemplatePage />
                            }
                            {(this.state.currentStep == 1) && 
                                <StatisticsPage />
                            }
<<<<<<< HEAD
                            {(this.state.currentStep == 2) && 
                                <CaluclationPage />
=======
                            {(this.state.currentStep == 4) && 
                                <CalculationPage />
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
                            }
                        </div>
                    </div>                        
                </Panel>
                <br/>
            </div>
        );
    }

};
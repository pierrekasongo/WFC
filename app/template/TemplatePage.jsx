import * as React from 'react';
<<<<<<< HEAD:app/template/TemplatePage.jsx
import { Panel} from 'react-bootstrap';
import HRTemplatePanel from './HRTemplatePanel';
import ServiceTemplatePanel from './ServiceTemplatePanel';
=======
import Collapsible from 'react-collapsible';
import { Panel} from 'react-bootstrap';
import FacilityImportPanel from './FacilityImportPanel';
import ServiceImportPanel from './ServiceImportPanel';
import CadreImportPanel from './CadreImportPanel';
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/import/ImportPage.jsx
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import {FaClinicMedical, FaUserNurse } from 'react-icons/fa';


export default class TemplatePage extends React.Component {

        constructor(props) {
                super(props);

                console.log("PROPS ",this.props);
        }

        render() {
                return (
                        <div>
                                <Panel bsStyle="primary" header="Data templates">
                                        <Tabs>
                                                <TabList>
                                                        <Tab><FaUserNurse /> Generate HR template</Tab>
                                                        <Tab><FaClinicMedical /> Generate service template</Tab>
                                                </TabList>

                                                <TabPanel>
<<<<<<< HEAD:app/template/TemplatePage.jsx
                                                        <HRTemplatePanel />
                                                </TabPanel>

                                                <TabPanel>
                                                        <ServiceTemplatePanel />
=======
                                                        <CadreImportPanel />
                                                </TabPanel>

                                                <TabPanel>
                                                        <ServiceImportPanel />
                                                </TabPanel>

                                                <TabPanel>
                                                        <FacilityImportPanel />
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/import/ImportPage.jsx
                                                </TabPanel>

                                                {/*<TabPanel>
                                                        <HRUploadPanel />
                                                </TabPanel>*/}
                                        </Tabs>
                                </Panel>
                                <br />
                        </div>
                );
        }
};

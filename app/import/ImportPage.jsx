import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Panel} from 'react-bootstrap';
import FacilityImportPanel from './FacilityImportPanel';
import ServiceImportPanel from './ServiceImportPanel';
import CadreImportPanel from './CadreImportPanel';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { FaUserMd, FaClinicMedical, FaCapsules, FaUserNurse } from 'react-icons/fa';

export default class ImportPage extends React.Component {

        constructor(props) {
                super(props);

                console.log("PROPS ",this.props);
        }

        render() {
                return (
                        <div>
                                <Panel bsStyle="primary" header="Data import">
                                        <Tabs>
                                                <TabList>
                                                        <Tab><FaUserMd /> Cadres</Tab>
                                                        <Tab><FaCapsules /> Treatments</Tab>
                                                        <Tab><FaClinicMedical /> Facilities</Tab>
                                                        {/*<Tab><FaUserNurse /> HR</Tab>*/}
                                                </TabList>

                                                <TabPanel>
                                                        <CadreImportPanel />
                                                </TabPanel>

                                                <TabPanel>
                                                        <ServiceImportPanel />
                                                </TabPanel>

                                                <TabPanel>
                                                        <FacilityImportPanel />
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

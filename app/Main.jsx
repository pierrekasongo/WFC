import * as React from 'react';
import {Route,Redirect} from 'react-router-dom'

import ImportPage from './import/ImportPage';
import ConfigPage from './config/ConfigPage';
import UserPage from './config/UserPage';
import AccountPage from './config/AccountPage';
import HomePage from './user/HomePage';
import StatisticsPage from './admin/StatisticsPage';
import StartPage from './admin/StartPage';
import CadreTimePage from './user/CadreTimePage';
import MetadataPage from './metadata/MetadataComponent';
import 'react-confirm-alert/src/react-confirm-alert.css';

const Main = () => {

    return (
        <div>
            {/*<Route path='/import' exact component={ImportPage} />*/}
            <Route path='/import' exact component={ImportPage}/>
            <Route path='/config' exact component={ConfigPage}/>
            <Route path='/users' exact component={UserPage}/>
            <Route path='/account' exact component={AccountPage}/>
            <Route path='/statistics' exact component={StatisticsPage} />
            <Route path='/start' exact component={StartPage} />
            <Route path='/home'exact component={HomePage} />
            <Route path='/cadre-time' exact component={CadreTimePage} />
            <Route path='/metadata' exact component={MetadataPage} />
            <Route path='/' exact component={HomePage} />
            <Redirect to='/home' />
        </div>
    )
}
export default Main;
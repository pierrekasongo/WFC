import * as React from 'react';
import {Route,Redirect} from 'react-router-dom'

<<<<<<< HEAD

//import AdminPage from './admin/AdminPage';
import CalculationPage from './user/CalculationPage';
import TemplatePage from './template/TemplatePage';
=======
import ImportPage from './import/ImportPage';
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
import ConfigPage from './config/ConfigPage';
import UserPage from './config/UserPage';
import AccountPage from './config/AccountPage';
import HomePage from './user/HomePage';
import StatisticsPage from './admin/StatisticsPage';
import StartPage from './admin/StartPage';
<<<<<<< HEAD
import LoginPage from './auth/LoginPage';
import MetadataPage from './admin/MetadataComponent';
=======
import CadreTimePage from './user/CadreTimePage';
import MetadataPage from './metadata/MetadataComponent';

>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
import 'react-confirm-alert/src/react-confirm-alert.css';

const Main = () => {

    return (
        <div>
<<<<<<< HEAD
            <Route path='/user' exact component={CalculationPage} />
            {/*<Route path='/admin' exact component={AdminPage} />*/}
            <Route path='/template' exact component={TemplatePage} />
            <Route path='/config' exact component={ConfigPage} />
            <Route path='/statistics' exact component={StatisticsPage} />
            <Route path='/start' exact component={StartPage} />
            <Route path='/home'exact component={HomePage} />
            {/*<Route path='/cadre-time' exactcomponent={CadreTimePage} />*/}
            {/*<Route path='/login' component={LoginPage} />
            <Route path='/sign-out' component={LoginPage} />*/}
=======
            {/*<Route path='/import' exact component={ImportPage} />*/}
            <Route path='/import' exact component={ImportPage}/>
            <Route path='/config' exact component={ConfigPage}/>
            <Route path='/users' exact component={UserPage}/>
            <Route path='/account' exact component={AccountPage}/>
            <Route path='/statistics' exact component={StatisticsPage} />
            <Route path='/start' exact component={StartPage} />
            <Route path='/home' exact component={HomePage} />
            <Route path='/cadre-time' exact component={CadreTimePage} />
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed
            <Route path='/metadata' exact component={MetadataPage} />
            <Route path='/' exact component={HomePage} />
            <Redirect to='/home' />
        </div>
    )
}
export default Main;
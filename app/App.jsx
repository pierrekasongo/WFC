import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { BrowserRouter, Route,withRouter, Redirect, Switch, Link, NavLink } from 'react-router-dom'
import { Grid, NavItem, Nav, SplitButton, MenuItem } from 'react-bootstrap';
import axios from 'axios';
import decode from 'jwt-decode';

import toastr from 'toastr';
import 'toastr/build/toastr.min.css';

axios.defaults.baseURL = 'http://127.0.0.1:3000/api';


import LoginPage from './auth/LoginPage';
import Cookies from 'js-cookie';
import 'react-confirm-alert/src/react-confirm-alert.css';

import Menu from './Menu';
import Main from './Main';

import 'react-confirm-alert/src/react-confirm-alert.css';

class App extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
            isAuth: false,
            authLoading: false,
            loginError: '',
            passwordError: '',
            loading:'done'
          };
          this.loginHandler = this.loginHandler.bind(this);
          this.logoutHandler = this.logoutHandler.bind(this);
    }
    componentDidMount() {
        const token = localStorage.getItem('token');
        const expiryDate = localStorage.getItem('expiryDate');
        if (!token || !expiryDate) {
          return;
        }
        if (new Date(expiryDate) <= new Date()) {
          this.logoutHandler();
          return;
        }
        const userId = localStorage.getItem('userId');
        const remainingMilliseconds =
          new Date(expiryDate).getTime() - new Date().getTime();
        this.setState({ isAuth: true, token: token, userId: userId });
        this.setAutoLogout(remainingMilliseconds);
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

    logoutHandler(){
        this.setState({ isAuth: false, token: null });
        localStorage.removeItem('token');
        localStorage.removeItem('expiryDate');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        localStorage.removeItem('countryId');
        localStorage.removeItem('roleId');
        localStorage.removeItem('role');
        localStorage.removeItem('language');
    };

    setAutoLogout(milliseconds) {
        setTimeout(() => {
          this.logoutHandler();
        }, milliseconds);
    };

    loginHandler(event, authData) {

        event.preventDefault();

        this.setState({loading:'loading'});
    
        let login = authData.login;
    
        let password = authData.password;
    
        let data =JSON.stringify({
          login: login,
          password: password
        });
    
        axios.post(`/auth/login`,data, {
          headers: {
            'Content-Type':'application/json'
          }
        }).then(res => {
           
          if(res.status === 400){
              console.log("Login problem");
              
              throw new Error('Login not found.');
          }
    
          if (res.status === 422) {
            throw new Error('Validation failed.');
          }
          if(res.status === 401){
              throw new Error('Wrong user or password');
          }
          if (res.status !== 200 && res.status !== 201) {
            console.log('Error!');
            throw new Error('Could not authenticate you!');
          }
          if(!res.data){
              throw new Error('No user found');
          }
          //if(res.status === 200){
              
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('userId', res.data.userId);
            localStorage.setItem('username',res.data.username);
            localStorage.setItem('countryId',res.data.countryId);
            localStorage.setItem('roleId',res.data.roleId);
            localStorage.setItem('role',res.data.role);
            localStorage.setItem('language',res.data.language);

            //Update last login
            data = {
                    userId:res.data.userId
                };

            axios.patch(`/auth/set_last_login`,data,{
                headers :{
                    Authorization : 'Bearer '+localStorage.getItem('token')
                }
            }).then(rs => {
                    console.log(rs.data);
            }).catch(err => console.log(err))
        
            const remainingMilliseconds = 60 * 60 * 1000;

            const expiryDate = new Date(
                new Date().getTime() + remainingMilliseconds
            );
            localStorage.setItem('expiryDate', expiryDate.toISOString());
            this.setAutoLogout(remainingMilliseconds);

            this.setState({
                isAuth: true,
                authLoading: false,
                loading:'done'
            });
        //}
    
        }).catch(err => {

          let loginError='';
          let passwordError='';

          if(err.response.status === 400){
              loginError = err.response.data;
              passwordError = "";
          }else if(err.response.status === 401){
            loginError = "";
            passwordError = err.response.data;
          }

          this.setState({

              isAuth: false,

              authLoading: false,

              loading:'done',

              loginError:loginError,

              passwordError: passwordError
          });
        });
    }

    render() {
        let routes = (
            <BrowserRouter>
                <Grid>
                    <div>
                        <Route
                                path="/login"
                                exact
                                render={props => (
                                <LoginPage
                                    {...props}
                                    onLogin={this.loginHandler}
                                    onLogout={this.logoutHandler}
                                    loading ={this.state.loading}
                                    loginError={this.state.loginError}
                                    passwordError={this.state.passwordError}
                                        /*loading={this.state.authLoading}*/
                                />
                                )}
                            />
                        
                         <Redirect to="/login" />        
                    </div>
                </Grid>
            </BrowserRouter>   
        );
        if(this.state.isAuth){
            routes = (
                <BrowserRouter>
                    <Grid>
                        <div>
                            <div className="app-name">
                                <span>Workforce Pressure Calculator</span>
                            </div>

                            <Menu  onLogout={this.logoutHandler}/>
                            <br /> <br />
                            <Main />
                        </div>
                    </Grid>
                </BrowserRouter> 
            );
        }
        return (
            routes
        );
    }
}
ReactDOM.render(<App />, document.getElementById("app"));
export default withRouter(App)
import React from 'react';
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import * as axios from 'axios';
import Cookies from 'js-cookie';
import {FaCheck} from 'react-icons/fa';
import  { Redirect,withRouter } from 'react-router-dom';
import Flag from "react-flags";

import './login.css';


class LoginPage extends React.Component {

  constructor(props) {

    super(props);

    this.state = {
      login: "",
      password: "",
    }
  }
  validateForm() {
    return this.state.login.length > 0 && this.state.password.length > 0;
  }

  errorHandler(){
    this.setState({ error: null });
  };

  render() {
    return (
      <div className="login-container">
        <div className="login">
            {/*<form onSubmit={this.handleSubmit}>*/}
            <div className="child-left">
              <span className="title">Workforce Pressure Calculator</span>
              <hr/>
              <p>What is Workforce Pressure Calculator...</p>
            </div>

            <div className="child-right">
              <form onSubmit={e =>
                this.props.onLogin(e, {
                  login: this.state.login,
                  password: this.state.password
                })
                }>
              <h3><b>Login</b></h3>
              {
                this.props.error !== null &&
                <p className="error">{this.props.error}</p>
              }
              <FormControl type="text" placeholder="login" value={this.state.login}
                onChange={e => this.setState({ login: e.target.value })} />
              <br />
              <h3><b>Password</b></h3>
              <FormControl type="password" placeholder="password" value={this.state.password}
                onChange={e => this.setState({ password: e.target.value })} />
              <br />
              {/*<button>Login</button>*/}
              {this.props.loading  &&
                  <div style={{ marginTop: 5, marginBottom: 5 }}>
                        <div className="loader"></div>
                  </div>
              }
              <div>
                <table>
                  <tr>
                    <td><button className="button" disabled={this.validateForm()}><FaCheck /> Login</button></td>
                    <td>
                      <a href="#">Forgot password?</a>
                    </td>
                  </tr>
                </table>
              </div>
            </form>
            </div>   
        </div>
        {/*<div className="languages-div">
              <div>
                <a href="#">
                  <Flag
                      basePath="/img/flags"
                      name="FR"
                      format="png"
                      alt="Français"
                      pngSize={32}
                      shiny={true}
                      alt="Français"
                    />
                </a>
                
              </div>
              <div>
                <a href="#">
                  <Flag
                    basePath="/img/flags"
                    name="US"
                    format="png"
                    pngSize={32}
                    shiny={true}
                    alt="English"
                  />
                </a>
                
              </div>
        </div>*/}       
      </div>
    );
  }
}
export default withRouter(LoginPage)
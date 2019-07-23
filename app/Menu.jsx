import * as React from 'react';
import {withRouter,NavLink } from 'react-router-dom'
import {NavItem, Nav} from 'react-bootstrap';

import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaCogs, FaTachometerAlt, FaPlay, FaDatabase,FaUsers,FaKey } from 'react-icons/fa';

import { Translation } from 'react-i18next';

const Menu = (props) => {

    let isAdmin = (localStorage.getItem('role') === 'admin');

    let isSuper = (localStorage.getItem('role') === 'super_user');

    return(
        <div>
            <Nav bsStyle="tabs" activekey="1">

                <NavLink className="sign-out" to="/logout" onClick={props.onLogout}>
                    <Translation>
                        {
                            t => <h6 class="m-b-20"><b>{t("menu_logout")}</b></h6>
                        }
                    </Translation>
                </NavLink>

                <NavItem className="link-wrapper" componentClass='span'>
                    <NavLink activeClassName="active" to="/home">
            
                        <Translation>
                        {
                            t => <h6 class="m-b-20"><FaTachometerAlt /> <b>{t("menu_dashboard")}</b></h6>
                        }
                        </Translation>
                    </NavLink>
                </NavItem>

                <NavItem className="link-wrapper" componentClass='span'>
                    <NavLink activeClassName="active" to="/start">
                        
                        <Translation>
                        {
                            t => <h6 class="m-b-20"><FaPlay /> <b>{t("menu_start")}</b></h6>
                        }
                        </Translation>
                    </NavLink>
                </NavItem>

                {isSuper &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/metadata">
                             
                            <Translation>
                            {
                                t => <h6 class="m-b-20"><FaDatabase /> <b>{t("menu_metadata")}</b></h6>
                            }
                            </Translation>
                        </NavLink>
                    </NavItem>
                }
                 {(isAdmin || isSuper) &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/users">
                            
                                <Translation>
                                {
                                    t => <h6 class="m-b-20"><FaUsers /> <b>{t("menu_users")}</b></h6>
                                }
                                </Translation>
                            
                        </NavLink>
                    </NavItem>
                }
                {(isAdmin || isSuper) &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/config">
                             
                                <Translation>
                                {
                                    t => <h6 class="m-b-20"><FaCogs /> <b>{t("menu_config")}</b></h6>
                                }
                                </Translation>
                            
                        </NavLink>
                    </NavItem>
                }
                 <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/account">
                            
                                <Translation>
                                {
                                    t => <h6 class="m-b-20"><FaKey /> <b>{t("menu_account")}</b></h6>
                                }
                                </Translation>
                            
                        </NavLink>
                </NavItem>
               
            </Nav>
        </div>
    )
}
export default withRouter(Menu);
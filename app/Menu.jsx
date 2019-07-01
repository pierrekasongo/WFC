import * as React from 'react';
import {withRouter,NavLink } from 'react-router-dom'
import {NavItem, Nav} from 'react-bootstrap';

import 'react-confirm-alert/src/react-confirm-alert.css';
import { FaCogs, FaTachometerAlt, FaPlay, FaDatabase,FaUsers,FaKey } from 'react-icons/fa';

const Menu = (props) => {
    let isAdmin = (localStorage.getItem('role') === 'admin');
    let isSuper = (localStorage.getItem('role') === 'super_user');
    return(
        <div>
            <Nav bsStyle="tabs" activekey="1">

                <NavLink className="sign-out" to="/logout" onClick={props.onLogout}>Logout</NavLink>

                <NavItem className="link-wrapper" componentClass='span'><NavLink activeClassName="active" to="/home"><FaTachometerAlt /> Dashboard</NavLink></NavItem>
                <NavItem className="link-wrapper" componentClass='span'><NavLink activeClassName="active" to="/start"><FaPlay /> Start</NavLink></NavItem>
                {isSuper &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/metadata"><FaDatabase /> Metadata</NavLink>
                    </NavItem>
                }
                 {(isAdmin || isSuper) &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/users">
                            <span className="glyphicon glyphicon-cog" aria-hidden="true"><FaUsers /> Users</span>
                        </NavLink>
                    </NavItem>
                }
                {(isAdmin || isSuper) &&
                    <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/config">
                            <span className="glyphicon glyphicon-cog" aria-hidden="true"><FaCogs /> Config</span>
                        </NavLink>
                    </NavItem>
                }
                 <NavItem className="link-wrapper" componentClass='span'>
                        <NavLink activeClassName="active" to="/account">
                            <span className="glyphicon glyphicon-cog" aria-hidden="true"><FaKey /> Account</span>
                        </NavLink>
                </NavItem>
               
            </Nav>
        </div>
    )
}
export default withRouter(Menu);
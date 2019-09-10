import * as React from 'react';
import Collapsible from 'react-collapsible';
import { Button, Table, FormGroup } from 'react-bootstrap';
import axios from 'axios';
import toastr from 'toastr';
import 'toastr/build/toastr.min.css';
import Multiselect from 'react-multiselect-checkboxes';
import { FaEdit } from 'react-icons/fa';

export default class DashboardListComponent extends React.Component {

    constructor(props) {

        super(props);

        this.state = {
        };
    }

    render() {
        return (
            <div className="dashboard-list">
                <div className="dashboard-list-div">
                    {this.props.dashboards.map(db =>
                        <table>
                            <tr>
                                <td>
                                    <a href="#" onClick={() => this.props.showDashboard(db.id,db.name,db.detail)} className="dashboard-link">
                                        {db.name}
                                    </a>
                                </td>
                            </tr>
                        </table>
                    )}
                </div>
            </div>
        )
    }

};
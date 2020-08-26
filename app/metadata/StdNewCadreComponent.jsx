import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import {FaCheck,FaTimes } from 'react-icons/fa';

export default class NewCadreComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code:'',
<<<<<<< HEAD:app/admin/NewCadreComponent.jsx
            name:'',
            worktime:'',
            admin_task:''
=======
            name_fr:'',
            name_en:'',
            worktime:''
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/StdNewCadreComponent.jsx
        }
    }
    render() {
        return (
            <tr>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Code"
                            value={this.props.cadre.code}
                            onChange={e => this.setState({ code: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Name"
                            value={this.props.cadre.name}
                            onChange={e => this.setState({ name: e.target.value })} />
                </td>
               
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Worktime"
                            value={this.props.cadre.worktime}
                            onChange={e => this.setState({ worktime: e.target.value })} />
                </td>
                <td>
                    <a href="#" className="add-new-link" onClick={() => this.props.cancel()}><FaTimes /></a>
                </td> 
                <td>
                    <a href="#" className="add-new-link" onClick={() => this.props.save(this.state)}><FaCheck /></a>
                </td>
            </tr>
        );
    }

}
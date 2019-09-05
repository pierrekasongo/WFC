import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import {FaCheck,FaTimes } from 'react-icons/fa';

export default class StdNewCadreComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code:'',
            name_fr:'',
            name_en:'',
            worktime:''
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
                            placeholder="Name (fr)"
                            value={this.props.cadre.name_fr}
                            onChange={e => this.setState({ name_fr: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Name (en)"
                            value={this.props.cadre.name_en}
                            onChange={e => this.setState({ name_en: e.target.value })} />
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
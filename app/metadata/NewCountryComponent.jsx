import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import {FaCheck,FaTimes } from 'react-icons/fa';

export default class NewCountryComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code:'',
            name_fr:'',
            name_en:'',
            holidays:'',
        }
    }
    render() {
        return (
            <tr>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Code"
                            value={this.state.code}
                            onChange={e => this.setState({ code: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Name (fr)"
                            value={this.state.name_fr}
                            onChange={e => this.setState({ name_fr: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Name (en)"
                            value={this.state.name_en}
                            onChange={e => this.setState({ name_en: e.target.value })} />
                </td>
                <td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Holidays"
                            value={this.state.holidays}
                            onChange={e => this.setState({ name_en: e.target.value })} />
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
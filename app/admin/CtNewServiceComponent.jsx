import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

import { default as UUID } from "uuid";

export default class CtNewServiceComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: '',
            name:'',
            duration: '',
        }
    }
    componentDidMount() {
        this.setState({ code: UUID.v4() });
    }

    render() {
        return (
            <tr>
                
                <td style={{ fontSize: 14 }}>
                    <input type="text"
                        placeholder="Name"
                        value={this.state.name}
                        onChange={e => this.setState({ name: e.target.value })} />
                </td>
                
                <td style={{ fontSize: 14 }}>
                    <input type="text"
                        placeholder="Duration"
                        value={this.state.duration}
                        onChange={e => this.setState({ duration: e.target.value })} />
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
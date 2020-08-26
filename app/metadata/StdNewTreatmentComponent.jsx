import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

import { default as UUID } from "uuid";

export default class StdNewTreatmentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: '',
            cadre_code: '',
            name_fr: '',
            name_en: '',
            duration: '',
        }
    }
    componentDidMount() {
        this.setState({ code: UUID.v4() });
    }
    render() {
        return (
            <tr>
                {/*<td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Code"
                            value={this.state.code}
                            onChange={e => this.setState({ code: e.target.value })} />
                </td>*/}

                <td style={{ fontSize: 14 }}>
                    <select onChange={e => this.setState({ cadre_code: e.target.value })}
                        value={this.state.cadre_code}>
                        <option value="000">Select value</option>
                        {this.props.cadres.map(cadre =>
                            <option
                                key={cadre.code}
                                value={cadre.code}>
                                {cadre.name_fr + '/' + cadre.name_en}
                            </option>
                        )}
                    </select>
                </td>
                <td style={{ fontSize: 14 }}>
                    <input type="text"
                        placeholder="Name (fr)"
                        value={this.state.name_fr}
                        onChange={e => this.setState({ name_fr: e.target.value })} />
                </td>
                <td style={{ fontSize: 14 }}>
                    <input type="text"
                        placeholder="Name (en)"
                        value={this.state.name_en}
                        onChange={e => this.setState({ name_en: e.target.value })} />
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
import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

import { default as UUID } from "uuid";

export default class CtNewTreatmentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: '',
            facility_type:'',
            cadre_code: '',
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
                {/*<td style={{fontSize:14}}>
                    <input type="text"
                            placeholder="Code"
                            value={this.state.code}
                            onChange={e => this.setState({ code: e.target.value })} />
                </td>*/}
                <td style={{ fontSize: 14 }}>
                    <select onChange={e => this.setState({ facility_type: e.target.value })}
                        value={this.state.facility_type}>
                        <option value="000">Facility type</option>
                        {this.props.facilityTypes.map(faType =>
                            <option
                                key={faType.code}
                                value={faType.code}>
                                {faType.name_fr + '/' + faType.name_en}
                            </option>
                        )}
                    </select>
                </td>

                <td style={{ fontSize: 14 }}>
                    <select onChange={e => this.setState({ cadre_code: e.target.value })}
                        value={this.state.cadre_code}>
                        <option value="000">Cadre</option>
                        {this.props.cadres.map(cadre =>
                            <option
                                key={cadre.std_code}
                                value={cadre.std_code}>
                                {cadre.name}
                            </option>
                        )}
                    </select>
                </td>

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
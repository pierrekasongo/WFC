import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';
import { FaCheck, FaTimes } from 'react-icons/fa';

import { default as UUID } from "uuid";

export default class NewTreatmentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            code: '',
            cadre_code: '',
            name: '',
            duration: '',
        }
<<<<<<< HEAD:app/admin/NewTreatmentComponent.jsx
    }
    componentDidMount() {
        this.setState({ code: UUID.v4() });
=======
>>>>>>> 21323bf0a0848ae5f6b76536d41ae1cd45aed2ed:app/metadata/NewTreatmentComponent.jsx
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
                                {cadre.name + '/' + cadre.name}
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
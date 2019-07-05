import * as React from 'react';
import { Panel, Form, FormGroup, ControlLabel, Button, FormControl, Col, Checkbox, Table } from 'react-bootstrap';

export default class NewTreatmentComponent extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            //name: "",
            cadreId: Object.keys(props.cadres)[0],
            facilityTypeId: Object.keys(props.facilityTypes)[0],
            duration:0
        }
    }
    render() {
        return (
            <tr>
                <td>
                    <FormControl
                            componentClass="select"
                            onChange={e => this.setState({ treatmentId: e.target.value })}
                            value={this.state.treatmentId}>
                            {Object.keys(this.props.treatments).map(treatment =>
                                <option
                                    key={this.props.treatments[treatment].id}
                                    value={this.props.treatments[treatment].id}>
                                    {this.props.treatments[treatment].activityName}
                                </option>
                            )}
                    </FormControl>
                </td>
                <td>
                    <FormControl
                        componentClass="select"
                        onChange={e => this.setState({ cadreId: e.target.value })}
                        value={this.state.cadreId}>
                        {Object.keys(this.props.cadres).map(cadre =>
                            <option
                                key={this.props.cadres[cadre].id}
                                value={this.props.cadres[cadre].id}>
                                {this.props.cadres[cadre].name}
                            </option>
                        )}
                    </FormControl>
                </td>
                <td>
                    <FormControl
                        type="number"
                        value={this.state.duration}
                        onChange={e => this.setState({duration:e.target.value})} />
                </td>
                <td>
                    <Button bsStyle="warning" className="btn-bulk" bsSize="small" onClick={() => this.props.cancel()}>Cancel</Button>
                    <Button bsStyle="warning" className="btn-bulk" bsSize="small" onClick={() => this.props.save(this.state)}>Save</Button>
                </td>
            </tr>
        );
    }

}
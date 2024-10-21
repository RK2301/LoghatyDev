import { t } from "i18next";
import React, { Component } from "react";
import { Progress, Row, Col } from 'reactstrap';

class MyProgress extends Component {
    constructor(props) {
        super(props);
        this.state = {
            barProgress: 0,
            timeToComplete: this.props.timeToComplete || 3,
            id: undefined
        }
        this.progressTheBar = this.progressTheBar.bind(this);
    }

    componentDidMount() {
        const id = setInterval(this.progressTheBar, 1000);
        this.setState({
            id: id
        });
        this.progressTheBar()
    }

    progressTheBar() {
        //console.log('called');
        if (this.state.barProgress >= 100) {
            this.stopInterval(this.state.id);
        }
        let toAdd = 100 / this.state.timeToComplete;
        this.setState({
            barProgress: this.state.barProgress + toAdd
        });
    }

    stopInterval() {
        // console.log(`clear interval: ${this.state.id}`);
        clearInterval(this.state.id)
    }

    render() {
        return (
            <Row className="justify-content-center align-items-center">
                <Col xs={12} md={8}>
                    <Progress value={this.state.barProgress} striped animated color="dark" />
                </Col>
                <Col xs={'auto'} >
                    { t('wait') }
                </Col>
            </Row>
        );
    }

}

export default MyProgress;
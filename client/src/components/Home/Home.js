import React from 'react';
import { Col, Container, Row } from 'reactstrap';
import Schedule from './homeComponents/Schedule';
import CurrentShifts from './homeComponents/CurrentShifts';
import Restricted from '../../permissions/Restricted';
import * as Permissions from '../../permissions/permissionTypes';
import ShiftBarChart from './homeComponents/ShiftBarCharts';
import ShiftPieChart from './homeComponents/ShiftPieChart';
import UnSubmittedHomeworks from './homeComponents/UnSubmittedHomeworks';
import RecentMessages from './homeComponents/RecentMessages';

const Home = ({ user }) => {

    return (
        <Container className='p-0 p-md-3'>
            <Row>
                <Col xs={12}>
                    <Schedule />
                </Col>
            </Row>

            <Row className='mt-3'>
                <Col xs={12} md={6} style={{ height: '40vh' }}>
                    <Restricted to={Permissions.VIEW_SHIFTS}>
                        <CurrentShifts user={user} />
                    </Restricted>

                    <Restricted to={Permissions.VIEW_UNSUBMITTED_HOMEWORKS}>
                        <UnSubmittedHomeworks />
                    </Restricted>
                </Col>

                <Col xs={12} md={6} style={{ height: '40vh' }}>
                    <RecentMessages />
                </Col>
            </Row>

            <Row className='mt-3'>
                <Restricted to={Permissions.VIEW_SHIFTS}>
                    <Col xs={12} md={6} style={{ height: '45vh' }}>
                        <ShiftBarChart user={user} />
                    </Col>
                </Restricted>

                <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                    <Col xs={12} md={6} style={{ height: '45vh' }} className='mt-3 mt-md-0'>
                        <ShiftPieChart />
                    </Col>
                </Restricted>
            </Row>
        </Container>
    )
}

export default Home;
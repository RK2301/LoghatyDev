import React from 'react';
import { Col, Row } from 'reactstrap';
import { StyledRoundedSkeleton } from '../materialUiOverride';

const TableLoading = ({heigh}) => (
    <Row style={{height: heigh ? heigh : '40vh'}}>
        <Col xs={12}>
            <StyledRoundedSkeleton />
        </Col>
    </Row>
);

export default TableLoading;
import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";

const ReportLoading = ({ }) => {
    return (
        <Container style={{ height: '25vh' }}>
            <Row>
                <Col xs={12} md={6} style={{ height: '5vh' }}>
                    <StyledRoundedSkeleton />
                </Col>
            </Row>
            <Row className="mt-2 mb-2">
                <Col xs={12} style={{height: '20vh'}}>
                    <StyledRoundedSkeleton />
                </Col>
            </Row>
        </Container>
    )
}

export default ReportLoading;
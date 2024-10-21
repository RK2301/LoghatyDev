import { Skeleton } from "@mui/material";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";

const CardTableLoading = ({ }) => {

    return (
        <Container className="h-100 mt-5">
            <Row className="h-20 justify-content-center">
                <Col xs={6} md={4}>
                    <Skeleton variant='text' animation='wave' />
                </Col>
                <Col xs={6} md={4}>
                    <Skeleton variant="text" animation='wave' />
                </Col>
                <Col xs={12} md={8}>
                    <Skeleton variant="text" animation='wave' />
                </Col>
            </Row>
            <Row className="h-50  mt-3 justify-content-center">
                <Col xs={12} md={8}>
                    <StyledRoundedSkeleton />
                </Col>
            </Row>
        </Container>
    )

}

export default CardTableLoading;
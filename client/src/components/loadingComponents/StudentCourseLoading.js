import { useMediaQuery } from "@mui/material";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";

const StudentCourseLoading = ({ }) => {
    const isMobile = useMediaQuery(theme => theme.breakpoints.only('xs'));

    return (
        <Container style={{ height: isMobile ? '50vh' : '25vh' }}>
            <Row>
                {
                    [1, 2].map(i => (
                        <Col md={6} xs={12} style={{height:'25vh'}} className="mt-1">
                            <StyledRoundedSkeleton />
                        </Col>
                    ))
                }
            </Row>
        </Container>
    )
}

export default StudentCourseLoading;
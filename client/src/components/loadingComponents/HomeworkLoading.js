import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";
import { useMediaQuery } from "@mui/material";

const HomeworkLoading = () => {
    const isMobile = useMediaQuery(theme => theme.breakpoints.only('xs'));
    return (
        <Container className="mt-3">
            <Row className="">
                <Col xs={12} md={4} style={{height: isMobile ? '5vh' : '50vh'}}>
                   <StyledRoundedSkeleton />
                </Col>

                <Col className='mt-2 mt-md-0' xs={12} md={8} style={{height: '50vh'}}>
                    <StyledRoundedSkeleton />
                </Col>
            </Row>
        </Container>
    )
}

export default HomeworkLoading;
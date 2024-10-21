import { Skeleton } from "@mui/material";
import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";

const CardsLoading = ({ }) => {
    const skeletonCards = [1, 2, 3].map(i => (
        <Col xs={12} md={4} className="h-100">
            <StyledRoundedSkeleton />
            <Skeleton variant='text' animation='wave' />
            <Skeleton variant='text' animation='wave' />
        </Col>
    ))
    return (
        <>
            <Container fluid className="h-100 d-none d-md-block">
                <Row className="h-50">
                    {[1, 2, 3].map(i => (
                        <Col md={4} className="h-100">
                            <Skeleton variant='rounded' animation='wave' height={'75%'} />
                            <Skeleton variant='text' animation='wave' />
                            <Skeleton variant='text' animation='wave' />
                        </Col>
                    ))}
                </Row>
            </Container>

            <Container fluid className="h-100 d-block d-md-none">
                <Row className="h-100">
                    {[1, 2, 3].map(i => (
                        <Col xs={12} className="h-25">
                            <Skeleton variant='rounded' animation='wave' height={'85%'} />
                            <Skeleton variant='text' animation='wave' />
                            <Skeleton variant='text' animation='wave' />
                        </Col>
                    ))}
                </Row>
            </Container>
        </>
    )
}

export default CardsLoading;
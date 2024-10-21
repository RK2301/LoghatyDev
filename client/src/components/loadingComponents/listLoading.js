import React from "react";
import { Col, Container, Row } from "reactstrap";
import { StyledRoundedSkeleton } from "../materialUiOverride";
import { Skeleton } from "@mui/material";

const ListLoading = ( {} ) => {
    return (
        <Container fluid style={{height:'50vh'}} className="mt-3">
            <Row className="h-100">
              { 
              [1, 2, 3, 4].map( n => (
                <Col xs={12}  style={{height:'20%'}}>
                  <StyledRoundedSkeleton />
                </Col>
              ))
            }
            </Row>
        </Container>
    )
}

export default ListLoading;
import { Button } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import {  FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import withDirection, {DIRECTIONS} from "react-with-direction";
import { Col, Row } from "reactstrap";


const BackButton = ( {direction} ) => {
    const navigateBack = useNavigate();
    const { t } = useTranslation();

     return (
        <Row>
            <Col xs={'auto'}>
                <Button
                onClick={ () => navigateBack(-1) }
                >
                    <Row className="justify-content-center g-1">
                        <Col xs={'auto'}> {direction === DIRECTIONS.LTR ? <FaArrowLeft className="basic-icon" /> : <FaArrowRight className="basic-con" />} </Col>
                        <Col xs={'auto'}> { t('back') } </Col>
                    </Row>
                </Button>
            </Col>
        </Row>
    )
}

export default withDirection(BackButton);
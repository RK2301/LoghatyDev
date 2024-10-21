import React from "react";
import styles from './coursesStyle.module.css';
import { useTranslation } from "react-i18next";
import { FaArrowDown, FaCalendarAlt, FaFilter, FaPlus, FaPlusSquare } from "react-icons/fa";
import { Col, Row } from "reactstrap";
import { useState } from "react";
import withDirection, { DIRECTIONS } from 'react-with-direction';
import { StyledFeedbackButton } from "../materialUiOverride";
import { Link } from "react-router-dom";
import { MdAdd, MdBook, MdFilterList } from "react-icons/md";
import { IconButton } from "@mui/material";
import Restricted from "../../permissions/Restricted";
import * as PermissionsTypes from '../../permissions/permissionTypes';

const SideCourse = (props) => {
    const { t } = useTranslation();

    return (
        <>
            <Row className="justify-content-between">
                <Col xs={9} md={5}>
                    <Row className="g-2">

                        <Restricted to={PermissionsTypes.ADD_UPDATE_COURSE}>
                            <Col xs={6}>
                                <StyledFeedbackButton
                                    component={Link}
                                    to='/addCourse'>
                                    <Row className="justify-content-center g-2">
                                        <Col xs={'auto'}>
                                            <MdAdd className="basic-icon" />
                                        </Col>
                                        <Col xs={'auto'}>
                                            {t('add')}
                                        </Col>
                                    </Row>
                                </StyledFeedbackButton>
                            </Col>
                        </Restricted>

                        <Restricted to={PermissionsTypes.ADD_UPDATE_SUBJECT}>
                            <Col xs={6}>
                                <StyledFeedbackButton
                                    component={Link}
                                    to='/subjects'>
                                    <Row className="justify-content-center g-2">
                                        <Col xs={'auto'}>
                                            <MdBook className="basic-icon" />
                                        </Col>
                                        <Col xs={'auto'}>
                                            {t('courseType')}
                                        </Col>
                                    </Row>
                                </StyledFeedbackButton>
                            </Col>
                        </Restricted>
                    </Row>
                </Col>
                {/* <Col xs={'auto'}>
                    <IconButton>
                        <MdFilterList className="basic-icon" />
                    </IconButton>
                </Col> */}
            </Row>
        </>
    );

}

export default withDirection(SideCourse);
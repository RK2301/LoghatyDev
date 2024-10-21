import React from "react";
import { useTranslation } from "react-i18next";
import { MdLogout } from "react-icons/md";
import { Container, Modal, ModalBody, Row, Col } from 'reactstrap';
import { StyledFeedbackButton } from "../materialUiOverride";
import PropTypes from 'prop-types';
import { Typography } from "@mui/material";
import withDirection from "react-with-direction";

const LogOutModal = ({ isOpen, toggle, logout, direction }) => {
    const { t } = useTranslation();
    return (
        <>
            <Modal
                isOpen={isOpen}
                toggle={toggle}
                centered
                backdropTransition={{ timeout: 700 }}
                modalTransition={{ timeout: 500 }}
            >

                <ModalBody>
                    <Container fluid dir={direction}>
                        <Row >
                            <Col xs='auto'>
                                <Typography variant='subtitle1'>
                                    {t('logout1')}
                                </Typography>
                            </Col>
                        </Row>

                        <Row >
                            <Col xs='auto'>
                                <Typography variant='subtitle1'>
                                    {t('logout2')}
                                </Typography>
                            </Col>
                        </Row>
                        <Row className="justify-content-center mt-3">
                            <Col xs={12} md={6}>
                                <StyledFeedbackButton color='error' onClick={logout[0]}>
                                    <MdLogout color='black' size={22} />
                                </StyledFeedbackButton>
                            </Col>
                        </Row>
                    </Container>
                </ModalBody>
            </Modal>
        </>
    );
}

LogOutModal.propTypes = {
    /**array contain function to reset the data login and logout the user */
    logout: PropTypes.array.isRequired
}

export default withDirection(LogOutModal);

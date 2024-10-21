import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import { Col, Container, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { useParams } from "react-router-dom";
import { useState } from "react";
import * as Validators from '../validators';
import { Button, Grow, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import { StyledTextField } from "../materialUiOverride";
import Feedback from "../feedback/Feedback";
import { useTranslation } from "react-i18next";
import Restricted from "../../permissions/Restricted";
import { MANAGE_MESSAGES } from "../../permissions/permissionTypes";
import { FaRegPaperPlane, FaUsers } from "react-icons/fa";
import BackButton from "../backButton";
import UsersModal from "./usersModal";
import { formatDateTime } from "../services";

const MessageForm = ({ mode, messages, addNewMessage, getMessageUsers, updateMessage }) => {

    const [message, setMessage] = useState({});
    const { t } = useTranslation();
    const isMobile = useMediaQuery(useTheme().breakpoints.down('md'));
    /**object hold which users selected to sent the message, or has been sent to */
    const [selectedUsers, setSelectedUsers] = useState({});

    //get message if opened for update or view
    const message_id = parseInt(useParams().id);
    useEffect(() => {
        if (mode === 'u' || mode === 'v') {
            setMessage(messages.filter(msg => msg.message_id === message_id)[0] || {});
            /**get users must receive the message */
            if (mode === 'u')
                getMessageUsers(message_id)
                    .then(users => { setSelectedUsers(users) })
                    .catch(e => { });
        }
    }, [message_id]);

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const validate = (values) => {
        const errors = {};

        Validators.required(values.message_title, 'message_title', errors);
        Validators.required(values.message_content, 'message_content', errors);

        return errors;
    }

    const numberOfUsersSelected = () => {
        let count = 0;
        Object.keys(selectedUsers).forEach(id => {
            if (selectedUsers[id])
                count++;
        })
        return count;
    }

    if (mode === 'u' && (!message || Object.keys(message).length === 0))
        return (<></>);

    return (
        <Container className="h-100 p-md-0">
            {mode === 'a' || isMobile ?
                (<Row>
                    <Col xs={1} className="d-none d-md-block" />
                    <Col xs='auto'>
                        <BackButton />
                    </Col>
                </Row>) : <></>}
            <Formik
                initialValues={{
                    message_title: message.message_title || '',
                    message_content: message.message_content || ''
                }}
                validate={validate}
                enableReinitialize
                onSubmit={(values, { setSubmitting, resetForm }) => {

                    //can't add or update if no users selected to sent the message
                    if (numberOfUsersSelected() > 0 && mode === 'a') {
                        setSubmitting(false);
                        const message = { ...values };
                        message.sent_time = formatDateTime(new Date());
                        const users = [];

                        Object.keys(selectedUsers).forEach(id => {
                            if (selectedUsers[id])
                                users.push(id);
                        });
                        message.message_users = users;

                        addNewMessage(message, resetForm, setSubmitting);
                    } else if (mode === 'u') {
                        const updMessage = { ...values }
                        updMessage.message_id = message.message_id;
                        updateMessage(updMessage, setSubmitting);
                    }
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form className="h-100">
                        <div className="d-flex flex-column justify-content-around h-100">
                            <div>
                                <Row className='justify-content-center'>
                                    <Col xs={12} md={mode === 'a' && !isMobile ? 7 : 10}>
                                        <Field
                                            as={StyledTextField}
                                            name={'message_title'}
                                            sx={{pointerEvents:mode === 'v' ? 'none' : 'all'}}
                                            label={t('title')}
                                            required
                                            error={touched.message_title && errors.message_title}
                                            helperText={<ErrorMessage name="message_title" />}
                                        />
                                    </Col>
                                </Row>

                                <Row className='justify-content-center'>
                                    <Col xs={12} md={mode === 'a' && !isMobile ? 7 : 10}>
                                        <Field
                                            as={StyledTextField}
                                            name={'message_content'}
                                            label={t('content')}
                                            sx={{pointerEvents:mode === 'v' ? 'none' : 'all'}}
                                            required
                                            multiline
                                            minRows={6}
                                            error={touched.message_content && errors.message_content}
                                            helperText={<ErrorMessage name="message_content" />}
                                        />
                                    </Col>
                                </Row>

                                {mode === 'a' || mode === 'u' ? (
                                    <Restricted to={MANAGE_MESSAGES}>
                                        <Row>
                                            {!isMobile ? <Col md={3}></Col> : <></>}
                                            <Col xs='auto'>
                                                <Button variant='text' startIcon={<FaUsers />} onClick={toggle}>
                                                    {t('usersToSent')}
                                                </Button>
                                            </Col>
                                            <Col xs='auto' className='d-flex align-items-center'>
                                                <Typography variant='body2' color={numberOfUsersSelected() > 0 ? undefined : 'red'}>
                                                    {numberOfUsersSelected() > 0 ?
                                                        t('totalUserSelected', { total: numberOfUsersSelected() }) : t('noUsersSelected')}
                                                </Typography>
                                            </Col>
                                        </Row>
                                    </Restricted>
                                )
                                    : <></>}
                            </div>

                            <div>
                                {mode === 'a' ?
                                    (
                                        <Row>
                                            {!isMobile ? <Col md={3}></Col> : <></>}
                                            <Col xs='auto'>
                                                <Typography variant='subtitle2'>
                                                    {t('selectUsersWarning')}
                                                </Typography>
                                            </Col>
                                        </Row>
                                    )
                                    : <></>}
                                <Restricted to={MANAGE_MESSAGES}>
                                    <Feedback
                                        btnText={mode === 'a' ? t('send') : t('update')}
                                        btnLogo={mode === 'a' ? <FaRegPaperPlane size={17} /> : undefined}
                                        disabled={isSubmitting} />
                                </Restricted>
                            </div>
                        </div>
                    </Form>
                )}
            </Formik>

            <Restricted to={MANAGE_MESSAGES}>
                <UsersModal
                    isOpen={isOpen}
                    toggle={toggle}
                    selectedUsers={selectedUsers}
                    setSelectedUsers={setSelectedUsers}
                    mode={mode}
                    numberOfUsersSelected={numberOfUsersSelected}
                />
            </Restricted>
        </Container>
    );
}

MessageForm.propTypes = {
    /**indicate for which mode the form opened, a -> add new message, u -> update exists message, v -> view message */
    mode: PropTypes.oneOf(['a', 'u', 'v']).isRequired,
    /**state of all users, for select users modal */
    allUsers: PropTypes.object.isRequired
}

export default MessageForm;

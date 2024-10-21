import React, { Component } from "react";
import { useTranslation } from "react-i18next";
import {  Modal, ModalBody, ModalHeader, Col, Label, Container, Row } from "reactstrap";
import { Field, Formik, Form, ErrorMessage } from 'formik';
import * as Validators from '../validators';
import { closeModal, formatTheDate } from '../services'
import Feedback from "../feedback/Feedback";
import { StyledDateField, StyledTextField } from "../materialUiOverride";
import { useState } from "react";
import dayjs from "dayjs";
import { ButtonGroup, FormControl, Button } from "@mui/material";
import { FaCheck } from "react-icons/fa";
import withDirection from "react-with-direction";

class TeacherModal extends Component {

    constructor(props) {
        super(props);
    }

    padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    formatDate(date = new Date()) {
        return [
            date.getFullYear(),
            this.padTo2Digits(date.getMonth() + 1),
            this.padTo2Digits(date.getDate()),
        ].join('-');
    }

    validate = (values) => {
        const errors = {};

        Validators.required(values.id, 'id', errors) || Validators.onlyNumbers(values.id, 'id', errors)
            || Validators.sholudEqual(values.id, 'id', 9, errors);

        Validators.required(values.firstname, 'firstname', errors) || Validators.shouldBeAtLeast(2)(values.firstname, 'firstname', errors)
            || Validators.shouldBeAtMost(15)(values.firstname, 'firstname', errors);

        Validators.required(values.lastname, 'lastname', errors) || Validators.shouldBeAtLeast(2)(values.lastname, 'lastname', errors)
            || Validators.shouldBeAtMost(15)(values.lastname, 'lastname', errors);

        if(values.phone)
        Validators.onlyNumbers(values.phone, 'phone', errors);

        Validators.required(values.username, 'username', errors);

        Validators.required(values.email, 'email', errors);

        return errors;
    }

    ModalContent = () => {
        const { t } = useTranslation();
        const [DateError, setDateError] = useState(null);

        return (
            <Modal isOpen={this.props.isOpen}
                modalTransition={{ timeout: 500 }}
                backdropTransition={{ timeout: 700 }}
                toggle={this.props.toggle} centered
                scrollable backdrop='static' size="lg"
                onExit={() => { this.props.reset_after_error() }}
                
            >
                <ModalHeader toggle={this.props.toggle} className="modal-header">
                    {this.props.operationToDo === 'ADD' ? t('addTeacher') : t('updateTeacher')}
                </ModalHeader>
                <ModalBody dir={this.props.direction}>

                    <Formik
                        initialValues={{
                            id: this.props.updateUser.id || '',
                            firstname: this.props.updateUser.firstname || '',
                            lastname: this.props.updateUser.lastname || '',
                            username: this.props.updateUser.username || '',
                            email: this.props.updateUser.email || '',
                            phone: this.props.updateUser.phone || '',
                            hire_date: this.props.updateUser.hire_date ? dayjs( formatTheDate(this.props.updateUser.hire_date)) : null,
                            isManager: this.props.updateUser.isManager || false
                        }}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            //to disable submit button
                            setSubmitting(true);
                            const val = {...values};
                            val.hire_date = formatTheDate(values.hire_date);
                            this.props.add_upd_teacher(val, this.props.token, this.props.changeAddUpd, setSubmitting,
                                resetForm, this.props.operationToDo);
                        }}
                        validate={this.validate}
                    >
                        {({ isSubmitting, touched, errors, setFieldValue, values }) => (
                            <Form>
                                <Container>
                                    <Row>
                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='id'
                                                label={t('id')}
                                                required
                                                error={touched.id && errors.id}
                                                disabled={this.props.operationToDo === 'ADD' ? false : true}
                                                helperText={<ErrorMessage name="id" />}
                                            />
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='firstname'
                                                label={t('firstname')}
                                                required
                                                error={touched.firstname && Boolean(errors.firstname)}
                                                helperText={<ErrorMessage name="firstname" />}
                                            />
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='lastname'
                                                label={t('lastname')}
                                                required
                                                error={touched.lastname && Boolean(errors.lastname)}
                                                helperText={<ErrorMessage name="lastname" />}
                                            />
                                        </Col>
                                    </Row>

                                    <Row>
                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='username'
                                                validate={this.props.operationToDo === 'ADD' ? (value) => Validators.uniqueUsername(value, this.props.token) : undefined}
                                                disabled={this.props.operationToDo === 'ADD' ? false : true}
                                                size={'small'}
                                                label={t('username')}
                                                required
                                                helperText={<ErrorMessage name="username" />}
                                                error={touched.username && errors.username}
                                            />
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='phone'
                                                label={t('phone')}
                                                error={touched.phone && errors.phone}
                                                helperText={<ErrorMessage name="phone" />}
                                            />
                                        </Col>

                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledTextField}
                                                name='email'
                                                label={t('email')}
                                                type='email'
                                                required
                                                error={touched.email && errors.email}
                                                helperText={<ErrorMessage name="email" />}
                                            />
                                        </Col>

                                    </Row>

                                    <Row>
                                        <Col xs={12} md={4}>
                                            <Field
                                                as={StyledDateField}
                                                name='hire_date'
                                                value={values.hire_date}
                                                label={t('hire_date')}
                                                onChange={(value) => setFieldValue('hire_date', value.format('L'))}
                                                onError={(err) => setDateError(err)}
                                                disableFuture
                                                slotProps={{
                                                    textField: {
                                                        helperText: <ErrorMessage name="hire_date" />,
                                                        required:true
                                                    }
                                                }}
                                                error={touched.hire_date && errors.hire_date}
                                            />
                                        </Col>

                                        <Col xs={12} md={4}>
                                        <FormControl
                                            component="fieldset"
                                            margin='dense'
                                            fullWidth>
                                            <Field
                                                as={ButtonGroup}
                                                aria-label="course-selection"
                                                name="isManager"
                                                variant="outlined"
                                                fullWidth
                                            >
                                                <Button
                                                    onClick={() => setFieldValue('isManager', false)}
                                                    endIcon={ !values.isManager ? <FaCheck size={15} /> : null}
                                                    color={ !values.isManager? 'secondary' : 'primary'}
                                                    variant={!values.isManager ? 'contained' : 'outlined'}
                                                >
                                                    {t('teacher')}
                                                </Button>
                                                <Button
                                                    onClick={() => setFieldValue('isManager', true)}
                                                    endIcon={values.isManager ? <FaCheck size={15} /> : null}
                                                    color={values.isManager  ? 'secondary' : 'primary'}
                                                    variant={values.isManager ? 'contained' : 'outlined'}
                                                >
                                                    {t('manager')}
                                                </Button>
                                            </Field>
                                        </FormControl>
                                    </Col>
                                    </Row>
                                </Container>

                                <Feedback
                                    btnText={this.props.operationToDo === 'ADD' ? t('addTeacher') : t('updateTeacher')}
                                    disabled={isSubmitting}
                                    toggle={this.props.toggle}
                                />
                            </Form>
                        )}
                    </Formik>

                </ModalBody>
            </Modal>
        );
    }

    render() {
        return (
            <this.ModalContent />
        );
    }
}

export default withDirection(TeacherModal); 
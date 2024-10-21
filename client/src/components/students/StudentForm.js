import React from "react";
import * as Validators from '../validators'
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { ErrorMessage, Field, Formik, Form } from "formik";
import Feedback from "../feedback/Feedback";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { formatTheDate, getErrorFromDate } from "../services";
import { MenuItem } from "@mui/material";
import { ListDivider, StyledDateField, StyledTextField } from "../materialUiOverride";
import { useState } from "react";
import { ADD, UPDATE } from "../../redux/ActionTypes";
import dayjs from "dayjs";
import withDirection from "react-with-direction";

/**
 * The component represent a form to add new student or update exists student, in a modal
 */
const StudentForm = ({ isOpen, toggle, reset_after_error, updateUser = {}, operationToDo,
     addUpdStudent, token, direction }) => {

    const { t } = useTranslation();
    const [DateError, setDateError] = useState(null);

    function padTo2Digits(num) {
        return num.toString().padStart(2, '0');
    }

    function formatDate(date = new Date()) {
        return [
            date.getFullYear(),
            padTo2Digits(date.getMonth() + 1),
            padTo2Digits(date.getDate()),
        ].join('-');
    }

    const validate = (values) => {


        const errors = {};
        Validators.required(values.id, 'id', errors) || Validators.onlyNumbers(values.id, 'id', errors)
            || Validators.sholudEqual(values.id, 'id', 9, errors);

        Validators.required(values.firstname, 'firstname', errors) || Validators.shouldBeAtLeast(2)(values.firstname, 'firstname', errors)
            || Validators.shouldBeAtMost(20)(values.firstname, 'firstname', errors);

        Validators.required(values.lastname, 'lastname', errors) || Validators.shouldBeAtLeast(2)(values.lastname, 'lastname', errors)
            || Validators.shouldBeAtMost(20)(values.lastname, 'lastname', errors);

        if (values.phone)
            Validators.onlyNumbers(values.phone, 'phone', errors);

        Validators.required(values.username, 'username', errors);
        Validators.required(values.class, 'class', errors);

        if (values.parentPhone) {
            Validators.onlyNumbers(values.parentPhone, 'parentPhone', errors);
        }

        if (values.birth_date) {
            const res = getErrorFromDate(DateError);
            if (res) errors['birth_date'] = res
        }

        return errors;
    }

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={() => {toggle() ; reset_after_error()}} centered
            scrollable backdrop='static'
            size={'lg'}
            onExit={() => { reset_after_error() } }
            unmountOnClose
            >
            <ModalHeader toggle={ () => {toggle() ; reset_after_error()} } className="modal-header">
                {operationToDo === 'ADD' ? t('addStudent') : t('updateStudent')}
            </ModalHeader>
            <ModalBody  dir={direction}>

                <Formik
                    initialValues={{
                        id: updateUser.id || '',
                        firstname: updateUser.firstname || '',
                        lastname: updateUser.lastname || '',
                        username: updateUser.username || '',
                        email: updateUser.email || '',
                        phone: updateUser.phone || null,
                        birth_date: updateUser.birth_date ? dayjs(updateUser.birth_date) : null,
                        parentName: updateUser.paren_name || null,
                        parentPhone: updateUser.parent_phone || null,
                        class: updateUser.class_id || ''
                    }}
                    onSubmit={(values, { setSubmitting, resetForm }) => {
                        //to disable submit button
                        setSubmitting(true);
                        addUpdStudent({ ...values, birth_date: formatTheDate(values.birth_date), enrollment_date: formatTheDate(new Date()), class_id: values.class }, operationToDo === ADD ? ADD : UPDATE, token, setSubmitting);
                    }}
                    validate={validate}
                >
                    {({ isSubmitting, errors, touched, setFieldValue }) => (
                        <Form>
                            <Container fluid className="mt-3">
                                <Row>

                                    <Col xs={12} md={4}>

                                        <Field
                                            as={StyledTextField}
                                            name='id'
                                            label={t('id')}
                                            required
                                            error={touched.id && errors.id}
                                            disabled={operationToDo === 'ADD' ? false : true}
                                            helperText={<ErrorMessage name="id"  />}
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
                                            helperText={<ErrorMessage name="lastname"  />}
                                        />
                                    </Col>

                                </Row>

                                <Row>

                                    <Col xs={12} md={4}>
                                        <Field
                                            as={StyledTextField}
                                            name='username'
                                            validate={operationToDo === 'ADD' ? (value) => Validators.uniqueUsername(value, token) : undefined}
                                            disabled={operationToDo === 'ADD' ? false : true}
                                            size={'small'}
                                            label={t('username')}
                                            required
                                            helperText={<ErrorMessage name="username" />}
                                            error={touched.username && errors.username}
                                            fullWidth
                                        />
                                    </Col>

                                    <Col xs={12} md={4}>
                                        <Field
                                            as={StyledTextField}
                                            name='phone'
                                            label={t('Studentphone')}
                                            size='small'
                                            fullWidth
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
                                            size='small'
                                            fullWidth
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
                                            name='birth_date'
                                            label={t('birth_date')}
                                            onChange={(value) => setFieldValue('birth_date', value.format('L'))}
                                            onError={(err) => setDateError(err)}
                                            disableFuture
                                            slotProps={{
                                                textField: {
                                                    helperText: <ErrorMessage name="birth_date" />
                                                }
                                            }}
                                            error={touched.birth_date && errors.birth_date}
                                        />
                                    </Col>

                                    <Col xs={12} md={4}>
                                        <Field
                                            as={StyledTextField}
                                            name='parentName'
                                            label={t('parentName')}
                                            size='small'
                                            fullWidth
                                            error={touched.parentName && errors.parentName}
                                            helperText={<ErrorMessage name="parentName"/>}
                                        />
                                    </Col>

                                    <Col xs={12} md={4}>
                                        <Field
                                            as={StyledTextField}
                                            name='parentPhone'
                                            label={t('parentPhone')}
                                            size='small'
                                            fullWidth
                                            error={touched.parentPhone && errors.parentPhone}
                                            helperText={<ErrorMessage name="parentPhone" />}
                                        />
                                    </Col>
                                </Row>

                                <Row>

                                    <Col xs={12} md={4}>
                                        <Field
                                            as={StyledTextField}
                                            name='class'
                                            size='small'
                                            select
                                            label={t('class')}
                                            menuprops={{
                                                 paperprops: {
                                                    sx: {
                                                        backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
                                                        boxShadow: '0px 0px 2px 2px',
                                                        '& .MuiMenuItem-root': {
                                                            padding: 1,
                                                        },
                                                    },
                                                },
                                            }}
                                            required
                                            error={touched.class && errors.class}
                                            helperText={<ErrorMessage name="class"/>}
                                        >
                                            {
                                                [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(c => (
                                                    <MenuItem value={c} >
                                                        {c > 12 ? t('gradute') : c}
                                                    </MenuItem>
                                                ))
                                            }
                                        </Field>
                                    </Col>


                                    {/* <Col xs={12} md={4} className="d-md-none d-block">
                                 <InputLabel variant="standard" htmlFor="uncontrolled-native">
                                    { t('class') }
                                 </InputLabel>
                                        <Field
                                        as={NativeSelect}
                                        name='class'
                                        size='small'
                                        inputProps={{
                                            name:  t('class') ,
                                            id: 'uncontrolled-native',
                                          }}
                                        fullWidth
                                        error= {touched.class && errors.class}
                                        helperText={<ErrorMessage name="class" className='formMsg' component={'p'} /> }
                                        >
                                            <option value={1}> {'1'} </option>
                                            <option value={2}> {'2'} </option>
                                            <option value={3}> {'3'} </option>
                                            <option value={4}> {'4'} </option>
                                        </Field>
                                 </Col>  */}

                                </Row>
                            </Container>

                            <Feedback
                                btnText={operationToDo === ADD ? t('addStudent') : t('updateStudent')}
                                disabled={isSubmitting}
                                toggle={toggle}
                            />

                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
}

StudentForm.propTypes = {
    /**To indicate if open the modal or not */
    isOpen: PropTypes.bool.isRequired,

    /**Function to triggered when the modal need to opened\ closed */
    toggle: PropTypes.func.isRequired,

    /**Object contain the data for teacher\student need to updated */
    updateUser: PropTypes.object,

    /**Indeicate operation type to be done, add or update, when update then updateUser prop must be decalered */
    operationToDo: PropTypes.oneOf([ADD, UPDATE]),

    /**Function to make api call to the server to add or update student */
    addUpdStudent: PropTypes.func.isRequired

}

export default withDirection(StudentForm);
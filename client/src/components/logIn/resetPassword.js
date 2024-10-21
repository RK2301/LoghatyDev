import React from "react";
import { connect, useSelector } from "react-redux";
import { requestVerificationCode, resetPassword, reset_password_state, verifyVerificationCode } from "../../redux/ActionCreators";
import { useState } from "react";
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { dir, t } from "i18next";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { ErrorSnackBar, StyledFeedbackButton, StyledTextField } from "../materialUiOverride";
import * as Validators from '../validators';
import { BeatLoader } from 'react-spinners';
import { Typography, useMediaQuery, useTheme } from "@mui/material";
import { useTranslation } from "react-i18next";
import { FaAngleLeft, FaAngleRight, FaCheck, FaCheckCircle, FaUndoAlt, FaXing } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import withDirection, { DIRECTIONS } from "react-with-direction";


const mapStateToProps = (state) => ({

});

const mapDispacthToProps = (dispatch) => ({
    requestVerificationCode: (unique) => dispatch(requestVerificationCode(unique)),
    verifyVerificationCode: (verificationCode, unique) => dispatch(verifyVerificationCode(verificationCode, unique)),
    resetPasswordFunction: (password, token) => dispatch(resetPassword(password, token)),
    reset_password_state: () => dispatch(reset_password_state())
});


const ResetPassword = ({ isOpen, toggle, requestVerificationCode, verifyVerificationCode,
    resetPasswordFunction, reset_password_state, direction }) => {

    const [step, setStep] = useState(1);
    const nextStep = () => setStep(step + 1);
    const [unique, setUnique] = useState('');
    const [token, setToken] = useState(null);
    const [email, setEmail] = useState('');

    const closeModal = () => {
        setStep(1);
        toggle();
    }

    const ContinueButton = () => {

        const { isLoading } = useSelector(state => state.operation);
        return (
            <Row className="justify-content-end mt-2 w-100"  >
                <Col xs={7} md={6}>
                    <StyledFeedbackButton type='submit' onClick={() => {
                        if (step === 4) {
                            closeModal();
                        }
                    }}>
                        <Row className="justify-content-center g-2">
                            {isLoading ?
                                <Col xs={'auto'}> <BeatLoader size={10} /> </Col>
                                : (
                                    <>
                                        <Col xs='auto'>
                                            {step < 3 ? t('continue') : step === 3 ? t('resetPassword') : t('close')}
                                        </Col>

                                        <Col xs='auto'>
                                            {step < 3 ? direction === DIRECTIONS.LTR ? <FaAngleRight size={17} /> : <FaAngleLeft size={17} />
                                                : step === 3 ? <FaUndoAlt size={17} /> : <MdClose />
                                            }
                                        </Col>
                                    </>
                                )
                            }
                        </Row>
                    </StyledFeedbackButton>
                </Col>
            </Row>
        )
    }

    /**first step of the process, enter username of id to request verification code */
    const Step1 = () => {

        const validate = (values) => {
            const errors = {};
            Validators.required(values.unique, 'unique', errors);
            return errors;
        }
        return (
            <Formik
                initialValues={{
                    unique: ''
                }}
                validate={validate}
                onSubmit={async (values, { setSubmitting }) => {
                    try {
                        setSubmitting(true)
                        const email = await requestVerificationCode(values.unique);
                        setEmail(email);
                        setUnique(values.unique);
                        nextStep();
                    } catch (e) { }
                    finally {
                        setSubmitting(false);
                    }
                }}
            >
                {({ isSubmitting, errors, touched }) => (
                    <Form>
                        <Row className="justify-content-center">
                            <Col xs={12} md={8}>
                                <Field
                                    as={StyledTextField}
                                    name='unique'
                                    label={t('enterIdOrUsername')}
                                    required
                                    error={touched.unique && errors.unique}
                                    helperText={<ErrorMessage name="unique" />}
                                />
                            </Col>
                        </Row>
                        <ContinueButton />
                    </Form>
                )}
            </Formik>
        )
    };

    /**step 2 in  the process, the user has to enter a verification code to continue to the next step or reset the password, 
     * if the code is correct then the server will sent token
     */
    const Step2 = ({ }) => {

        const validate = (values) => {
            const errors = {};
            Validators.required(values.verificationCode, 'verificationCode', errors) ||
                Validators.sholudEqual(values.verificationCode + '', 'verificationCode', 4, errors);
            return errors;
        }

        return (
            <>
                <Row>
                    <Col xs='auto'>
                        <Typography variant='subtitle2'>
                            {t('verificationCodeSent', { email: email })}
                        </Typography>
                    </Col>
                </Row>

                <Formik
                    initialValues={{
                        verificationCode: ''
                    }}
                    validate={validate}
                    onSubmit={async (values, { setSubmitting }) => {
                        try {
                            setSubmitting(true)
                            const token = await verifyVerificationCode(values.verificationCode, unique);
                            setToken(token);
                            nextStep();
                        } catch (e) { }
                        finally {
                            setSubmitting(false);
                        }
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            <Row className="justify-content-center">
                                <Col xs={12} md={8}>
                                    <Field
                                        as={StyledTextField}
                                        name='verificationCode'
                                        label={t('verificationCode')}
                                        type='number'
                                        required
                                        error={touched.verificationCode && errors.verificationCode}
                                        helperText={<ErrorMessage name="verificationCode" />}
                                    />
                                </Col>
                            </Row>
                            <ContinueButton />
                        </Form>
                    )}
                </Formik>
            </>
        )
    }

    /**the third step the user has to set a new password based on some laws */
    const Step3 = ({ }) => {

        const { t } = useTranslation();
        const theme = useTheme();
        const isMobile = useMediaQuery(theme.breakpoints.down('md'));

        const validate = (values) => {
            const errors = {};
            Validators.required(values.password, 'password', errors) ||
                Validators.shouldBeAtLeast(6)(values.password, 'password', errors) ||
                 Validators.containCapitalLetter(values.password, 'password', errors) ||
                   Validators.containNumbers(values.password, 'password', errors);

            Validators.required(values.confirmPassword, 'confirmPassword', errors);

            if (values.password !== values.confirmPassword)
                errors['confirmPassword'] = t('passwordsSholudBeEqual');

            return errors;
        }

        const PasswordLaws = ({ password }) => (
            <Row>
                {!isMobile ? <Col xs={1} /> : <></>}
                <Col xs='auto'>
                    <Row className="g-2">
                        <Col xs='auto'>
                            {Validators.shouldBeAtLeast(6)(password, 'password', {}) ? <MdClose size={20} color='red' /> : <FaCheck />}
                        </Col>

                        <Col xs={11}>
                            {t('passwordAtLeast6Length')}
                        </Col>
                    </Row>

                    <Row className="g-2">
                        <Col xs='auto'>
                            {!Validators.containCapitalLetter(password) ? <MdClose size={20} color='red' /> : <FaCheck />}
                        </Col>

                        <Col xs={11}>
                            {t('passwordShouldHaveCaptialLetter')}
                        </Col>
                    </Row>

                    <Row className="g-2">
                        <Col xs='auto'>
                            {!Validators.containNumbers(password) ? <MdClose size={20} color='red' /> : <FaCheck />}
                        </Col>

                        <Col xs={11}>
                            {t('passwordShouldHave1Number')}
                        </Col>
                    </Row>
                </Col>
            </Row>
        )

        return (
            <Formik
                initialValues={{
                    password: '',
                    confirmPassword: ''
                }}
                validate={validate}
                onSubmit={async (values) => {
                    try {
                        await resetPasswordFunction(values.password, token);
                        nextStep();
                    } catch (e) { }
                }}
            >
                {({ errors, touched, values }) => (
                    <Form>

                        <Row className="justify-content-center">
                            <Col xs={12} md={10}>
                                <Field
                                    as={StyledTextField}
                                    name='password'
                                    label={t('password')}
                                    type='password'
                                    required
                                    error={touched.password && errors.password}
                                    helperText={<ErrorMessage name="password" />}
                                />
                            </Col>
                        </Row>

                        <Row className="justify-content-center">
                            <Col xs={12} md={10}>
                                <Field
                                    as={StyledTextField}
                                    name='confirmPassword'
                                    label={t('confirmPassword')}
                                    type='password'
                                    required
                                    error={touched.confirmPassword && errors.confirmPassword}
                                    helperText={<ErrorMessage name="confirmPassword" />}
                                />
                            </Col>
                        </Row>

                        <PasswordLaws password={values.password} />
                        <ContinueButton />

                    </Form>
                )}
            </Formik>
        )
    }

    const SuccessMessage = () => (
        <div className="h-100 d-flex flex-column align-items-center justify-content-center">
            <Row className="justify-content-center">
                <Col xs='auto'>
                    <FaCheckCircle size={70} color='green' />
                </Col>
            </Row>

            <Row className="justify-content-center">
                <Col xs='auto'>
                    <Typography variant='subtitle2'>
                        {t('resetPasswordSuccess')}
                    </Typography>
                </Col>
            </Row>

            <ContinueButton />
        </div>
    )

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={closeModal}
            centered scrollable backdrop='static'
            size={'md'}
            unmountOnClose
        >
            <ModalHeader toggle={closeModal}>
                {t('resetPassword')}
            </ModalHeader>

            <ModalBody>
                <Container dir={direction}>
                    {
                        step === 1 ? <Step1 /> :
                            step === 2 ? <Step2 /> :
                                step === 3 ? <Step3 /> :
                                    <SuccessMessage />
                    }
                </Container>
            </ModalBody>
        </Modal>
    )

}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(ResetPassword));
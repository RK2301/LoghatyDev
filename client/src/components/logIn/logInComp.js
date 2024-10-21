import { Container, Row, Col, FormGroup, Label } from 'reactstrap';
import './logIn.css';
import { Stagger, FadeTransform } from 'react-animation-components'
import { BeatLoader } from 'react-spinners'
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Validators from '../validators';
import { MdLogin } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import { logInUser } from '../../redux/ActionCreators';
import { connect } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { StyledFeedbackButton, StyledTextField } from '../materialUiOverride';
import { Checkbox, FormControlLabel, Typography } from '@mui/material';
import ResetPassword from './resetPassword';
import { useState } from 'react';


const mapStateToProps = (state) => ({
    loginData: state.login
});

const mapDispacthToProps = (dispatch) => ({
    logInUser: (username, password, remember, setSubmitting) => dispatch(logInUser(username, password, remember, setSubmitting)),
});

const LogIn = ({ loginData, logInUser }) => {

    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen( !isOpen );

    const validate = (values) => {
        const errors = {};

        Validators.required(values.username, 'username', errors);
        Validators.required(values.password, 'password', errors);

        return errors;
    };

    if (Object.keys(loginData.data).length > 0)
        return (
            <Navigate to={'/home'} />
        )

    return (
        <Container fluid className='homeCont '>
            <Stagger in duration={500}>
                <FadeTransform in
                    transformProps={{
                        exitTransform: 'scale(0.5) translateY(100%)'
                    }}>
                    <Row className='justify-content-center align-items-center vh-100 '>
                        <Col xs={11} md={5} lg={4} className='col-css'  style={{boxShadow: '0px 0px 2px 2px'}}>
                            <Row className='justify-content-center m-2'>
                                <Col xs={'auto'}>
                                    <img src={require('./LoghatyLogo.jpg')} className='img-fluid rounded' alt='Logo' width={'200px'} />
                                </Col>
                            </Row>

                            <Formik
                                initialValues={{
                                    username: '',
                                    password: '',
                                    remember: false
                                }}
                                validate={validate}
                                onSubmit={(values, { setSubmitting }) => {
                                    setSubmitting(true);
                                    logInUser(values.username, values.password, values.remember, setSubmitting);
                                    sessionStorage.setItem('password', values.password);
                                }}
                            >
                                {({ isSubmitting, errors, touched }) => (
                                    <Form>
                                        <Row className='justify-content-center'>
                                            <Col md={9}>
                                                <Field
                                                    as={StyledTextField}
                                                    name='username'
                                                    id='username'
                                                    required
                                                    label={ t('username') }
                                                    error={touched.username && errors.username}
                                                    helperText={<ErrorMessage name="username" />}
                                                />
                                            </Col>
                                        </Row>

                                        <Row ow className='justify-content-center'>
                                            <Col md={9}>
                                                <Field
                                                    as={StyledTextField}
                                                    error={touched.password && errors.password}
                                                    helperText={<ErrorMessage name="password" />}
                                                    label={ t('password') }
                                                    type='password'
                                                    name='password'
                                                    id='password'
                                                    required
                                                />
                                            </Col>
                                        </Row>

                                        <Row>
                                            <Col md={2} />
                                            <Col xs='auto'>
                                                <FormControlLabel
                                                    control={<Field
                                                        as={Checkbox}
                                                        name='remember'
                                                        id='remember'
                                                        color='success'
                                                    />}
                                                    label={
                                                        <Typography variant='subtitle2'>
                                                            {t('remmember')}
                                                        </Typography>
                                                    }
                                                    labelPlacement='end'
                                                />

                                            </Col>
                                        </Row>

                                        <Row className='justify-content-center'>
                                            <Col md={6} >
                                                <StyledFeedbackButton type='submit' className='subBtn' disabled={isSubmitting}>
                                                    {loginData.loading ? (<BeatLoader size={10} />) : (
                                                        <>
                                                            <Row className='justify-content-center g-3'>
                                                                <Col xs={'auto'}>
                                                                    <MdLogin size={20} />
                                                                </Col>
                                                                <Col xs={'auto'}>
                                                                    {t('login')}
                                                                </Col>
                                                            </Row>
                                                        </>
                                                    )}
                                                </StyledFeedbackButton>
                                            </Col>
                                        </Row>

                                        <Row className='p-1 mt-1 justify-content-center'>
                                            <Col xs='auto' onClick={toggle}>
                                                <Typography variant='subtitle2' 
                                                sx={{ textDecoration: 'underline',  cursor: 'pointer'}}
                                                >
                                                    { t('forgetPasswordOrNewUser') }
                                                </Typography>
                                            </Col>
                                        </Row>

                                        {loginData.error ? (
                                            <FormGroup row className='justify-content-center align-items-center' >
                                                <Col xs={'auto'} className='formMsg'>
                                                    <p>{loginData.error}</p>
                                                </Col>
                                            </FormGroup>

                                        ) :
                                            (<></>)}

                                    </Form>
                                )}
                            </Formik>

                        </Col>
                    </Row>
                </FadeTransform>
            </Stagger>

            <ResetPassword isOpen={isOpen} toggle={toggle} />
        </Container>
    );
}

export default connect(mapStateToProps, mapDispacthToProps)(LogIn);
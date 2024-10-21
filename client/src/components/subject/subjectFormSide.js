import React from "react";
import PropTypes from 'prop-types';
import { Col, Row } from "reactstrap";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Validators from '../validators';
import { StyledTextField } from "../materialUiOverride";
import { useTranslation } from "react-i18next";
import Feedback from "../feedback/Feedback";
import { IconButton, Typography } from "@mui/material";
import { MdOutlineArrowBack, MdOutlineArrowForward } from "react-icons/md";
import { Link, useParams } from "react-router-dom";
import withDirection, {DIRECTIONS} from "react-with-direction";
import { useEffect } from "react";

const SubjectFormSide = ({ selectedSubject = {}, addSubject, mobile, direction,
     addNewSubject, updateSubject, reset_after_error }) => {

    const { t } = useTranslation();
    // const [selectedSubjectMobile, setSelectedSubjectMobile] = useState( {} );
    // console.log(selectedSubject);
    const validate = (values) => {
        const errors = {}

        Validators.required(values.en, 'en', errors);

        return errors;
    }

    useEffect(() => reset_after_error());

    // const subjectID = parseInt(useParams().id);
    // useEffect( () => {
    //     if(mobile){
    //         if(subjectID !== -1){
    //         const selectSubject = subjects.filter( s => s.id === subjectID )[0];                    
    //         setSelectedSubjectMobile(selectSubject)
    //         }
    //     }
    // }, [subjectID, subjects] )

    // if(!selectedSubjectMobile && mobile)
    // return <></>

    if( !selectedSubject.hasOwnProperty('en')  && !addSubject  ){
        return <></>
    }
        // console.log(`called for the mobile ${mobile}, and the add subject is ${addSubject}`);
        // console.log(selectedSubject);
        return (
            <>
                <div className="d-flex flex-column justify-content-between align-items-center h-100">
                    <Row className="w-100 d-block d-md-none">
                        <Col xs={'auto'}>
                            <IconButton
                            component={Link}
                            to='/subjects'
                            >
                                { direction === DIRECTIONS.LTR ?
                                ( <MdOutlineArrowBack color="black" />) :
                                ( <MdOutlineArrowForward color="black" />)
                                 }
                            </IconButton>
                        </Col>
                    </Row>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            ar: selectedSubject['ar'] || '',
                            he: selectedSubject['he'] ||  '',
                            en: selectedSubject['en'] || '',
                        }}
                        validate={validate}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            // console.log(values);
                            setSubmitting(true)
                            if( !selectedSubject.hasOwnProperty('en') ){
                                //add new subject
                                addNewSubject(values, setSubmitting);
                            }else{
                                //make update changes
                                updateSubject( {...values, id: selectedSubject.id} , setSubmitting)
                            }
                        }}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form className="h-100">
                                <div style={{height:'70%'}}>
                                    <Row className="justify-content-center">
                                        <Col xs={12} md={10} >
                                            <Field
                                                as={StyledTextField}
                                                name={'en'}
                                                label={'English'}
                                                required
                                                error={touched.en && errors.en}
                                                helperText={<ErrorMessage name="en" />}
                                            />
                                        </Col>
    
                                        <Col xs={12} md={10} >
                                            <Field
                                                as={StyledTextField}
                                                name='ar'
                                                label={'عربي'}
                                                error={touched.ar && errors.ar}
                                                helperText={<ErrorMessage name="ar" />}
                                            />
                                        </Col>
    
                                        <Col xs={12} md={10} >
                                            <Field
                                                as={StyledTextField}
                                                name='he'
                                                label={'עברית'}
                                                error={touched.he && errors.he}
                                                helperText={<ErrorMessage name="he" />}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                                <div className="d-flex flex-column align-items-center" style={{height:'30%'}}>
                                    <Row className="w-100">
                                        <Feedback disabled={isSubmitting} btnText={ addSubject  ? t('addSubject') : t('update')} />
                                    </Row>
                                    <Row>
                                        <Col xs={'auto'}>
                                            <Typography variant='caption'>
                                                {t('subjectWarning')}
                                            </Typography>
                                        </Col>
                                    </Row>
                                </div>
                            </Form>
                        )}
                    </Formik>
                </div>
            </>
        )
}

SubjectFormSide.propTypes = {
    /**
     * subject to show it's info, for add new subject no need to set this prop
     * @default {}
     */
    selectedSubject: PropTypes.object,
    /**Variable indicate if the form for add new Subject or view||update */
    addSubject: PropTypes.bool.isRequired,
    /**indicate if the component render for mobile view */
    mobile: PropTypes.bool,
    /**Function to send api call to update subject data if the form opend for update */
    addNewSubject: PropTypes.func.isRequired
}

export default withDirection(SubjectFormSide);
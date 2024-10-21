import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { formatDateTime } from "../services";
import { FaDownload, FaFileAlt, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileWord } from "react-icons/fa";
import withDirection, { DIRECTIONS } from "react-with-direction";
import { useState } from "react";
import { Divider, IconButton, InputAdornment, List, ListItem, TextField } from "@mui/material";
import PropTypes from 'prop-types';
import { useParams } from "react-router-dom";
import { ErrorMessage, Field, Form, Formik } from "formik";
import * as Validators from '../validators';
import { StyledTextField } from "../materialUiOverride";
import Feedback from '../feedback/Feedback';

const SubmitHwModal = ({ isOpen, toggle, courseID, unitID, studentInfo, filesInfo, direction, 
    getHomeworkFile, giveFeedback }) => {

    const { t } = useTranslation();
    const hw_id = parseInt(useParams().unitID);

    const validate = (values) => {
        const errors = {};

        Validators.required(values.grade, 'grade', errors);

        if (values.grade)
            Validators.valueBetween(values.grade, 0, 100, 'grade', errors);

        return errors;
    }

    const filesContent = filesInfo.map((file, index) => {

        let fileType = file.file_name.split('.');
        fileType = fileType[fileType.length - 1];

        let filename = file.file_name.split('.');
        filename = filename.slice(0, filename.length - 1).join('.');


        return (
            <>
                <ListItem>
                    <Row key={file.file_id} style={{ direction: direction, width: '100%' }}>
                        <Col xs={'auto'}>
                            {fileType === 'pdf' ? (<FaFilePdf className="basic-icon" />) :
                                fileType === 'docx' ? (<FaFileWord className="basic-icon" />) :
                                    fileType === 'pptx' ? (<FaFilePowerpoint className="basic-icon" />) :
                                        fileType === 'tiff' || 'gif' || 'jpeg' || 'jpg' || 'png' || 'eps' ?
                                            (<FaFileImage className="basic-icon" />) : (<FaFileAlt className='basic-icon' />)}
                        </Col>
                        <Col xs={'auto'}>
                            {filename}
                        </Col>
                        <Col xs={'auto'} className={direction === DIRECTIONS.LTR ? 'ms-auto' : 'me-auto'}>
                            <IconButton onClick={() => getHomeworkFile(courseID, hw_id, file.file_id)}>
                                <FaDownload className="normal-icon" />
                            </IconButton>
                        </Col>
                    </Row>
                </ListItem>
                {index !== filesInfo.length - 1 ? <Divider variant='middle' component='li' /> : <></>}
            </>
        )
    })

    return (
        <Modal isOpen={isOpen} toggle={toggle} scrollable centered >
            <ModalHeader toggle={toggle} >
                {t('viewSubmit')}
            </ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row className="justify-content-center mb-3" >
                        <Col xs={'auto'}>
                            {studentInfo.student_id}
                        </Col>
                        <Col xs={'auto'}>
                            {studentInfo.full_name}
                        </Col>
                        <Col xs={'auto'}>
                            {formatDateTime(studentInfo.upload_time)}
                        </Col>
                    </Row>
                    <Row>
                        <List>
                            {filesContent}
                        </List>
                    </Row>

                    <Formik
                        initialValues={{
                            grade: studentInfo.grade,
                            submit_note: studentInfo.submit_note || ''
                        }}
                        validate={validate}
                        onSubmit={(values, {setSubmitting}) => {
                            giveFeedback(studentInfo.student_id, hw_id, {...values}, setSubmitting);
                        }}
                    >
                        {({ isSubmitting, touched, errors }) => (
                            <Form>
                                <Row style={{direction: direction}}>
                                    <Col xs='auto' className="d-flex flex-column justify-content-center">
                                        {t('grade')}
                                    </Col>

                                    <Col xs={4} md={3}>
                                        <Row>
                                            <Col xs='auto'>
                                                <Field
                                                    as={TextField}
                                                    name='grade'
                                                    size='small'
                                                    type="number"
                                                    variant="standard"
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">/100</InputAdornment>,
                                                    }}
                                                    required
                                                    error={touched.grade && errors.grade}
                                                    helperText={<ErrorMessage name="grade" />}
                                                />
                                            </Col>
                                        </Row>
                                    </Col>
                                </Row>

                                <Row className="mt-2">
                                    <Col xs={12} md={12}>
                                        <Field
                                            as={StyledTextField}
                                            label={t('feedback')}
                                            name={'submit_note'}
                                            multiline
                                            minRows={2}
                                            maxRows={4}
                                            error={touched.submit_note && errors.submit_note}
                                            helperText={<ErrorMessage name="submit_note" />}
                                        />
                                    </Col>
                                </Row>

                                <Feedback btnText={studentInfo.grade ? t('update') : t('add')} disabled={isSubmitting} toggle={toggle} />
                            </Form>
                        )}

                    </Formik>
                </Container>
            </ModalBody>
        </Modal>
    );
}

SubmitHwModal.propTypes = {
    /**function to download file the student submitted */
    getHomeworkFile: PropTypes.func.isRequired,
    /**functio to make api call to add feedback for given submittion */
    giveFeedback: PropTypes.func.isRequired
}

export default withDirection(SubmitHwModal);
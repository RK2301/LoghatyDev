import React, { memo } from "react";
import PropTypes from 'prop-types';
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { useEffect } from "react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import dayjs from "dayjs";
import { GetTimeFromDateAsHoursAndMin, formatTheDate, getErrorFromDate, getFileExtension } from "../../services";
import { StyledRowTabel, StyledTabelHead, StyledTableCell, StyledTextField, layout, mobilePaper } from "../../materialUiOverride";
import { Alert, IconButton, Input, Table, TableBody, TableRow, TextField } from "@mui/material";
import { FaTrash } from "react-icons/fa";
import { MobileDatePicker, TimePicker } from "@mui/x-date-pickers";
import Feedback from "../../feedback/Feedback";
import * as Validators from '../../validators';
import { useParams } from "react-router-dom";

const UnitModal = memo(({ isOpen, toggle, reset_after_error, addUnit = true, updUnit = {},
    addUnitAPI, lesson_id, updateUnitAPI }) => {

    const course_id = parseInt(useParams().id);
    const [updateMode, setupdateMode] = useState(false);
    useEffect(() => {
        if (Object.keys(updUnit).length > 0) {
            setupdateMode(true);
        }
    }, [addUnit, updUnit]);

    /**this array save new files uplaoded during update stage for unit */
    const [newUploadFiles, setNewUploadFiles] = useState([]);

    const { t } = useTranslation();
    const [submitDateError, setSubmitDateError] = useState(null);
    const [submitTimeError, setSubmitTimeError] = useState(null);

    const validate = (values) => {
        const errors = {};

        if (!addUnit) {
            //for add homework must add a homework title, and submit date and time
            Validators.required(values.hw_title, 'hw_title', errors);
            Validators.required(values.submit_date, 'submit_date', errors);
            Validators.required(values.submit_time, 'submit_time', errors);

            if (submitDateError) {
                const dateError = getErrorFromDate(submitDateError);
                if (dateError) errors.submit_date = dateError;
            }
            if (submitTimeError) {
                const timeError = getErrorFromDate(submitTimeError);
                if (timeError) errors.submit_time = timeError;
            }
        }

        return errors;
    }

    const handleFileDelete = (index, values, setFieldValue) => {

        if(Object.keys(updUnit).length > 0){
            //delete the file from the new uploaded array
            const delIndex = newUploadFiles.length - (values.files.length - index);
            newUploadFiles.splice( delIndex, 1);
        }
        const updatedFiles = [...values.files];
        updatedFiles.splice(index, 1);
        setFieldValue('files', updatedFiles);
    };

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={() => { toggle(); reset_after_error() }}
            centered
            scrollable
            size={'md'}
            onExit={() => { reset_after_error() }}
            unmountOnClose>
            <ModalHeader toggle={() => { toggle(); reset_after_error() }} >
                {updateMode ? updUnit.hasOwnProperty('hw_title') ? t('updateHomework') : t('updateUnit') :
                    addUnit ? t('addUnit') : t('addHomework')}
            </ModalHeader>

            <ModalBody>
                <Container fluid>
                    <Formik
                        initialValues={{
                            filesName: '',
                            files: updUnit.files || [],
                            note_text: updUnit.note_text || '',
                            hw_title: updUnit.hw_title || '',
                            submit_date: updUnit.submit_time ? dayjs(formatTheDate(updUnit.submit_time)) : null,
                            submit_time: updUnit.submit_time ? dayjs(`2023-08-23 ${GetTimeFromDateAsHoursAndMin(updUnit.submit_time)}`) : null
                        }}
                        validate={validate}
                        onSubmit={(values, { setSubmitting, resetForm }) => {
                            try {
                                setSubmitting(true);
                                const formData = new FormData();
                                formData.append('lesson_id', lesson_id);
                                formData.append('note_text', values.note_text);

                                if (Object.keys(updUnit).length > 0) {
                                    //update new unit
                                    formData.append('unit_id', updUnit.unit_id);
                                    formData.append('note_id', updUnit.note_id);
                                    
                                    if(updUnit.hasOwnProperty('hw_title')){
                                        //update a homework
                                        formData.append('hw_title', updUnit.hw_title);
                                        formData.append('submit_time', `${formatTheDate(values.submit_date)} ${GetTimeFromDateAsHoursAndMin(new Date(values.submit_time))}`);
                                    }
                                    
                                    newUploadFiles.forEach(newFile => formData.append('files', newFile));
                                    updateUnitAPI(formData, course_id, setSubmitting);
                                    
                                } else {
                                    //add new unit or homework
                                    values.files.forEach(file => formData.append('files', file));

                                    if (!addUnit) {
                                        //call to add the new homework, and append to the form data the required data for homework
                                        formData.append('hw_title', values.hw_title);
                                        formData.append('submit_time', `${formatTheDate(values.submit_date)} ${GetTimeFromDateAsHoursAndMin(new Date(values.submit_time))}`);
                                    }
                                    addUnitAPI(formData, course_id, setSubmitting);
                                }
                            } catch (e) {
                                console.log(e);
                            }
                        }}>
                        {({ values, isSubmitting, errors, touched, setFieldValue, handleChange }) => (
                            <Form>
                                <Row>
                                    <Col xs={12}>
                                        <Field
                                            name={'filesName'}
                                            type='file'
                                            accept='.jpg, .png, .pdf, .docx, .pptx, .ppt'
                                            multiple
                                            style={{ color: 'transparent' }}
                                            onChange={(event) => {

                                                if (Object.keys(updUnit).length > 0) {
                                                    setFieldValue('files', [...updUnit.files, ...event.target.files]);
                                                    setNewUploadFiles( [...event.target.files] );
                                                } else {
                                                    setFieldValue('files', [...event.target.files]);
                                                }
                                                event.target.value = null;
                                                handleChange(event);
                                            }}
                                        />
                                        <ErrorMessage name="filesName" />
                                    </Col>
                                </Row>

                                <Row className="mt-2">
                                    <Col>
                                        <FieldArray
                                            name='files'>
                                            {values.files.length > 0 ? 
                                            (<Table>
                                                <StyledTabelHead>
                                                    <TableRow>
                                                        <StyledTableCell
                                                            padding={'checkbox'}
                                                        >
                                                            {t('fileName')}
                                                        </StyledTableCell>

                                                        <StyledTableCell
                                                            padding={'checkbox'}
                                                        >
                                                            {t('fileType')}
                                                        </StyledTableCell>

                                                        <StyledTableCell
                                                            padding={'checkbox'}
                                                        >
                                                            {t('delete')}
                                                        </StyledTableCell>
                                                    </TableRow>
                                                </StyledTabelHead>

                                                <TableBody>
                                                    {values.files.map((file, index) => (
                                                        <StyledRowTabel
                                                            hover
                                                            key={file.name || file.file_name}
                                                        >
                                                            <StyledTableCell>
                                                                {file.name || file.file_name}
                                                            </StyledTableCell>

                                                            <StyledTableCell >
                                                                {getFileExtension(file.name) || getFileExtension(file.file_name)}
                                                            </StyledTableCell>

                                                            <StyledTableCell
                                                                size={"small"}
                                                            >
                                                                <IconButton
                                                                    hidden={Object.keys(updUnit).length > 0 && updUnit.files.filter(f => f.file_id === file.file_id)[0]}
                                                                    onClick={() => handleFileDelete(index, values, setFieldValue)}>
                                                                    <FaTrash color="black" size={16} />
                                                                </IconButton>
                                                            </StyledTableCell>
                                                        </StyledRowTabel>
                                                    ))}
                                                </TableBody>
                                            </Table>) : (<></>)}
                                        </FieldArray>
                                    </Col>
                                </Row>

                                {updUnit.hw_title || !addUnit ?
                                    (<Row className="mt-3">
                                        <Col>
                                            <Field
                                                as={StyledTextField}
                                                name={'hw_title'}
                                                label={t('title')}
                                                error={touched.hw_title && errors.hw_title}
                                                helperText={<ErrorMessage name="hw_title" />}
                                            />
                                        </Col>
                                    </Row>)
                                    : (<></>)
                                }

                                <Row>
                                    <Col>
                                        <Field
                                            as={StyledTextField}
                                            name={'note_text'}
                                            multiline
                                            maxRows={5}
                                            label={t('description')}
                                            error={touched.note_text && errors.note_text}
                                            helperText={<ErrorMessage name="note_text" />}
                                        />
                                    </Col>
                                </Row>

                                {updUnit.hw_title || !addUnit ? (
                                    <Row>
                                        <Col xs={7} md={7}>
                                            <Field
                                                as={MobileDatePicker}
                                                name='submit_date'
                                                label={t('submit_date')}
                                                onChange={(value) => setFieldValue('submit_date', value)}
                                                onError={(err) => { setSubmitDateError(err) }}
                                                disablePast
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        margin: 'dense',
                                                        fullWidth: true,
                                                        helperText: <ErrorMessage name='submit_date' />,
                                                        error: touched.submit_date && errors.submit_date,
                                                        onBlur: () => { touched.submit_date = true },
                                                    },
                                                    mobilePaper: mobilePaper,
                                                    layout: layout
                                                }}
                                            />
                                        </Col>

                                        <Col xs={5} md={5}>
                                            <Field
                                                as={TimePicker}
                                                name={'submit_time'}
                                                onChange={(value) => setFieldValue('submit_time', value)}
                                                onError={(err) => { setSubmitTimeError(err) }}
                                                format="HH:mm"
                                                ampm={false}
                                                label={t('submit_time')}
                                                slotProps={{
                                                    textField: {
                                                        size: 'small',
                                                        margin: 'dense',
                                                        onBlur: () => touched.submit_time = true,
                                                        error: (errors.submit_time && touched.submit_time),
                                                        helperText: <ErrorMessage name={`submit_time`} />,
                                                    },
                                                    mobilePaper: mobilePaper,
                                                    desktopPaper: mobilePaper
                                                }}
                                            />
                                        </Col>
                                    </Row>
                                ) : (<></>)}

                                <Feedback disabled={isSubmitting} toggle={toggle}
                                    btnText={Object.keys(updUnit).length === 0 ? t('add') : t('update')} />
                            </Form>
                        )}
                    </Formik>
                </Container>
            </ModalBody>
        </Modal>
    )
})

UnitModal.prototype = {
    /**indicate if the mdoal opend to add unit, if true -> add unit if false then add homework*/
    addUnit: PropTypes.bool.isRequired,
    /**for update mode a object represent a unit or homework must be passed */
    updUnit: PropTypes.object,
    /**function to make api call to add new unit||homework */
    addUnitAPI: PropTypes.func.isRequired,
    /**lesson id indicate to which lesson add or update the unit */
    lesson_id: PropTypes.number.isRequired,
    /**function that make api call to update a exists unit */
    updateUnitAPI: PropTypes.func.isRequired
}

export default UnitModal;
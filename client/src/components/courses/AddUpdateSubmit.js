import React from "react";
import PropTypes from 'prop-types';
import { Col, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { ErrorMessage, Field, FieldArray, Form, Formik } from "formik";
import { IconButton, Table, TableBody, TableRow, Typography } from "@mui/material";
import { StyledRowTabel, StyledTabelHead, StyledTableCell } from "../materialUiOverride";
import { FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import Feedback from "../feedback/Feedback";
import { getFileExtension } from "../services";
import { useParams } from "react-router-dom";

const AddUpdateSubmit = ({ isOpen, toggle, reset_after_error, updSubmit = {}, submit_homework, updateSubmitHomework }) => {

    const { t } = useTranslation();
    const course_id = parseInt(useParams().id);
    const hw_id = parseInt(useParams().unitID);

    const handleFileDelete = (index, values, setFieldValue) => {
        const new_files = values.files.slice();
        new_files.splice(index, 1);
        setFieldValue('files', new_files);
    }

    const validate = (values) => {
        const errors = {};

        if (values.files.length === 0) {
            errors.filesName = t('required');
        }

        return errors;
    }

    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            centered
            scrollable
            size='md'
            onExit={() => { reset_after_error() }}
            unmountOnClose
        >
            <ModalHeader toggle={() => { toggle(); reset_after_error() }} >
                {Object.keys(updSubmit).length > 0 ? t('updateSubmit') : t('addSubmit')}
            </ModalHeader>

            <ModalBody>
                <Formik
                    initialValues={{
                        filesName: '',
                        files: []
                    }}
                    validate={validate}
                    onSubmit={(values, { setSubmitting }) => {
                        const formData = new FormData();
                        values.files.forEach(file => formData.append('files', file));
                        setSubmitting(true);

                        if (Object.keys(updSubmit).length === 0) {
                            //make api call to submit the homework
                            submit_homework(formData, course_id, hw_id, setSubmitting);
                        } else {
                            //api call to update the submit
                            updateSubmitHomework(formData, course_id, hw_id, setSubmitting)
                        }
                    }}
                >
                    {({ isSubmitting, values, handleChange, setFieldValue }) => (
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
                                            setFieldValue('files', [...event.target.files]);
                                            event.target.value = null;
                                            handleChange(event);
                                        }}
                                    />
                                    <ErrorMessage name="filesName" className="formMsg" component={'p'} />
                                </Col>
                            </Row>

                            {Object.keys(updSubmit).length > 0 ?
                                (
                                    <Typography variant='subtitle2' className="mt-2">
                                        {t('warningForUpdateSubmit')}
                                    </Typography>
                                )
                                : <></>}

                            <Row className="mt-2">
                                <Col>
                                    <FieldArray name='files'>
                                        {values.files.length > 0 ?
                                            (<>
                                                <Table>
                                                    <StyledTabelHead>
                                                        <TableRow>
                                                            <StyledTableCell
                                                                padding={'checkbox'}
                                                            >
                                                                {t('file_name')}
                                                            </StyledTableCell>

                                                            <StyledTableCell
                                                                padding={'checkbox'}
                                                            >
                                                                {t('file_type')}
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
                                                                key={file.name}
                                                            >
                                                                <StyledTableCell>
                                                                    {file.name}
                                                                </StyledTableCell>

                                                                <StyledTableCell >
                                                                    {getFileExtension(file.name)}
                                                                </StyledTableCell>

                                                                <StyledTableCell
                                                                    size={"small"}
                                                                >
                                                                    <IconButton
                                                                        onClick={() => handleFileDelete(index, values, setFieldValue)}>
                                                                        <FaTrash color="black" size={16} />
                                                                    </IconButton>
                                                                </StyledTableCell>
                                                            </StyledRowTabel>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </>)
                                            : <></>}
                                    </FieldArray>
                                </Col>
                            </Row>

                            <Feedback btnText={Object.keys(updSubmit).length > 0 ? t('update') : t('submit')}
                                disabled={isSubmitting} toggle={toggle} />
                        </Form>
                    )}
                </Formik>
            </ModalBody>

        </Modal>
    )
}

AddUpdateSubmit.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    reset_after_error: PropTypes.func.isRequired,
    /**if opened for update mode, then must pass this prop, contain the submit data, like submit_time, grade... */
    updSubmit: PropTypes.object,
    /**function to enable student to add new submit to the homework */
    submit_homework: PropTypes.func.isRequired,
    /**function to update submit by adding more files */
    updateSubmitHomework: PropTypes.func.isRequired
}

export default AddUpdateSubmit;
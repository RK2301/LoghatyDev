import { ErrorMessage, Field, Form, Formik } from 'formik';
import React from 'react';
import * as Validators from '../validators';
import { Button, Col, FormGroup, Modal, ModalBody, ModalHeader } from 'reactstrap';
import { ADD_NOTE } from '../../redux/ActionTypes';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import FeedBackComponent from '../feedback/feedBackComponent';
import Feedback from '../feedback/Feedback';
import { StyledTextField } from '../materialUiOverride';
import { Typography } from '@mui/material';

function AddViewNote({ isOpen, toggle, target_user_id, manager_id, token, addNote, updateNote,
    noteDetails = {}, actionType /*Add Or Update*/ }) {

    const { t } = useTranslation();
    const [state, setState] = useState({
        note_count: 0
    });
    const validate = (values) => {
        const errors = {};

        Validators.required(values.note_title, 'note_title', errors);
        Validators.required(values.note_text, 'note_text', errors) ||
            Validators.shouldBeAtMost(1000)(values.note_text, 'note_text', errors);

        setState({ ...state, note_count: values.note_text.length })

        return errors;
    }

    return (
        <Modal isOpen={isOpen} toggle={toggle}
            backdropTransition={{ timeout: 700 }} modalTransition={{ timeout: 500 }}
            centered scrollable>
            <ModalHeader toggle={toggle} className='modal-header' >
                {actionType === ADD_NOTE ? t('addNote') : t('updateViewNote')}
            </ModalHeader>
            <ModalBody>
                <Formik
                    initialValues={{
                        note_title: noteDetails.note_title || '',
                        note_text: noteDetails.note_text || ''
                    }}
                    validate={validate}
                    onSubmit={(values, { setSubmitting, resetForm }) => {

                        setSubmitting(true);
                        if (actionType === ADD_NOTE) {
                            addNote(target_user_id, manager_id, values.note_title, values.note_text, token,
                                setSubmitting);
                        } else {
                            const newNote = {
                                ...noteDetails,
                                note_text: values.note_text,
                                note_title: values.note_title,
                            }
                            updateNote(newNote, token, setSubmitting);
                        }
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            <FormGroup row>
                                <Col xs={12}>
                                    <Field
                                        as={StyledTextField}
                                        name='note_title'
                                        label={t('noteTitle')}
                                        required
                                        error={touched.note_title && errors.note_title}
                                        helperText={<ErrorMessage name="note_title" />}
                                    />
                                </Col>
                            </FormGroup>

                            <FormGroup row className='justify-content-end'>
                                <Col xs={'auto'} >
                                    <Typography variant='subtitle2'> {state.note_count}/1000 </Typography>
                                </Col>
                            </FormGroup>
                            
                            <FormGroup row>
                                <Col xs={12}>
                                    <Field
                                        as={StyledTextField}
                                        label={t('note_text')}
                                        name={'note_text'}
                                        multiline
                                        minRows={6}
                                        error={touched.note_text && errors.note_text}
                                        helperText={<ErrorMessage name="note_text" />}
                                    />
                                </Col>
                            </FormGroup>
                            
                            <Feedback
                                btnText={actionType === ADD_NOTE ? t('add') : t('update')}
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
export default AddViewNote;


import { ErrorMessage, Field, Form, Formik } from "formik";
import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Container, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { required } from '../../validators';
import { StyledTextField } from "../../materialUiOverride";
import Feedback from "../../feedback/Feedback";
import PropTypes from 'prop-types';

const NoteModal = ({ isOpen, toggle, shift_note, shift_note_api, start_shift, viewMode }) => {

    const { t } = useTranslation();
    const validate = (values) => {
        const errors = {};
        required(values.shift_note, 'shift_note', errors);
        return errors;
    }
    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            backdropTransition={{ timeout: 700 }} modalTransition={{ timeout: 500 }}
            centered scrollable>
            <ModalHeader toggle={toggle} className='modal-header'>
                {viewMode ? t('note') : shift_note ? t('updateNote') : t('addNote')}
            </ModalHeader>

            <ModalBody>
                <Formik
                    initialValues={{
                        shift_note: shift_note
                    }}
                    validate={validate}
                    onSubmit={(values) => {
                        shift_note_api({ ...values, start_shift: start_shift });
                    }}
                >
                    {({ isSubmitting, errors, touched }) => (
                        <Form>
                            <Container>
                                <Row>
                                    <Col>
                                        <Field
                                            as={StyledTextField}
                                            label={t('note_text')}
                                            name={'shift_note'}
                                            multiline
                                            minRows={6}
                                            error={touched.shift_note && errors.shift_note}
                                            helperText={<ErrorMessage name="shift_note" />}
                                        />
                                    </Col>
                                </Row>
                                {!viewMode ? (
                                    <Feedback disabled={isSubmitting} btnText={shift_note ? t('updateNote') : t('addNote')} toggle={toggle} />
                                ) : <></>}
                            </Container>
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    )
}

NoteModal.propTypes = {
    /**string indicate when the shift has started to be able to add the note to the shift */
    start_shift: PropTypes.string.isRequired,
    /**boolean indicate if the modal opened for view mode, helps for view mode when managere want to open 
     * notes for other teachers to only view the notes
     */
    viewMode: PropTypes.bool
}

export default NoteModal;
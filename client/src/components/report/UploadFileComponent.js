import { Formik, Field, Form, ErrorMessage } from 'formik';
import React, { useState } from 'react';
import { Container, Modal, ModalBody, ModalHeader, Row, Col, FormGroup, Button, Label } from 'reactstrap';
import { FaUpload } from 'react-icons/fa'
import { useTranslation } from 'react-i18next';
import * as Validators from '../validators';
import Feedback from '../feedback/Feedback';


function UploadFile (props) {

    const { t } = useTranslation();
    const [state, setState] = useState({
        file: {}
    });

    const changeFile = (event) => {
        setState({ ...state, file: event.target.files[0] });
    }

    const validateErrors = (values) => {
        const errors = {};
        Validators.required(values.file, 'file', errors);
        return errors;
    }

    return (
        <Modal isOpen= {props.isOpen} toggle= {props.toggle}
        backdropTransition={ {timeout:700} } modalTransition= { {timeout: 500} }
        scrollable centered backdrop='static'>
            <ModalHeader toggle= {props.toggle} className='modal-header'>
                { t('uploadFile') }
            </ModalHeader>
            <ModalBody>
                <Container fluid>
                    <Row className='justify-content-center'>
                        <Col xs={12}>
                            <Formik
                            initialValues={{
                                file: ''
                            }}
                            onSubmit={ (values, { setSubmitting, resetForm } ) => {
                                //start action to send the file to the server
                                setSubmitting(true);
                                props.uploadFile(state.file, props.files.id,
                                    setSubmitting, resetForm);
                            } }
                            validate={validateErrors}
                            onChange= {(e) => {
                               //setFieldValue("file",e.target.files[0])
                            }}
                            >

                            { ( {isSubmitting, handleChange} ) => (
                                <Form>
                                    <FormGroup row className='justify-content-center'>
                                         <Col xs={12}>
                                           <Field type='file' name='file' id='file'
                                           onChange={(event) => {
                                            changeFile(event);
                                            //setFieldValue('file', event.target.value)
                                            handleChange(event)
                                            }}  />
                                         </Col>
                                         <Col xs={12} >
                                            <ErrorMessage name='file' className='formMsg' component={'p'} />
                                         </Col>
                                         <Feedback btnLogo={<FaUpload />} disabled={isSubmitting} toggle={props.toggle} />
                                    </FormGroup>
                                </Form>
                            ) }
                            </Formik>
                        </Col>
                    </Row>
                </Container>
            </ModalBody>
        </Modal>
    );

}

export default UploadFile;
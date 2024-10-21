import React, { useState } from "react";
import withDirection from "react-with-direction";
import PropTypes from 'prop-types';
import { Col, Modal, ModalBody, Row } from "reactstrap";
import { Typography } from "@mui/material";
import { ErrorMessage, Field, Form, Formik } from "formik";
import { mobilePaper } from "../../materialUiOverride";
import * as Validators from '../../validators';
import { useTranslation } from "react-i18next";
import { TimePicker } from "@mui/x-date-pickers";
import Feedback from "../../feedback/Feedback";
import dayjs from "dayjs";


const ReminderModal = ({ isOpen, toggle, direction, notify, denyToNotify, subscribeUser }) => {

    const [notifyError, setNotifyError] = useState(null);
    const { t } = useTranslation();

    const validate = (values) => {
        const errors = {};
        Validators.required(values.notify, 'notify', errors);
        return errors;
    };


    const handleSubscribeClick = () => {
        if ('serviceWorker' in navigator && 'PushManager' in window) {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission === 'granted') {
                        subscribeUser();
                    } else {
                        denyToNotify();
                    }
                });
        } else {
            console.log('Push notifications are not supported.');
        }
    };




    return (
        <Modal
            isOpen={isOpen}
            toggle={toggle}
            backdropTransition={{ timeout: 700 }} modalTransition={{ timeout: 500 }}
            centered
        >
            <ModalBody dir={direction}>
                <Row>
                    <Col xs='auto'>
                        <Typography variant='subtitle1'>
                            {t('shiftReminderNote')}
                        </Typography>
                    </Col>
                </Row>

                <Formik
                    initialValues={{
                        notify: notify ? dayjs(`10-28-2023 ${notify}`) : null
                    }}
                    validate={validate}
                    onSubmit={(values, {setSubmitting}) => {
                        setSubmitting(false);
                        handleSubscribeClick()
                    }}
                >
                    {({ errors, touched, isSubmitting, setFieldValue }) => (
                        <Form>
                            <Row className="justify-content-center">
                                <Col xs={6} md={6}>
                                    <Field
                                        as={TimePicker}
                                        name={'notify'}
                                        onChange={(value) => setFieldValue('notify', value)}
                                        onError={(err) => setNotifyError(err) }
                                        format="HH:mm"
                                        ampm={false}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                margin: 'dense',
                                                name: `notify`,
                                                onBlur: () => touched.notify = true,
                                                error: (errors.notify && touched.notify),
                                                helperText: <ErrorMessage name={`notify`} />,
                                            },
                                            mobilePaper: mobilePaper,
                                            desktopPaper: mobilePaper
                                        }}
                                    />
                                </Col>
                            </Row>

                            <Feedback btnText={t('save')} disabled={isSubmitting} />
                        </Form>
                    )}
                </Formik>
            </ModalBody>
        </Modal>
    );
}

ReminderModal.propTypes = {
    /**string in format hh:mm */
    notify: PropTypes.string.isRequired
}

export default withDirection(ReminderModal);
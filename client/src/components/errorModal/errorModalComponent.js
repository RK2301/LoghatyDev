import React from 'react';
import { Modal, ModalBody, ModalHeader, Container, Row, Col } from 'reactstrap';
import { FaExclamationTriangle } from 'react-icons/fa'
import { useTranslation } from 'react-i18next';
import Feedback from '../feedback/Feedback';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';



/**
 * Error Modal to show delete message for differnet operations, such like delete teacher, student, file.....
 * and show feedback for the operation.
 * @param isOpen to show or hide the modal - required*
 * @param toggle function to toggle the modal - required*
 * @param _delete function to triggered when the delete button clicked - required*
 * @param action the delete type which should performed, like DELETE_FILE
 * @param reset_after_error function to reset the operation state after error message, and the user close the modal
 * @returns 
 */
function ErrorModal({ isOpen, toggle, _delete, action, reset_after_error, deleteMessage }) {

    const { t } = useTranslation();

    return (
        <Modal isOpen={isOpen}
            toggle={toggle}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            onExit={() => reset_after_error()}
            onClosed={() => reset_after_error()}
            size='md' scrollable centered  >

            <ModalHeader className='modal-header' toggle={toggle}>
                {t('delete')}
            </ModalHeader>
            <ModalBody >
                <Container fluid >
                    <Row className='justify-content-center align-items-cenetr'>
                        <Col xs={'auto'}>
                            <FaExclamationTriangle className='error-icon-modal' />
                        </Col>
                        <Col xs={12} md='' className='text-center'>
                            <Typography variant='subtitle1'>
                                {deleteMessage ? deleteMessage : t('deleteMessage')}
                            </Typography>
                        </Col>
                    </Row>
                </Container>
                <Container>
                    <Feedback btnText={t('delete')} toggle={toggle} onClickHandler={_delete} classNames={['dangerBtn']} />
                </Container>
            </ModalBody>
        </Modal>
    );

}

ErrorModal.propTypes = {
    /**string to display instead of default message */
    deleteMessage: PropTypes.string,
    /**function to be triggered when the delete button clicked */
    _delete: PropTypes.func.isRequired
}

export default ErrorModal;

import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ListLoading from '../loadingComponents/listLoading';
import Error from '../error/errorComponent';
import { useState } from 'react';
import { Col, Row } from 'reactstrap';
import { StyledFAB, StyledListItemButton, StyledToolTip } from '../materialUiOverride';
import { Link } from 'react-router-dom';
import { MdAdd } from 'react-icons/md';
import { Divider, IconButton, List, ListItem, ListItemText, Typography } from '@mui/material';
import Restricted from '../../permissions/Restricted';
import * as Permissions from '../../permissions/permissionTypes';
import { FaRegPaperPlane, FaTrash } from 'react-icons/fa';
import { formatDateTime, formatMessageSentTime } from '../services';
import ErrorModal from '../errorModal/errorModalComponent';

const MessagesList = ({ messages, isMobile, deleteMessage, reset_after_error }) => {

    const { t } = useTranslation();
    const [selectedItem, setSelectedItem] = useState(-1);
    const handleItemSelect = (i, subject) => {
        setSelectedItem(i);
    }
    const mobileProps = (id) => isMobile ? { component: Link, to: 'au' + `/${id}` } : {};

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);
    const [deleteFunction, setDeleteFunction] = useState({});

    const ListMessage = ({ }) => {
        return (
            <div className='h-100' >
                <Restricted to={Permissions.MANAGE_MESSAGES}>
                    <Row>
                        <Col xs='auto' className={isMobile ? "" : "ps-5 pe-5 pt-2"}>
                            {
                                isMobile ? (
                                    <StyledFAB
                                        aria-label='add'
                                        component={Link}
                                        to={`add`}
                                        onClick={() => { setSelectedItem(-1) }}
                                    >
                                        <FaRegPaperPlane className="basic-icon" size={'22px'} />
                                    </StyledFAB>

                                ) :
                                    (
                                        <StyledToolTip
                                            title={<Typography variant='caption'>{t('sendMessage')}</Typography>}>
                                            <IconButton
                                                color='primary'
                                                component={Link}
                                                to='add'
                                                onClick={() => { setSelectedItem(-1) }}>
                                                <FaRegPaperPlane size={20} />
                                            </IconButton>
                                        </StyledToolTip>
                                    )
                            }
                        </Col>
                    </Row>
                </Restricted>

                {messages.messages?.length === 0 ?
                    (
                        <div className='d-flex flex-cloumn justify-content-center align-items-center h-100'>
                            <Typography variant='h6'>
                                {t('NoMessageToShow')}
                            </Typography>
                        </div>
                    )
                    :
                    (
                        <div
                            className={isMobile ? "" : "ps-5 pe-5 pb-5 pt-md-1"}
                            style={isMobile ? {} : { maxHeight: '70vh', width: '100%', overflowY: 'scroll' }}>

                            <List >
                                {messages.messages?.map((message, i) => (
                                    <>
                                        <ListItem
                                            key={message.message_id}
                                            // {...mobileProps(message.message_id)}
                                            disablePadding
                                            className={isMobile ? "pe-2" : ""}
                                        >
                                            <StyledListItemButton
                                                component={Link}
                                                to={`au/${message.message_id}`}
                                                selected={selectedItem === i}
                                                onClick={() => handleItemSelect(i, message)}
                                            >
                                                <ListItemText
                                                    primary={
                                                        <div>
                                                            {message.firstname + ' ' + message.lastname}
                                                            <Typography variant='caption' className='m-1'>
                                                                {formatMessageSentTime(message.sent_time)}
                                                            </Typography>
                                                        </div>
                                                    }
                                                    secondary={message.message_title}
                                                />
                                            </StyledListItemButton>

                                            <Restricted to={Permissions.MANAGE_MESSAGES}>
                                                <StyledToolTip title={t('delete')}>
                                                    <IconButton color='error' edge='end'
                                                        onClick={() => {
                                                            toggle();
                                                            setDeleteFunction({ delete: () => deleteMessage(message.message_id) })
                                                        }}
                                                        sx={{
                                                            '&:after': {
                                                                content: '""',
                                                                position: 'absolute',
                                                                height: '100%',
                                                                display: 'block',
                                                                left: 0,
                                                                width: '1px',
                                                                bgcolor: 'divider',
                                                            },
                                                        }}>
                                                        <FaTrash size={17} color='black' />
                                                    </IconButton>
                                                </StyledToolTip>
                                            </Restricted>
                                        </ListItem>
                                        {i !== messages.messages.length - 1 ? <Divider variant='middle' component={'li'} /> : <></>}
                                    </>
                                ))}
                                <ErrorModal
                                    isOpen={isOpen}
                                    toggle={toggle}
                                    _delete={deleteFunction?.delete}
                                    reset_after_error={reset_after_error}
                                    deleteMessage={t('deleteAMessage')} />
                            </List>
                        </div>)}

            </div>)
    }

    return (
        <>
            {
                messages.isLoading ? <ListLoading /> :
                    messages.error ? <Error /> :
                        <ListMessage />
            }
        </>
    )
}

MessagesList.propTypes = {
    /**boolean indicate whenever the user use mobile or desktop */
    isMobile: PropTypes.bool.isRequired
}

export default MessagesList;
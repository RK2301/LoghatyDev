import { Divider, IconButton, List, ListItem, ListItemButton, ListItemText, TablePagination, Typography } from "@mui/material";
import React, { useMemo, useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import { getMessages } from "../../../redux/ActionCreators";
import TableLoading from "../../loadingComponents/TableLoading";
import Error from "../../error/errorComponent";
import { Link } from "react-router-dom";
import { formatMessageSentTime } from "../../services";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";

const mapStateToProps = (state) => ({
    messages: state.messages
});

const mapDispacthToProps = (dispacth) => ({
    getMessages: (limited) => dispacth(getMessages(limited)),
});

const RecentMessages = ({ messages, getMessages }) => {

    useEffect(() => getMessages(true), []);
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const handleChangePage = (event, newPage) => setPage(newPage)
    const rowsPerPage = 5;


    const messagesToShow = useMemo(() => {
        return messages.messages.slice(
            page * rowsPerPage,
            page * rowsPerPage + rowsPerPage,
        )
    }, [messages.messages, page])

    const MessageList = ({ }) => {

        if (messages.messages?.length === 0)
            return (
                <div className="h-100 d-flex flex-column justify-content-center align-items-center">
                    <Typography variant='h6'>
                        {t('NoMessageToShow')}
                    </Typography>
                </div>
            )

        return (
            <List
                style={{ height: '30vh', overflowY: 'scroll' }}
                disablePadding
            >
                {
                    messagesToShow.map((message, i) => (
                        <>
                            <ListItem
                                key={message.message_id}
                                disablePadding
                            >
                                <ListItemButton
                                    component={Link}
                                    to={`/messages/au/${message.message_id}`}
                                    className='ps-3 p-0'
                                >
                                    <ListItemText
                                        secondary={
                                            <div>
                                                {message.firstname + ' ' + message.lastname}
                                                <Typography variant='caption' className='m-1'>
                                                    {formatMessageSentTime(message.sent_time)}
                                                </Typography>
                                            </div>
                                        }
                                        primary={
                                            <Typography variant='subtitle1'>
                                                {message.message_title.length > 30 ? message.message_title.slice(0, 31) + ' ...' : message.message_title}
                                            </Typography>
                                        }
                                    />
                                </ListItemButton>
                            </ListItem>
                            {i !== messages.messages.length - 1 ? <Divider variant='fullWidth' component={'li'} /> : <></>}
                        </>
                    ))
                }
                {/* <Row className="p-0 g-2">

                    <Col xs='auto'>
                        <IconButton color='primary'>
                            <FaArrowLeft size={15} />
                        </IconButton>
                    </Col>

                    <Col xs='auto'>
                        <IconButton color='primary'>
                            <FaArrowRight size={15} />
                        </IconButton>
                    </Col>

                    <Col xs='auto'>
                        <Typography variant='caption'>
                        1 of 2
                        </Typography>
                    </Col>
                </Row> */}

                <TablePagination
                    component={'div'}
                    padding='none'
                    size='small'
                    className="d-flex justify-content-end align-items-center p-0 m-0"
                    count={messages.messages.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[]}
                />
            </List>
        )
    }

    return (
        <Card className="mycard mt-2 mt-md-0 h-100">
            <CardHeader>
                {t('recentMessages')}
            </CardHeader>

            <CardBody className="p-1">
                {messages.isLoading ? <TableLoading heigh={'30vh'} /> :
                    messages.error ? <Error refresh={() => getMessages(true)} /> :
                        <MessageList />}
            </CardBody>
        </Card>
    )
}

export default connect(mapStateToProps, mapDispacthToProps)(RecentMessages);
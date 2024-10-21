import { Divider, Grid, Grow, useMediaQuery, useTheme } from "@mui/material";
import React from "react";
import { connect } from "react-redux";
import { Route, Routes } from "react-router-dom";
import { Container } from "reactstrap";
import { addNewMessage, deleteMessage, getAllUsers, getMessageUsers, getMessages, reset_after_error, updateMessage } from "../../redux/ActionCreators";
import { useEffect } from "react";
import MessagesList from "./MessagesList";
import MessageForm from "./MessageForm";

const mapStateToProps = (state) => ({
    messages: state.messages,
});

const mapDispacthToProps = (dispatch) => ({
    getMessages: (limited) => dispatch(getMessages(limited)),
    addNewMessage: (message, resetForm) => dispatch(addNewMessage(message, resetForm)),
    getMessageUsers: (message_id) => dispatch(getMessageUsers(message_id)),
    updateMessage: (message, setSubmitting) => dispatch(updateMessage(message, setSubmitting)),
    deleteMessage: (message_id) => dispatch(deleteMessage(message_id)),
    reset_after_error: () => dispatch(reset_after_error())
})

const MessageContainer = ({ getMessages, messages, addNewMessage, getMessageUsers,
     updateMessage, deleteMessage, reset_after_error, user }) => {

    useEffect(() => getMessages(), []);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    // alert( JSON.stringify(allUsers) )

    const MessageRoutes = () => (
        <Routes>
                <Route path="/au/:id" element={<MessageForm mode={user.role === 'm' ? 'u' : 'v'} messages={messages.messages}
                    addNewMessage={addNewMessage} getMessageUsers={getMessageUsers} updateMessage={updateMessage} />} />
            <Route path="/*" element={isMobile ? <MessagesList messages={messages} reset_after_error={reset_after_error} deleteMessage={deleteMessage} isMobile={isMobile} /> : <></>} />
        </Routes>
    )
    return (
        <>
            {
                isMobile ?
                    (
                        <Container>
                            <MessageRoutes />
                        </Container>
                    ) :
                    (
                        <Grid container >
                            <Grid item md={5} >
                                <MessagesList messages={messages} isMobile={isMobile} reset_after_error={reset_after_error} deleteMessage={deleteMessage} />
                            </Grid>
                            <Divider orientation='vertical' variant='middle' flexItem color='black' />
                            <Grid item md={6} className="p-2">
                                <MessageRoutes />
                            </Grid>
                        </Grid>
                    )
            }
        </>
    );
}

export default connect(mapStateToProps, mapDispacthToProps)(MessageContainer);
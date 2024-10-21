import React, { Component } from "react";
import {
    Container, Modal, ModalBody, ModalHeader
    , Row, Col
} from "reactstrap";
import * as ActionTypes from '../../redux/ActionTypes';
import { useTranslation } from "react-i18next";
import FilesTabel from "./FilesTabel";
import Notes from "./NotesComponent";
import styles from './report.module.css';
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import SwipeableViews from "react-swipeable-views";
import { StyledTab, StyledTabList } from "../materialUiOverride";
import { connect } from "react-redux";
import {
    getFilesForReport, uploadFile, deleteFile, getFile, getNotes
    , deleteNote, addNote, updateNote, reset_after_error, getCourses
} from '../../redux/ActionCreators';
import StudentCourses from "./StudentCourses";
import withDirection from "react-with-direction";


const mapStateToProps = (state) => {
    return {
        files: state.filesReport,
        notes: state.notes,
        courses: state.courses
    }
};

const mapDispacthToProps = (dispatch) => ({
    getFilesReport: (id, token) => dispatch(getFilesForReport(id, token)),
    uploadFile: (file, idUser, setSubmitting, restForm) => dispatch(uploadFile(file, idUser, setSubmitting, restForm)),
    reset_after_error: () => dispatch(reset_after_error()),
    deleteFile: (fileId, fileName, userID) => dispatch(deleteFile(fileId, fileName, userID)),
    getFile: (fileID, fileName, userID, token) => dispatch(getFile(fileID, fileName, userID, token)),
    getNotes: (userID, token) => dispatch(getNotes(userID, token)),
    deleteNote: (noteID, token) => dispatch(deleteNote(noteID, token)),
    addNote: (target_user_id, manager_id, note_title, note_text, token, setSubmitting) => dispatch(addNote(target_user_id, manager_id, note_title, note_text, token, setSubmitting)),
    updateNote: (note, token, setSubmitting) => dispatch(updateNote(note, token, setSubmitting)),
    getCourses: (student_id) => dispatch(getCourses(student_id)),
});

class Report extends Component {

    constructor(props) {
        super(props);
        this.state = {
            tabID: "1"
        }
        this.changeTab = this.changeTab.bind(this);
        this.resetNavState = this.resetNavState.bind(this);
    }

    changeTab(tabID) {
        this.setState({
            tabID: tabID
        })
    }

    resetNavState() {
        this.setState({ tabID: '1' });
    }

    ModalContent = () => {
        const { t } = useTranslation();
        return (
            <Modal isOpen={this.props.isOpen} toggle={this.props.toggle}
                modalTransition={{ timeout: 500 }} backdropTransition={{ timeout: 700 }}
                centered scrollable backdrop='static' size="lg" onClosed={this.resetNavState} >
                <ModalHeader toggle={this.props.toggle} className="modal-header" >
                    {this.props.action === ActionTypes.TEACHER_REPORT ? t('teacherReport') : t('studentReport')}
                </ModalHeader>
                <ModalBody className="p-md-2 p-0" dir={this.props.direction}>

                    <TabContext value={this.state.tabID} >
                        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                            <StyledTabList
                                onChange={(event, newVal) => {
                                    this.changeTab(newVal);
                                    if (newVal === '2') {
                                        // this.props.getNotes(this.props.targetUserID, this.props.token);
                                    }
                                }}
                                aria-label="report label"
                                variant='fullWidth'>
                                <StyledTab label={t('files')} value="1" />
                                <StyledTab label={t('notes')} value="2" />
                                {this.props.isStudent ? <StyledTab label={t('courses')} value='3' /> : function(){}()}
                            </StyledTabList>
                        </Box>

                        <TabPanel sx={{ p: 1 }} value="1" >
                            <Container fluid className="m-0">
                                <Row className="justify-content-center">
                                    <Col xs={12}>
                                        <FilesTabel files={this.props.files} reset_after_error={this.props.reset_after_error}
                                            refreshFiles={this.props.getFilesReport} token={this.props.token} uploadFile={this.props.uploadFile}
                                            userId={this.props.userId} deleteFile={this.props.deleteFile} getFile={this.props.getFile} />
                                    </Col>
                                    <Col xs={'auto'} className="mt-2 p-0">
                                        <p className="warningMsg"> {t('teacherWarningMsg')} </p>
                                    </Col>
                                </Row>
                            </Container>
                        </TabPanel>

                        <TabPanel sx={{ p: 1 }} value="2">
                            <Container fluid>
                                <Row className="justify-content-center">
                                    <Col xs={12}>
                                        <Notes notes={this.props.notes} getNotes={this.props.getNotes} operation={this.props.operation} deleteNote={this.props.deleteNote}
                                            token={this.props.token} reset_state_operation={this.props.reset_state_operation} reset_after_error={this.props.reset_after_error}
                                            addNote={this.props.addNote} target_user_id={this.props.targetUserID} manager_id={this.props.userId}
                                            updateNote={this.props.updateNote} />
                                    </Col>
                                    <Col xs={'auto'} className="mt-1 p-0">
                                        <p className="warningMsg"> {t('teacherWarningMsg')}  </p>
                                    </Col>
                                </Row>
                            </Container>
                        </TabPanel>

                        {this.props.isStudent ?
                            (
                            <TabPanel sx={{ p: 1 }} value="3">
                                <StudentCourses courses={this.props.courses} getCourses={this.props.getCourses} student_id={this.props.targetUserID} />
                            </TabPanel>
                            ) 
                            : (<></>)
                        }

                    </TabContext>
                </ModalBody>
            </Modal>
        );
    }

    render() {
        return (
            <this.ModalContent />
        )
    }

}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(Report));


{/* <Nav tabs justified className="mb-3 m-auto" >
                        <NavItem className={styles.reportLink} >
                            <NavLink className={' ' + this.state.tabID === 1 ? 'active' : ''} style={{ border: 'none', color: 'black' }}
                                onClick={() => this.changeTab(1)}>
                                {t('files')}
                            </NavLink>
                        </NavItem>
                        <NavItem className={styles.reportLink}>
                            <NavLink className={' ' + this.state.tabID === 2 ? 'active' : ''} style={{ border: 'none', color: 'black' }}
                                onClick={() => { this.changeTab(2); this.props.getNotes(this.props.targetUserID, this.props.token); }}>
                                {t('notes')}
                            </NavLink>
                        </NavItem>
                    </Nav> */}

{/* <TabContent activeTab={this.state.tabID} >
                        <TabPane tabId={1}>
                            <Container fluid>
                                <Row className="justify-content-center">
                                    <Col xs={12}>
                                        <FilesTabel files={this.props.files}
                                            refreshFiles={this.props.refreshFiles} token={this.props.token}
                                            operation={this.props.operation} uploadFile={this.props.uploadFile}
                                            userId={this.props.userId} reset_state_operation={this.props.reset_state_operation}
                                            deleteFile={this.props.deleteFile} getFile={this.props.getFile} />
                                    </Col>
                                    <Col xs={'auto'} className="mt-1 p-0">
                                        <p className="warningMsg"> {t('teacherWarningMsg')} </p>
                                    </Col>
                                </Row>
                            </Container>
                        </TabPane>
                        <TabPane tabId={2}>
                            <Container fluid>
                                <Row className="justify-content-center">
                                    <Col xs={12}>
                                        <Notes notes={this.props.notes} operation={this.props.operation} deleteNote={this.props.deleteNote}
                                            token={this.props.token} reset_state_operation={this.props.reset_state_operation}
                                            addNote={this.props.addNote} target_user_id={this.props.targetUserID} manager_id={this.props.userId}
                                            updateNote={this.props.updateNote} />
                                    </Col>
                                    <Col xs={'auto'} className="mt-1 p-0">
                                        <p className="warningMsg"> {t('teacherWarningMsg')}  </p>
                                    </Col>
                                </Row>
                            </Container>
                        </TabPane>
                    </TabContent> */}
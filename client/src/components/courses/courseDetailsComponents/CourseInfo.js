import { Badge, Divider, IconButton, List, ListItem, SpeedDialIcon, Switch, useMediaQuery } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardHeader, Col, Collapse, Container, Row } from "reactstrap";
import styles from '../coursesStyle.module.css';
import { FaArrowDown, FaChalkboardTeacher, FaClock, FaLanguage, FaRegSun, FaUserAlt, FaUsers } from "react-icons/fa";
import Restricted from "../../../permissions/Restricted";
import * as PermissionsTypes from '../../../permissions/permissionTypes';
import { StyledFAB, StyledFeedbackButton, StyledSpeedDial, StyledSpeedDialAction, mobileSpeedDial } from "../../materialUiOverride";
import { Link } from "react-router-dom";
import PropTypes from 'prop-types';
import { formatTheDate } from "../../services";
import MeetingsModal from "./MeetingsModal";
import GetChips from "../GetChips";


const CourseInfo = ({ course, toggleLessonModal, user }) => {

    const { t, i18n } = useTranslation();
    const [state, setState] = useState({
        isOpen: false,
        notify: false
    });
    const toggleCollapse = () => {
        setState({ ...state, isOpen: !state.isOpen })
    }
    const toggleNotify = (e) => {
        setState({ ...state, notify: !state.notify })
    }

    const [isMeetingsOpen, setMeetingsOpen] = useState(false);
    const toggle = () => setMeetingsOpen(!isMeetingsOpen);

    const actions = [
        {
            icon: <FaChalkboardTeacher className='basic-icon' />,
            name: t('addLesson'),
            onClick: () => toggleLessonModal()
        },
        {
            icon: <Link color='black' to='students'><FaUsers className='basic-icon' /></Link>,
            name: t('students'),
            to: 'students',
            onClick: () => { }
        },
        {
            icon: <FaClock className='basic-icon' />,
            name: t('meetings'),
            onClick: () => toggle()
        }
    ]

    const isMobile = useMediaQuery(theme => theme.breakpoints.only('xs'));
    return (
        <>
            <Card className={styles.mycard + ' mb-4 mt-2'}>
                <CardHeader className={styles.mycardHeader + ' d-md-none'} >
                    <Container fluid>
                        <Row className="justify-content-between">
                            <Col xs={'auto'} className="d-flex flex-column justify-content-center">
                                {t('courseInfo')}
                            </Col>
                            <Col xs={'auto'}>
                                <IconButton
                                    onClick={toggleCollapse}>
                                    <FaArrowDown size={17} color="black" />
                                </IconButton>
                            </Col>
                        </Row>
                    </Container>
                </CardHeader>

                <Collapse isOpen={state.isOpen} className="d-md-block">
                    <List>
                        <ListItem className="d-flex">
                            <strong> {t('teacherName') + ': ' + course.firstname + ' ' + course.lastname}
                            </strong>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem>
                            <strong> {t('startDate') + ': ' + formatTheDate(course.start_date)}
                            </strong>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem sx={{paddingRight: 0}}>
                            <Row className="justify-content-between p-0 w-100">
                                <Col xs='auto'>
                                    <strong> {t('endDate') + ': '}
                                        {formatTheDate(course.end_date) || ' -'}
                                    </strong>
                                </Col>

                                <Col xs='auto'>
                                    <GetChips course={course} />
                                </Col>
                            </Row>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem className={styles.myListItem}>
                            <strong>
                                {t('leasonNum') + ': '}
                                {course.lesson_num || '-'}
                            </strong>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem className={styles.myListItem}>
                            <strong> {t('courseType') + ': '}
                                {course.language_id ? course.language_name == 'en' ? 'English' : course.language_name == 'ar' ? 'عربي' : 'עברית'
                                    : course[i18n.language]}
                            </strong>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem className={styles.myListItem}>
                            <Row className="justify-content-between w-100 p-0">
                                <Col xs='auto'>
                                    <strong> {t('courseMethod') + ': '}
                                        {course.course_type === 'g' ? t('group') : t('individual')}
                                    </strong>
                                </Col>

                                <Col xs='auto'>
                                    {course.course_type === 'g' ? <FaUsers className="basic-icon" /> : <FaUserAlt className="basic-con" />}
                                </Col>
                            </Row>
                        </ListItem>

                        <Divider component={'li'} />

                        <ListItem className={styles.myListItem + ' d-flex align-items-center'}>
                            <strong>
                                {t('notification') + ' '}
                            </strong>
                            <Switch checked={state.notify} onChange={() => { toggleNotify(); }}
                                color='success' />
                        </ListItem>
                    </List>
                </Collapse>
            </Card>

            <Restricted to={PermissionsTypes.COURSE_MANAGMENT}>
                <StyledSpeedDial
                    ariaLabel="lessons actions"
                    icon={<SpeedDialIcon icon={<FaRegSun size={20} />} />}
                    sx={isMobile ? mobileSpeedDial : {}}
                    direction={isMobile ? 'up' : 'right'}
                >
                    {actions.map(action => (
                        <StyledSpeedDialAction
                            key={action.name}
                            tooltipTitle={action.name}
                            icon={action.icon}
                            tooltipOpen={isMobile}
                            onClick={action.onClick}
                        />
                    ))}

                </StyledSpeedDial>
            </Restricted>

            <Restricted to={PermissionsTypes.PRACTICE_LANGUAGE}>
                <Row className="mt-1 d-none d-md-block">
                    <Col xs={12}>

                        <StyledFeedbackButton startIcon={<FaClock />} onClick={toggle}>
                            {t('meetings')}
                        </StyledFeedbackButton>
                        {/* <button className={"secondBtn w-100 " + styles['lang_link']} >
                                <Link to={`/language/${course.course_id}/${course.language_name}/${user.username}`} className={styles['lang_btn']}
                                    onClick={() => { }}>
                                    <Row className="justify-content-center">
                                        <Col xs={'auto'}>
                                            <Row className="justift-content-center">
                                                <Col xs={'auto'}>
                                                    <FaLanguage size={30} />
                                                </Col>
                                                <Col xs={'auto'}>
                                                    {t('langPractice')}
                                                </Col>
                                            </Row>
                                        </Col>
                                    </Row>
                                </Link>
                            </button> */}
                    </Col>
                </Row>
                <div className="d-block d-md-none">
                    <StyledFAB
                        aria-label="meetings"
                        onClick={toggle}
                    // component={Link}
                    // to={`/language/${course.course_id}/${course.language_name}/${user.username}`}
                    >
                        <FaClock size={30} />
                    </StyledFAB>
                </div>
            </Restricted>

            {/* <Restricted to={PermissionsTypes.COURSE_MANAGMENT}>
                <LessonModal
                 isOpen={addUpdateLessonOpen} toggle={toggleLessonModal} reset_after_error={reset_after_error}
                 addLesson={addLesson} updateLessonFunction={updateLesson} courseID={course.course_id}
                 updateLesson={lessonToUpdate} />
            </Restricted> */}
            <MeetingsModal isOpen={isMeetingsOpen} toggle={toggle} course={course} course_meetings={course.course_meetings} />
        </>
    );
}

CourseInfo.propTypes = {
    /**object contain all course details like: name, start_date.... */
    course: PropTypes.object.isRequired,
    /**function to toggle lesson modal to add new lesson */
    toggleLessonModal: PropTypes.func.isRequired,
    /**object contain the curent user data like: id, name.... */
    user: PropTypes.object.isRequired
}

export default CourseInfo;

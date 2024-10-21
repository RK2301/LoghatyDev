import { Divider, List, ListItem, Typography } from "@mui/material";
import React from "react";
import { useTranslation } from "react-i18next";
import { Col, Modal, ModalBody, Row } from "reactstrap";
import withDirection, { DIRECTIONS } from 'react-with-direction';
import { GetTimeFromDateAsHoursAndMin } from "../../services";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import moment from "moment";
import { StyledFeedbackButton } from "../../materialUiOverride";

const MeetingsModal = ({isOpen, toggle, course_meetings = [], course, direction}) => {

    const { t } = useTranslation();
    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={toggle}
            centered scrollable size={'md'}
            unmountOnClose
            dir={direction}>

            <ModalBody>
                <Row>
                    <Col xs='auto'>
                        <Typography variant='subtitle2'>
                            {t('courseMeetings') + ' ' + course.course_name}
                        </Typography>
                    </Col>
                </Row>

                <Row>
                    <Col xs={12}>
                        <List>
                            {
                                course_meetings.map((meeting, i) => {
                                    let meetingEndTime = moment().day(meeting.day_id - 1).hour(parseInt(meeting.start_time.split(':')[0]))
                                        .minutes(meeting.start_time.split(':')[1]).clone().add(course.meet_duration, 'h').toDate();
                                        meetingEndTime =  GetTimeFromDateAsHoursAndMin(meetingEndTime);
                                    return (
                                        <>
                                            <ListItem>
                                                <Row className="justify-content-around w-100">
                                                    <Col xs={4}>
                                                        { t(meeting.day) }
                                                    </Col>

                                                    <Col xs={'auto'}>

                                                        <Row>
                                                            <Col xs='auto'>
                                                                { GetTimeFromDateAsHoursAndMin( new Date(`2023-10-10 ${meeting.start_time}`)) }
                                                            </Col>

                                                            <Col xs='auto'>
                                                                {
                                                                    direction === DIRECTIONS.LTR ? <FaArrowRight /> : <FaArrowLeft />
                                                                }
                                                            </Col>

                                                            <Col xs='auto'>
                                                                { meetingEndTime }
                                                            </Col>
                                                        </Row>

                                                    </Col>
                                                </Row>
                                            </ListItem>

                                            {
                                                i === course_meetings.length - 1 ? <></> : <Divider variant='middle' component={'li'} />
                                            }
                                        </>
                                    )
                                })
                            }
                        </List>
                    </Col>
                </Row>

                <Row className="justify-content-end">
                    <Col xs='auto'>
                        <StyledFeedbackButton onClick={toggle}>
                            { t('close') }
                        </StyledFeedbackButton>
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    );
};

export default withDirection(MeetingsModal);
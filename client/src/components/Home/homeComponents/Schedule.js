import React, { useState } from "react";
import { getCourses } from "../../../redux/ActionCreators";
import { connect } from "react-redux";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader } from "reactstrap";
import { Autocomplete, TextField, Typography, useMediaQuery, useTheme } from "@mui/material";
import TableLoading from "../../loadingComponents/TableLoading";
import Error from "../../error/errorComponent";
import moment from "moment";
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useMemo } from "react";
import { formatTheDate } from "../../services";
import FullCalendar from "@fullcalendar/react";
import timeGridPlugin from '@fullcalendar/timegrid';
import withDirection, { DIRECTIONS } from "react-with-direction";
import styled from "@emotion/styled";
import { colors } from "../../colors";
import arLocale from '@fullcalendar/core/locales/ar-dz';
import heLocale from '@fullcalendar/core/locales/he';
import { Row, Col } from "reactstrap";
import Restricted from "../../../permissions/Restricted";
import * as Permissions from '../../../permissions/permissionTypes';


const mapStateToProps = (state) => ({
    courses: state.courses
});

const mapDispacthToProps = (dispacth) => ({
    getCourses: () => dispacth(getCourses()),
});

const Schedule = ({ courses, getCourses, direction }) => {

    useEffect(() => getCourses(), []);
    const { t, i18n } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    /**state related to Autocomplete */
    const [selectedTeacher, setSelectedTeacher] = useState( null )
    const teachers = useMemo(() => {

        const all_teachers = []
        courses.courses.forEach(course => {
            const isExists = all_teachers.findIndex(teacher => teacher.id === course.id)
            if (isExists == -1)
                all_teachers.push({
                    id: course.id,
                    full_name: course.firstname + ' ' + course.lastname
                })
        })
        return all_teachers
    }, [courses.courses])


    const CalendarSchedule = () => {
        //first map the courses array to match react-big-calendar requested format
        const events = useMemo(() => {
            const meetings = [];
            const firstDayOfWeek = moment().day(0);
            const lastDayOfWeek = moment().day(6);

            courses.courses.map((course, index) => {
                const cpyCourse = { ...course };
                cpyCourse.color = colors[index % colors.length];
                return cpyCourse;
            })
            .filter((course) => {
                //filter based on selected teacher, if no teacher selected then return all courses
                return course.id === selectedTeacher?.id || !selectedTeacher
            })
            .map(course => {                
                const start_course = moment(formatTheDate(course.start_date));
                const end_course = moment(formatTheDate(course.end_date));

                if ((firstDayOfWeek <= start_course && start_course <= lastDayOfWeek) ||
                    (firstDayOfWeek <= end_course && end_course <= lastDayOfWeek) ||
                    (start_course <= firstDayOfWeek && lastDayOfWeek <= end_course)) {
                    //now add course meeting to the schedule
                    course.course_meetings.map(meeting => {
                        const meetingStartTime = moment().day(meeting.day_id - 1).hour(parseInt(meeting.start_time.split(':')[0]))
                            .minutes(meeting.start_time.split(':')[1]);

                        //now check if the meeting date is between start and end date of the course
                        if (start_course <= meetingStartTime && meetingStartTime <= end_course) {
                            //add the meeting to the meetings array
                            meetings.push({
                                groupId: course.course_id,
                                title: course.course_name,
                                start: meetingStartTime.toDate(),
                                end: meetingStartTime.clone().add(course.meet_duration, 'h').toDate(),
                                borderColor: 'transparent',
                                backgroundColor: course.color,
                                textColor: 'black',
                                color: 'transparent',
                                classNames: ['custom-event']
                            })
                        }
                    })
                }
            });
            return meetings;
        }, [courses.courses, selectedTeacher]);

        //style the calendar with wrapper component//
        const StyleWrapper = styled.div`
        .fc-dayGridTimeGrid-view .fc-dayGrid-time {
            border-color: black;
          }
          .fc-timeGrid-time.fc-timeGrid-slot {
            border-bottom: red;
          }
          .fc-scroller.fc-time-grid-container {
            margin-top: 200px;
            background:red;
          }
          .fc-header-toolbar {
            padding-right: 5px;
            padding-left: 20px;
          }
          .fc-header-toolbar .fc-button {
            background: transparent;
            color: black;
            padding: 5px;
          }

          .fc .fc-content .fc-event-container .fc-event{
            background: red !important,
            border-color: green !important,
            color: yellow !important
          }
          .custom-event{
            border: transparent;
            font-size: 16px;
          }
          
        `

        return (
            <div style={{ height: isMobile ? '50vh' : '60vh', overflowX: 'scroll' }}>
                <StyleWrapper className="h-100">
                    <FullCalendar
                        plugins={[timeGridPlugin]}
                        locale={i18n.language === 'ar' ? arLocale : i18n.language === 'he' ? heLocale : null}
                        initialView={!isMobile ? 'timeGridWeek' : 'timeGridDay'}
                        headerToolbar={{
                            left: 'prev,next',
                            center: '',
                            right: 'timeGridWeek,timeGridDay',
                        }}
                        direction={direction === DIRECTIONS.LTR ? 'ltr' : 'rtl'}
                        validRange={{ start: moment().day(0).toDate(), end: moment().day(6).toDate() }}
                        height={'100%'}
                        events={events}
                        allDaySlot={false}
                        slotEventOverlap={true}
                        slotMinTime={{ hour: 7 }}
                        slotMaxTime={{ hour: 21 }}
                        expandRows={true}
                        handleWindowResize
                        nowIndicator
                    />
                </StyleWrapper>
            </div>
        )
    }

    return (
        <Card className="mycard">
            <CardHeader>
                <Row className={'justify-content-between'}>
                    <Col xs={5} md='auto'>
                        <Typography variant='subtitle1'>
                            {t('schedule')}
                        </Typography>
                    </Col>
                    <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                        <Col xs={6} md={3}>
                            <Autocomplete
                                value={selectedTeacher}
                                onChange={(event, newVal) => {setSelectedTeacher(newVal); console.log(newVal);
                                }}
                                options={teachers}
                                getOptionLabel={(option) => option?.full_name || ''}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size='small'
                                        variant="standard"
                                        placeholder={t('teacher')}
                                        inputProps={{
                                            ...params.inputProps,
                                            autoComplete: 'new-password', // disable autocomplete and autofill
                                        }}
                                    />
                                )}
                            />
                        </Col>
                    </Restricted>
                </Row>
            </CardHeader>

            <CardBody className="p-1">
                {courses.isLoading ? (<TableLoading />) :
                    courses.error ? (<Error refresh={() => getCourses()} />) :
                        <CalendarSchedule />}
            </CardBody>
        </Card>
    )
}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(Schedule));
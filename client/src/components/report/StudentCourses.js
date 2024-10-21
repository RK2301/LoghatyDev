import { Button, Typography } from "@mui/material";
import React from "react";
import { Link } from "react-router-dom";
import { Card, Col, Container, Row } from "reactstrap";
import { formatTheDate } from "../services";
import { FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import GetChips from "../courses/GetChips";
import { useEffect } from "react";
import StudentCourseLoading from "../loadingComponents/StudentCourseLoading";
import Error from "../error/errorComponent";
import PropTypes from 'prop-types';

const StudentCourses = ({ courses, getCourses, student_id }) => {

    const { t, i18n } = useTranslation();
    useEffect(() => getCourses(student_id), []);

    if (courses.isLoading) 
        return (
            <StudentCourseLoading />
        )
    else if (courses.error) 
        return (
            <Error refresh={() => getCourses(student_id)} />
        )
    

    const studentCourses = courses.courses.map(course => (
        <Col xs={12} md={6} className="mt-2">
            <Card className="mycard p-2">
                <Row>
                    <Col xs='auto'>
                        <Typography variant='h5'>
                            {course.course_name}
                        </Typography>
                    </Col>
                </Row>

                <Row className="justify-content-between mt-3">
                    <Col xs='auto'>
                        <Typography variant='body1'>
                            {t('from') + ': ' + formatTheDate(course.start_date)}
                        </Typography>
                    </Col>

                    <Col xs='auto'>
                        <Typography variant='body1'>
                            {t('to') + ': ' + formatTheDate(course.end_date)}
                        </Typography>
                    </Col>
                </Row>

                <Row className="justify-content-between">
                    <Col xs='auto'>
                        <Typography variant='body1'>
                            {course.firstname + ' ' + course.lastname}
                        </Typography>
                    </Col>

                    <Col xs='auto'>
                        <Typography variant='body1'>
                            {course.language_id ? course.language_name == 'en' ? 'English' : course.language_name == 'ar' ? 'عربي' : 'עברית'
                                : course[i18n.language]}
                        </Typography>
                    </Col>
                </Row>

                <Row className="justify-content-between mt-1">
                    <Col xs='auto'>
                        <GetChips course={course} />
                    </Col>
                    <Col xs='auto'>
                        <Button variant='text' color='primary' endIcon={<FaArrowRight />} component={Link} to={`/courseDetails/${course.course_id}`}>
                            {t('moveToCourse')}
                        </Button>
                    </Col>
                </Row>

            </Card>
        </Col>
    ))

    return (
        <Container fluid className="mt-2">
            <Row>
                {studentCourses}
            </Row>
        </Container>
    )
}

StudentCourses.propTypes = {
    /**id of student to display courses that the student enrolled */
    student_id: PropTypes.string.isRequired
}

export default StudentCourses;
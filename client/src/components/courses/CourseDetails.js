import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Col, Container, Row } from "reactstrap";
import { connect } from "react-redux";
import { Route, Routes, useParams } from "react-router-dom";
import { addLesson, addUnit, deleteStudyUnitFile, getCourseDetails,
     getHomeworkFile, getHwSubmitions, getUnitFile, reset_after_error, submit_homework, 
     updateLesson, updateSubmitHomework, updateUnit, deleteHomeworkFile, giveFeedback, deleteHomeworkSubmittion, deleteUnit, deleteLesson } from "../../redux/ActionCreators";
import Error from "../error/errorComponent";
import CourseDetailsContent from "./courseDetailsContent";
import HwSubmit from "./HwSubmit";
import LessonModal from "./courseDetailsComponents/LessonModal";
import CourseStudents from "./courseDetailsComponents/courseStudents";
import BackButton from "../backButton";
import { useEffect } from "react";
import CourseInfo from "./courseDetailsComponents/CourseInfo";
import HomeworkLoading from "../loadingComponents/HomeworkLoading";


const mapStateToProps = (state) => ({
    courses: state.courses.courses,
    courseDetail: state.courseDetail,
    submitionHw: state.submitionHw
});

const mapDispacthToProps = (dispacth) => ({
    getCourseDetails: (courseID, token) => dispacth(getCourseDetails(courseID, token)),
    getHwSubmitions: (courseID, hwID, token) => dispacth(getHwSubmitions(courseID, hwID, token)),
    reset_after_error: () => dispacth(reset_after_error()),
    addLesson: (lesson, setSubmitting) => dispacth(addLesson(lesson, setSubmitting)),
    updateLesson: (lesson, setSubmitting) => dispacth(updateLesson(lesson, setSubmitting)),
    addUnitAPI: (unit, course_id, setSubmitting) => dispacth(addUnit(unit, course_id, setSubmitting)),
    updateUnitAPI: (unit, course_id, setSubmitting) => dispacth(updateUnit(unit, course_id, setSubmitting)),
    getUnitFile: (course_id, lesson_id, unit_id, file_id) => dispacth(getUnitFile(course_id, lesson_id, unit_id, file_id)),
    deleteStudyUnitFile: (course_id, lesson_id, unit_id, file_id) => dispacth(deleteStudyUnitFile(course_id, lesson_id, unit_id, file_id)),
    submit_homework: (submit, course_id, hw_id, setSubmitting) => dispacth( submit_homework(submit, course_id, hw_id, setSubmitting) ),
    updateSubmitHomework: (submit, course_id, hw_id, setSubmitting) => dispacth( updateSubmitHomework(submit, course_id, hw_id, setSubmitting) ),
    getHomeworkFile: (course_id, hw_id, file_id) => dispacth( getHomeworkFile(course_id, hw_id, file_id) ),
    deleteHomeworkFile: (course_id, hw_id, file_id) => dispacth( deleteHomeworkFile(course_id, hw_id, file_id) ),
    giveFeedback: (student_id, hw_id, feedbackData, setSubmitting) => dispacth( giveFeedback(student_id, hw_id, feedbackData, setSubmitting) ),
    deleteSubmittion: (course_id, hw_id, ) => dispacth( deleteHomeworkSubmittion(course_id, hw_id) ),
    deleteUnit: (course_id, unit_id) => dispacth( deleteUnit(course_id, unit_id) ),
    deleteLesson: (lesson_id, course_id) => dispacth( deleteLesson(lesson_id, course_id) )
});

const CourseDetails = ({ courses, courseDetail, getCourseDetails, token, user, submitionHw,
    getHwSubmitions, reset_after_error, addLesson, updateLesson, addUnitAPI, updateUnitAPI, getUnitFile,
    deleteStudyUnitFile, submit_homework, updateSubmitHomework, getHomeworkFile,
     deleteHomeworkFile, giveFeedback, deleteSubmittion, deleteUnit, deleteLesson }) => {

    const courseID = parseInt(useParams().id);
    const course = courses.filter(course => {
        return course.course_id === courseID
    })[0];

    useEffect(() => getCourseDetails(courseID, token), [])


    /**State to open lesson modal */
    const [addUpdateLessonOpen, setAddEditLessonOpen] = useState(false);
    const [lessonToUpdate, setLessonToUpdate] = useState( {} );
    const toggleLessonModal = (e, lessonToUpdate) => {
        setAddEditLessonOpen(!addUpdateLessonOpen);
        setLessonToUpdate(lessonToUpdate || {});
    }

    if (courseDetail.isLoading) {
        return (
            <HomeworkLoading />
        )
    } else if (courseDetail.error) {
        return (
            <Error refresh={() => getCourseDetails(courseID, token)} />
        );
    }


    const CourseDetailSide = () => (

        <Row className="justify-content-around">
            <Col md={4} xs={12}>
                <CourseInfo course={course} toggleLessonModal={toggleLessonModal} user={user} />
            </Col>
            <Col xs={12} md={{ offset: 0, size: 7 }} style={{ maxHeight: '70vh', overflowY: 'scroll' }}>
                <CourseDetailsContent courseDetail={courseDetail.courseDetails} user={user}
                    getHwSubmitions={getHwSubmitions}  reset_after_error={reset_after_error}
                    addUnitAPI={addUnitAPI} updateUnitAPI={updateUnitAPI} getUnitFile={getUnitFile}
                    deleteStudyUnitFile={deleteStudyUnitFile} toggleLessonModal={toggleLessonModal} deleteUnit={deleteUnit} 
                    deleteLesson={deleteLesson} />
            </Col>

            <LessonModal isOpen={addUpdateLessonOpen} toggle={toggleLessonModal} reset_after_error={reset_after_error}
                addLesson={addLesson} updateLessonFunction={updateLesson} courseID={course.course_id}
                updateLesson={lessonToUpdate}  />
        </Row>

    )

    return (
        <Container fluid >
            <Row className="justify-content-between">
                <Col xs='auto' className="d-flex flex-column justify-content-center">
                    <BackButton />
                </Col>
                <Col xs={'auto'}>
                    <h1>
                        {course.course_name}
                    </h1>
                </Col>
                <Col xs='auto'>

                </Col>
            </Row>
            <Routes>
                <Route path="/hw/:unitID" element={<HwSubmit units={courseDetail.courseDetails.units} submitionHw={submitionHw} getHwSubmitions={getHwSubmitions} 
                course={course} submit_homework={submit_homework} reset_after_error={reset_after_error} updateSubmitHomework={updateSubmitHomework}
                getHomeworkFile={getHomeworkFile} deleteHomeworkFile={deleteHomeworkFile} giveFeedback={giveFeedback} deleteSubmittion={deleteSubmittion} />} />
                <Route path='/students' element={<CourseStudents />} />
                <Route path="/*" element={< CourseDetailSide />} />
            </Routes>

        </Container>
    )
}


export default connect(mapStateToProps, mapDispacthToProps)(CourseDetails);
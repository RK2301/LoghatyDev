import React from "react";
import PropTypes from "prop-types";
import { Card, CardBody, CardHeader, Col, Container, Row } from "reactstrap";
import EnhancedTabelHead, { StyledFeedbackButton, StyledRowTabel, StyledTableCell } from "../../materialUiOverride";
import { FaPlus, FaTrash } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { IconButton, Table, TableBody, TableContainer } from "@mui/material";
import { useState, useMemo, useEffect } from "react";
import { getComparator, stableSort } from "../../services";
import { useParams } from "react-router-dom";
import { connect } from "react-redux";
import { getCourseStudents, registerStudents, reset_after_error } from "../../../redux/ActionCreators";
import CardTableLoading from "../../loadingComponents/CardTableLoading";
import Error from "../../error/errorComponent";
import Restricted from "../../../permissions/Restricted";
import * as Permissions from '../../../permissions/permissionTypes';
import StudentsModal from "./studentsModal";

const mapStateToProps = (state) => ({
    courseStudents: state.courseStudents
});

const mapDispacthToProps = (dispatch) => ({
    getCourseStudents: (courseID) => dispatch(getCourseStudents(courseID)),
    reset_after_error: () => dispatch( reset_after_error() ),
    registerStudents: (students) => dispatch( registerStudents(students) )
})

/**This Component to show students currently enrolled in the course, and the option to add or remove students */
const CourseStudents = ({ courseStudents, getCourseStudents, reset_after_error, registerStudents }) => {

    const courseId = parseInt(useParams().id);
    useEffect(() => {
        //make api call to get course students
        getCourseStudents(courseId);
    }, []);
    const { t } = useTranslation();
    const [isOpen, setOpen] = useState(false);
    const [notEnrolledStudents ,setNotEnrolledStudents] = useState([]);

    /**State and array for table */
    const [order, setOrder] = useState('asc');
    const [orderBy, setOrderBy] = useState('id');

    const toggle = () => setOpen(!isOpen);
    /**Called to set the not enrolled students and open the modal to show the stduents  */
    const showRegisterModal = () => {
        setNotEnrolledStudents(courseStudents.students.notEnrolled);
        toggle();
    }

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const rowsToRender = useMemo(
        () => {
            if (courseStudents.students.enrolled) {
                return stableSort(courseStudents.students.enrolled.slice(), getComparator(order, orderBy)).slice()
            }
        },
        [order, orderBy, courseStudents.students.enrolled]
    );

    const headCells = [
        {
            id: 'id',
            numeric: false,
            label: t('id'),
            isSort: true
        },
        {
            id: 'firstname',
            numeric: false,
            label: t('fullname'),
            isSort: true
        },
        {
            id: 'phone',
            numeric: false,
            label: t('Studentphone'),
            isSort: true
        },
        {
            id: 'class_id',
            numeric: true,
            label: t('class'),
            isSort: true
        },
        {
            id: 'delete',
            numeric: false,
            label: t('delete'),
            isSort: false
        }
    ];

    if (courseStudents.isLoading)
        return (
            <CardTableLoading />
        );

    if (courseStudents.error)
        return (
            <Error refresh={() => getCourseStudents(courseId)} />
        );

    console.log(courseStudents);
    return (
        <>
            <Container className="mt-2" fluid>
                <Row className="justify-content-center">
                    <Col xs={12} md={10}>
                        <Card className='teacherCard' style={{ background: 'transparent', border: '2px solid black' }}>
                            <CardHeader>
                                <Row className="justify-content-between">
                                    <Col xs={6} md={4}>
                                        <Restricted to={Permissions.MANAGE_COURSE_STUDENTS}>
                                            <StyledFeedbackButton
                                             onClick={showRegisterModal}>
                                                <FaPlus />
                                                {t('add')}
                                            </StyledFeedbackButton>
                                        </Restricted>
                                    </Col>
                                    <Col xs={'auto'} className="d-flex flex-column justify-content-center">
                                        {t('showResult', { number: courseStudents.students.enrolled?.length })}
                                    </Col>
                                </Row>
                            </CardHeader>

                            <CardBody>
                                <TableContainer>
                                    <Table>
                                        <EnhancedTabelHead
                                            order={order}
                                            orderBy={orderBy}
                                            headCells={headCells}
                                            onRequestSort={handleRequestSort}
                                        />
                                        <TableBody>
                                            {rowsToRender?.map(student => (
                                                <StyledRowTabel
                                                    hover
                                                    key={student.id}
                                                >
                                                    <StyledTableCell
                                                        align='center'>
                                                        {student.id}
                                                    </StyledTableCell>

                                                    <StyledTableCell
                                                        align='center'
                                                    >
                                                        {student.firstname + ' ' + student.lastname}
                                                    </StyledTableCell>
                                                    <StyledTableCell
                                                        align='center'
                                                    >
                                                        {student.phone ? student.phone : '--'}
                                                    </StyledTableCell>
                                                    <StyledTableCell
                                                        align='center'
                                                    >
                                                        {student.class_id > 12 ? t('gradute') : student.class_id}
                                                    </StyledTableCell>

                                                    <Restricted to={Permissions.MANAGE_COURSE_STUDENTS}>
                                                        <StyledTableCell
                                                            align='center'
                                                            size={"small"}
                                                        >
                                                            <IconButton >
                                                                <FaTrash color="black" size={16} />
                                                            </IconButton>
                                                        </StyledTableCell>
                                                    </Restricted>
                                                </StyledRowTabel>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <StudentsModal isOpen={isOpen} toggle={toggle}
             notEnrolledStudents={notEnrolledStudents} reset_after_error={reset_after_error}
             registerStudents={registerStudents} />
        </>
    );
}

CourseStudents.prototype = {
    /**represent the object in redux store, holde load, error state, and students as object 
     * with 2 fields, 1 as enrolled, contain enrolled students for the course
     * 2 as notEnrolled, the students not yet enrolled for the course
     */
    courseStudents: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispacthToProps)(CourseStudents);
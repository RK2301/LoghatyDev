import { connect } from "react-redux";
import React, { useEffect } from "react";
import SideCourse from "./SideCourse";
import { getCourseDetails, getCourses } from "../../redux/ActionCreators";
import Load from "../loadComponent/loadComponent";
import Error from "../error/errorComponent";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardImg, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from 'reactstrap';
import { FaCheck, FaClock, FaEllipsisV, FaSpinner, FaUserAlt, FaUsers } from 'react-icons/fa';
import styles from '../teachers/teachers.module.css';
import cStyles from './coursesStyle.module.css';
import { formatTheDate } from '../services';
import { Link } from 'react-router-dom';
import { Badge, Chip } from "@mui/material";
import { MyPaper, StyledMenu } from "../materialUiOverride";
import Restricted from "../../permissions/Restricted";
import * as PermissionsTypes from '../../permissions/permissionTypes';
import CardsLoading from "../loadingComponents/cardsLoading";
import GetChips from "./GetChips";

const mapStateToProps = (state) => ({
    courses: state.courses
});

const mapDispacthToProps = (dispacth) => ({
    getCourses: () => dispacth(getCourses()),
    getCourseDetails: (courseID, token) => dispacth(getCourseDetails(courseID, token))
});

const CourseMain = ({ courses, getCourses, token }) => {

  
    //api call to retreive all the courses
    useEffect(() =>  getCourses(), []);

    const { t, i18n } = useTranslation();

    //state for menu for each card
    const [anchorEl, setAnchorEl] = React.useState([]);
    const handleClick = (event, i) => {
        anchorEl[i] = event.currentTarget;
        console.log(anchorEl.slice());
        setAnchorEl(anchorEl.slice());
    };
    const handleClose = (i) => {
        setAnchorEl[i] = null;
    };

    if (courses.isLoading) {
        return (
            <CardsLoading />
        );
    } else if (courses.error) {
        return (
            <Error refresh={() => getCourses()} />
        );
    }

    const CourseDetails = () => {
        const coursesDetails = courses.courses.map((course, i) => {
            return (

                <Col xs={12} md={4} key={course.course_id} className='mb-3' style={{ position: 'relative' }}>
                    <Card className={'h-100 ' + cStyles.mycard} >

                        <Link to={`/courseDetails/${course.course_id}`}>
                            <CardImg top alt='course_img' src={require('../logIn/back4.jpg')}
                                className={cStyles.cardImg} />
                        </Link>
                        <CardBody>
                            <Container fluid>
                                <Row className='justify-content-between'>
                                    <Col xs='auto'>
                                        <Link to={`/courseDetails/${course.course_id}`} className={cStyles.link}
                                            >
                                            <h5>{course.course_name}</h5>
                                        </Link>
                                    </Col>

                                    {/* <Col xs={'auto'}>
                                        <IconButton
                                        key={i}
                                            onClick={(e) => handleClick(e, i)}>
                                            <FaEllipsisV />
                                        </IconButton>

                                        <Menu
                                            anchorEl={anchorEl[i]}
                                            open={Boolean(anchorEl[i])}
                                            id={"demo-positioned-menu" + i}
                                            onClose={() => handleClose(i)}
                                            onClick={() => handleClose(i)}
                                            anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                                            transformOrigin={{ vertical: 'top', horizontal: 'center' }}
                                        >
                                            <MenuItem onClick={() => handleClose(i)} component={Link} to='/home' className={styles.dropDownLink}>
                                                <ListItemIcon>
                                                    <MdEdit className="basic-icon" />
                                                </ListItemIcon>
                                                {t('update')}
                                            </MenuItem>
                                        </Menu>
                                    </Col> */}
                                    <Restricted to={PermissionsTypes.COURSE_DROPDOWN}>
                                        <Col xs={'auto'}>
                                            <div className="d-flex">
                                                <UncontrolledDropdown direction='end'>
                                                    <DropdownToggle cssModule={{ 'btn': styles.tabelBtn }} >
                                                        <FaEllipsisV />
                                                    </DropdownToggle>
                                                    <DropdownMenu  >
                                                        <DropdownItem cssModule={{ 'dropdown-item': '' }}>  {t('delete')} </DropdownItem>
                                                        <DropdownItem >
                                                            <Link to={`/addCourse/${course.course_id}`} className={cStyles.link}>
                                                                {t('update')}
                                                            </Link>
                                                        </DropdownItem>
                                                        {/* <DropdownItem > {t('suspend')} </DropdownItem> */}
                                                    </DropdownMenu>
                                                </UncontrolledDropdown>
                                            </div>
                                        </Col>
                                    </Restricted>
                                </Row>
                                <Row className='justify-content-between'>
                                    <Col xs='auto'>
                                        {course.firstname + ' ' + course.lastname}
                                    </Col>
                                    <Col xs={'auto'}>
                                        {formatTheDate(course.start_date)}
                                    </Col>
                                </Row>
                                <Row className='justify-content-between'>
                                    <Col xs={'auto'}>
                                        {course.language_id ? course.language_name == 'en' ? 'English' : course.language_name == 'ar' ? 'عربي' : 'עברית'
                                            : course[i18n.language]}
                                    </Col>
                                    <Col xs={'auto'}>
                                        {formatTheDate(course.end_date)}
                                    </Col>
                                </Row>

                                <div className="d-flex flex-row-reverse justify-content-between" style={{ position: 'absolute', top: 7, right: 5, zIndex: 1 }}>
                                    <GetChips course={course} />
                                    <Badge className="d-flex flex-column justify-content-center m-2">
                                        {course.course_type === 'g' ? <FaUsers className="basic-icon" /> : <FaUserAlt className="basic-con" />}
                                    </Badge>
                                </div>
                            </Container>
                        </CardBody>
                    </Card>
                </Col>
            );
        });

        return (
            <div style={{ maxHeight: '75vh', overflowY: 'scroll' }} className='mt-3 mt-md-2'>
                <Container fluid>
                    <Row >
                        {coursesDetails}
                    </Row>
                </Container>
            </div>
        );
    }

    return (
        <Container fluid>
            <Row className="mt-2 mt-md-1">
                <Col xs={12}>
                    <SideCourse />
                </Col>
            </Row>
            <Row>
                <Col className="p-md-2">
                    <CourseDetails />
                </Col>
            </Row>
        </Container>
    );
}

export default connect(mapStateToProps, mapDispacthToProps)(CourseMain)
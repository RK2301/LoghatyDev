import React, { Component, useEffect } from 'react';
import Load from '../loadComponent/loadComponent'
import Error from '../error/errorComponent';
import { useTranslation } from 'react-i18next';
import { Card, CardBody, CardImg, Col, Container, DropdownItem, DropdownMenu, DropdownToggle, Row, UncontrolledDropdown } from 'reactstrap';
import { FaEllipsisV } from 'react-icons/fa';
import styles from '../teachers/teachers.module.css';
import cStyles from './coursesStyle.module.css';
import {formatTheDate, formatTheTime} from '../services';
import { Link, Navigate } from 'react-router-dom';
import { FadeTransform } from 'react-animation-components'


const Courses = ( {courses, getCourses, getCourseDetails, token} ) => {

    const { t } = useTranslation();
    useEffect( 
        () => getCourses(token)
     , []);
     
     if (courses.isLoading) {
        return (
            <Load />
        );
    } else if (courses.error) {
        return (
            <Error refresh={() => getCourses(token)} />
        );
    }

    const coursesDetails = courses.courses.map(course => {
        return (

            <Col xs={12} md={4} className='mb-3' key={course.course_id}>
                <Card  className={'h-100 '+cStyles.mycard}  onClick={() => {<Navigate to='home/' />}}>
                <Link to={`/courseDetails/${course.course_id}`} onClick={ () => getCourseDetails(course.course_id, token )}>
                    <CardImg top alt='course_img' src={require('../logIn/back4.jpg')}
                    className={cStyles.cardImg} />
                </Link>    
                <CardBody>
                    <Container fluid>
                        <Row className='justify-content-between'>
                            <Col xs='auto'>
                               <Link to={`/courseDetails/${course.course_id}`} className={cStyles.link}
                                onClick={ () => getCourseDetails(course.course_id, token )}>
                                 <h5>{course.course_name}</h5>
                               </Link>  
                            </Col>
                            <Col xs={'auto'}>
                                <div className="d-flex">
                                    <UncontrolledDropdown direction='end'>
                                        <DropdownToggle cssModule={{'btn': styles.tabelBtn}} >
                                            <FaEllipsisV />
                                        </DropdownToggle>
                                        <DropdownMenu  >
                                            <DropdownItem cssModule={{'dropdown-item': ''}}>  { t('delete') } </DropdownItem>
                                            <DropdownItem > { t('update') } </DropdownItem>
                                            <DropdownItem > { t('suspend') } </DropdownItem>
                                        </DropdownMenu>
                                    </UncontrolledDropdown>
                                </div>
                            </Col>
                        </Row>
                        <Row className='justify-content-between'>
                            <Col xs='auto'>
                                { course.firstname +' ' + course.lastname }
                            </Col>
                            <Col xs={'auto'}>
                                { formatTheDate(course.start_date) }
                            </Col>
                        </Row>
                        <Row className='justify-content-between'>
                            <Col xs={'auto'}>
                                { t(course.meet_day) + ' ' + formatTheTime(course.meet_Time) }
                            </Col>
                            <Col xs={'auto'}>
                                { t(course.course_subject) }
                            </Col>
                        </Row>
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
export default Courses;


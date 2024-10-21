import React, { useCallback } from "react";
import styles from './coursesStyle.module.css'
import { Card, CardHeader, Col, Collapse, Container, ListGroup, ListGroupItem, Row, UncontrolledTooltip } from "reactstrap";
import { FaArrowDown, FaEdit, FaEye, FaEyeSlash, FaFileAlt, FaFileImage, FaFilePdf, FaFilePowerpoint, FaFileWord, FaPlusSquare, FaTrash, FaTrashAlt } from "react-icons/fa";
import { useState } from "react";
import withDirection, { DIRECTIONS } from 'react-with-direction';
import { MdOutlineFileDownload } from "react-icons/md";
import { formatDateTime } from "../services";
import { Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import cstyles from './coursesStyle.module.css';
import { ButtonGroup, Divider, IconButton, List, ListItem } from "@mui/material";
import Restricted from "../../permissions/Restricted";
import * as Permission from '../../permissions/permissionTypes';
import { StyledFeedbackButton, StyledToolTip } from "../materialUiOverride";
import UnitModal from "./courseDetailsComponents/UnitModal";
import { memo } from "react";
import ErrorModal from "../errorModal/errorModalComponent";

const CourseDetailsContent = memo(({ courseDetail, direction, getHwSubmitions,
    reset_after_error, addUnitAPI, updateUnitAPI, getUnitFile, deleteStudyUnitFile,
    toggleLessonModal, deleteUnit, deleteLesson }) => {

    const { t } = useTranslation();
    const courseID = useParams().id;

    const stateObj = {};
    courseDetail.lessons?.forEach(lesson => stateObj[lesson.lesson_id] = true);
    const [state, setState] = useState(stateObj);

    const toggleCollapse = (lesson_id) => {
        setState({ ...state, [lesson_id]: !state[lesson_id] });
    }

    const [unitModalProps, setUnitModalProps] = useState({
        isOpen: false,
        addUnit: true,
        updUnit: {},
        lesson_id: null
    });

    //state for delete component
    const [isOpen, setIsOpen] = useState(false);
    const [deleteFunction, setToDeleteFunction] = useState({});
    const toggle = (event, unit_id, lesson_id) => {
        setIsOpen(!isOpen);

        if (unit_id)
            setToDeleteFunction({
                delete: () => deleteUnit(courseID, unit_id)
            })

        if (lesson_id)
            setToDeleteFunction({
                delete: () => deleteLesson(lesson_id, courseID)
            })
    }

    /**toggle the unit modal
     * @param lesson_id id of lesson to add or update the unit
     * @param addUnit indicate if open for add, true for add unit, false for add homework
     * @param updUnit for update should pass object of unit or homework
     */
    const toggleUnitModal = useCallback( (event, lesson_id, addUnit = true, updUnit = {}) => {
        setUnitModalProps({
            ...unitModalProps,
            isOpen: !unitModalProps.isOpen,
            addUnit: addUnit,
            updUnit: updUnit,
            lesson_id: lesson_id
        })
    }, [unitModalProps.isOpen])

    const filesContent = (unit_id, lesson_id) => {
        return courseDetail.files.filter(file => file.unit_id === unit_id)
            .map(file => {
                const fileInfo = file.file_name.split('.');
                const fileType = fileInfo[fileInfo.length - 1];

                return (
                    <Row className="mt-2">
                        <Col xs={'auto'}>
                            {fileType === 'pdf' ? (<FaFilePdf className="basic-icon" />) :
                                fileType === 'docx' ? (<FaFileWord className="basic-icon" />) :
                                    fileType === 'pptx' ? (<FaFilePowerpoint className="basic-icon" />) :
                                        fileType === 'tiff' || 'gif' || 'jpeg' || 'jpg' || 'png' || 'eps' ?
                                            (<FaFileImage className="basic-icon" />) : (<FaFileAlt className='basic-icon' />)}
                        </Col>
                        <Col xs={{ offset: 0, size: 'auto' }}>
                            <a className={styles['download-link']}
                                onClick={() => getUnitFile(courseID, lesson_id, unit_id, file.file_id)}>
                                {fileInfo[0]}
                            </a>
                        </Col>
                        <Restricted to={Permission.MANAGE_LESSON}>
                            <Col className={direction === DIRECTIONS.LTR ? 'ms-auto' : 'me-auto'} xs={'auto'}>
                                <IconButton
                                    color='error'
                                    onClick={() => deleteStudyUnitFile(courseID, lesson_id, unit_id, file.file_id)}>
                                    <FaTrash size={16} color='black' />
                                </IconButton>
                            </Col>
                        </Restricted>
                    </Row>
                );
            })
    }

    const unitsContent = (lesson_id, lesson_title, unit_id, hw_visible, hw_visible_time) => {

        return courseDetail.units.filter(unit => unit.lesson_id === lesson_id).map(unit => (
            <>
                <ListItem >
                    <div className="d-flex flex-column w-100">
                        <Row>
                            <Restricted to={Permission.MANAGE_LESSON}>
                                <Col xs={'auto'}>
                                    <ButtonGroup>
                                        <IconButton onClick={() => {
                                            //set files prop for the unit
                                            const edit_unit = { ...unit };
                                            edit_unit.files = courseDetail.files.filter(file => file.unit_id === unit.unit_id);
                                            toggleUnitModal(null, lesson_id, true, edit_unit);
                                        }} >
                                            <FaEdit className="small-icon" />
                                        </IconButton>
                                        <IconButton color='error' onClick={() => toggle(null, unit.unit_id)}>
                                            <FaTrash className="small-icon" />
                                        </IconButton>
                                    </ButtonGroup>
                                </Col>
                            </Restricted>

                            {lesson_title === 'Homework' ?
                                (
                                    <Col>
                                        <Row className="justify-content-end">
                                            <Col xs={"auto"}>
                                                {unit.hw_visible ? (<FaEye className="basic-icon" id={"hwToolTip" + unit_id} />) :
                                                    (<FaEyeSlash className='basic-icon' id={"hwToolTip" + unit_id} />)}
                                                <UncontrolledTooltip placement="top" target={'hwToolTip' + unit_id} >
                                                    {unit.hw_visible ? t('visibleToStudent') : t('nonVisibleToStudent')}
                                                </UncontrolledTooltip>
                                            </Col>
                                            {!hw_visible && hw_visible_time ? (
                                                <Col xs={'auto'}>
                                                    {formatDateTime(hw_visible_time)}
                                                </Col>
                                            ) : (<></>)
                                            }
                                        </Row>
                                    </Col>
                                ) : (<></>)
                            }
                        </Row>
                        {filesContent(unit.unit_id, lesson_id)}
                        {
                            unit.note_id ?
                                (
                                    <Row className="justify-content-between">
                                        <Col xs={'auto'} className="mt-3">
                                            <p className={styles.note_text} >
                                                {unit.note_text}
                                            </p>
                                        </Col>
                                    </Row>
                                ) :
                                (<></>)
                        }

                        {unit.submit_time ?
                            (<Row className="justify-content-between">
                                <Col xs={'auto'} md={'auto'}>
                                    <Row>
                                        <Col xs={'auto'}>
                                            <MdOutlineFileDownload size={22} color='black' />
                                        </Col>
                                        <Col xs={'auto'}>
                                            <Link to={`hw/${unit.unit_id}`}
                                                className={cstyles.link} >
                                                {unit.hw_title}
                                            </Link>
                                        </Col>
                                    </Row>
                                </Col>
                                <Col xs={'auto'}>
                                    {formatDateTime(unit.submit_time)}
                                </Col>
                            </Row>) : (<></>)
                        }
                    </div>
                </ListItem>
                <Divider component={'li'} />
            </>
        ));
    };

    /***Render Lesson Card */
    const content = courseDetail.lessons?.map(lesson => {

        return (
            <div className="mt-2">
                <Card className={styles.mycard + ' mb-4'}>
                    <CardHeader className={styles.mycardHeader} >
                        <Container fluid>
                            <Row className="justify-content-between">
                                <Col xs={'auto'} className="d-flex flex-column justify-content-center">
                                    {lesson.lesson_title === 'homework' ? t('homework') : lesson.lesson_title}
                                </Col>
                                <Col xs={'auto'}>
                                    <IconButton
                                        onClick={() => toggleCollapse(lesson.lesson_id)}>
                                        <FaArrowDown size={17} color="black" />
                                    </IconButton>
                                </Col>
                            </Row>
                        </Container>
                    </CardHeader>

                    <Collapse isOpen={state[lesson.lesson_id]} >
                        <div className="d-flex flex-column w-100 ">
                            <List>
                                <Restricted to={Permission.MANAGE_LESSON}>
                                    <ListItem className={styles.listItemLesson}>
                                        <Row className="w-100">
                                            <Col xs={10} md={6}>
                                                <Row className="g-2">
                                                    <Col xs={lesson.lesson_title.toLowerCase() === 'homework'.toLowerCase() ? 8 : 'auto'}>
                                                        <StyledFeedbackButton onClick={() => {
                                                            lesson.lesson_title?.toLowerCase() === 'homework' ? toggleUnitModal(null, lesson.lesson_id, false) : toggleUnitModal(null, lesson.lesson_id)
                                                        }}>
                                                            <FaPlusSquare size={17} />
                                                        </StyledFeedbackButton>
                                                    </Col>

                                                    <Col xs={'auto'} className={lesson.lesson_title.toLowerCase() === 'homework' ? 'd-none' : ''} >
                                                        <StyledFeedbackButton onClick={() => { toggleLessonModal(null, lesson) }}>
                                                            <FaEdit size={17} />
                                                        </StyledFeedbackButton>
                                                    </Col>

                                                    <Col xs={'auto'} className={lesson.lesson_title.toLowerCase() === 'homework' ? 'd-none' : ''}>
                                                        <StyledToolTip title={ t('deleteLesson') } >
                                                            <StyledFeedbackButton color='error' onClick={() => toggle(null, null, lesson.lesson_id)}>
                                                                <FaTrash size={17} color='black' />
                                                            </StyledFeedbackButton>
                                                        </StyledToolTip>
                                                    </Col>
                                                </Row>
                                            </Col>
                                            {lesson.lesson_title.toLowerCase() !== 'homework' ? (
                                                <Col>
                                                    <Row className="justify-content-between justify-content-md-end align-items-center">
                                                        {!lesson.is_visible && lesson.visible_time && new Date() < new Date(lesson.visible_time) ? (
                                                            <Col xs={'auto'}>
                                                                {formatDateTime(lesson.visible_time)}
                                                            </Col>
                                                        ) : (<></>)
                                                        }
                                                        <Col xs={'auto'}>
                                                            {lesson.is_visible || new Date() > new Date(lesson.visible_time) ?
                                                                (<FaEye className="basic-icon" id={"studentToolTip" + lesson.lesson_id} />) :
                                                                (<FaEyeSlash className='basic-icon' id={"studentToolTip" + lesson.lesson_id} />)}
                                                            <UncontrolledTooltip placement="top" target={'studentToolTip' + lesson.lesson_id} >
                                                                {lesson.is_visible || new Date() > new Date(lesson.visible_time)
                                                                    ? t('visibleToStudent') : t('nonVisibleToStudent')}
                                                            </UncontrolledTooltip>
                                                        </Col>
                                                    </Row>
                                                </Col>) : (<></>)
                                            }
                                        </Row>
                                    </ListItem>
                                    <Divider component={'li'} />
                                </Restricted>
                                {unitsContent(lesson.lesson_id, lesson.lesson_title, lesson.unit_id)}
                            </List>
                        </div>
                    </Collapse>

                </Card>
            </div>
        );
    });



    return (
        <>
            {content}
            <UnitModal
                isOpen={unitModalProps.isOpen}
                toggle={toggleUnitModal}
                addUnit={unitModalProps.addUnit}
                updUnit={unitModalProps.updUnit}
                reset_after_error={reset_after_error}
                addUnitAPI={addUnitAPI}
                lesson_id={unitModalProps.lesson_id}
                updateUnitAPI={updateUnitAPI}
            />

            <Restricted to={Permission.COURSE_MANAGMENT}>
                <ErrorModal isOpen={isOpen} toggle={toggle} _delete={deleteFunction?.delete} reset_after_error={reset_after_error} />
            </Restricted>
        </>
    );
})

export default withDirection(CourseDetailsContent);
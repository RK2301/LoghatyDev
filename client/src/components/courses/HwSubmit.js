import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Card, CardHeader, Col, Collapse, Container, Row } from "reactstrap";
import { FaArrowDown, FaEye } from "react-icons/fa";
import cStyles from './coursesStyle.module.css';
import withDirection, { DIRECTIONS } from "react-with-direction";
import { formatDateTime } from "../services";
import Load from "../loadComponent/loadComponent";
import Error from "../error/errorComponent";
import SubmitHwModal from "./submitHwModal";
import { FadeTransform } from 'react-animation-components';
import { Checkbox, Divider, IconButton, List, ListItem, Table, TableBody, Typography } from "@mui/material";
import Restricted from "../../permissions/Restricted";
import * as PermissionsTypes from '../../permissions/permissionTypes';
import StudentSubmit from "./StudentSubmit";
import PropTypes from 'prop-types';
import RemainTime from "./courseDetailsComponents/RemainTime";
import EnhancedTabelHead, { StyledRowTabel, StyledTableCell } from "../materialUiOverride";
import HomeworkLoading from "../loadingComponents/HomeworkLoading";


const HwSubmit = ({ direction, units, submitionHw, getHwSubmitions, course,
    submit_homework, reset_after_error, updateSubmitHomework, getHomeworkFile,
    deleteHomeworkFile, giveFeedback, deleteSubmittion }) => {

    const params = useParams();
    const unit_id = parseInt(params.unitID);
    const course_id = parseInt(params.id);

    const hwUnit = units?.filter(unit => unit.unit_id === unit_id)[0];

    useEffect(() => {
        getHwSubmitions(course_id, unit_id);
    }, []);


    const { t } = useTranslation();
    const [state, setState] = useState({
        isOpen: false,
        isOpenSubmit: false,
        studentInfo: {},
        filesInfo: []
    });

    const toggleHwInfo = () => {
        setState({ ...state, isOpen: !state.isOpen });
    }


    const toggleSubmitModal = (e, student_id) => {
        setState({
            ...state,
            isOpenSubmit: !state.isOpenSubmit,
            studentInfo: student_id ? submitionHw.submitions.submitions.filter(submit => submit.student_id === student_id)[0] : {},
            filesInfo: student_id ? submitionHw.submitions.submitFiles.filter(file => file.student_id === student_id) : []
        })
    }

    const numOfSubmit = submitionHw.submitions.submitions ? submitionHw.submitions.submitions.length : ' - ';
    const dirAnimation = direction === DIRECTIONS.LTR ? 'translateX(-100%)' : 'translateX(100%)';
    const dirAnimationReverse = direction === DIRECTIONS.LTR ? 'translateX(100%)' : 'translateX(-100%)';




    if (submitionHw.isLoading) {
        return (
            <HomeworkLoading />
        )
    }
    else if (submitionHw.error) {
        return (
            <Error refresh={() => getHwSubmitions(course_id, unit_id)} />
        )
    }

    const TableContent = () => {

        const [order, setOrder] = React.useState('asc');
        const [orderBy, setOrderBy] = React.useState('id');

        const handleRequestSort = (event, property) => {
            const isAsc = orderBy === property && order === 'asc';
            setOrder(isAsc ? 'desc' : 'asc');
            setOrderBy(property);
        };

        const headCells = [
            {
                id: 'checked',
                numeric: false,
                label: t('check'),
                isSort: false
            },
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
                id: 'upload_time',
                numeric: false,
                label: t('submitTime'),
                isSort: true
            },
            {
                id: 'view',
                numeric: false,
                label: t('view'),
                isSort: false
            }
        ]

        const submitContent = submitionHw.submitions.submitions?.map(submit => (
            <StyledRowTabel key={submit.student_id} padding='checkbox' hover>
                <StyledTableCell padding='checkbox' size='small'>
                    <Checkbox
                        checked={submit.grade ? true : false}
                        disabled
                    />
                </StyledTableCell>
                <StyledTableCell>
                    {submit.student_id}
                </StyledTableCell>
                <StyledTableCell>
                    {submit.full_name}
                </StyledTableCell>
                <StyledTableCell>
                    {formatDateTime(submit.upload_time) || '-'}
                </StyledTableCell>
                <StyledTableCell>
                    <IconButton onClick={() => toggleSubmitModal(null, submit.student_id)}>
                        <FaEye size={18} color="black" />
                    </IconButton>
                </StyledTableCell>
            </StyledRowTabel>
        ));

        return (
            <Table>
                <EnhancedTabelHead
                    order={order}
                    headCells={headCells}
                    orderBy={orderBy}
                    onRequestSort={handleRequestSort}
                />
                <TableBody>
                    {submitContent}
                </TableBody>
            </Table>
        )
    }

    return (
        <>
            <Row>

                <Col xs={12} md={4}>
                    <FadeTransform in
                        transformProps={{
                            exitTransform: 'scale(0.5) ' + dirAnimation,
                        }}>
                        <Card className={cStyles.mycard + ' mt-3'}>
                            <CardHeader className={cStyles.mycardHeader}>
                                <Container fluid>
                                    <Row className="justify-content-between">
                                        <Col xs={'auto'} className="d-flex flex-column justify-content-center">
                                            {hwUnit.hw_title}
                                        </Col>
                                        <Col xs={'auto'} >
                                            <IconButton className={'d-md-none'} onClick={toggleHwInfo}>
                                                <FaArrowDown size={15} color='black' />
                                            </IconButton>
                                        </Col>
                                    </Row>
                                </Container>
                            </CardHeader>

                            <Collapse isOpen={state.isOpen} className="d-md-block">
                                <List>
                                    <ListItem>
                                        <strong> {t('startDate') + ' : '}
                                            {formatDateTime(hwUnit.upload_time)}
                                        </strong>
                                    </ListItem>

                                    <Divider component='li' />

                                    <ListItem>
                                        <strong> {t('endDate') + ' : '}
                                            {formatDateTime(hwUnit.submit_time)}
                                        </strong>
                                    </ListItem>

                                    <Divider component='li' />

                                    <ListItem>
                                        <Row className="g-1">
                                            <Col xs='auto'>
                                                <strong>
                                                    {t('remainTime') + ': '}
                                                </strong>
                                            </Col>

                                            <Col xs='auto'>
                                                <RemainTime submit_time={hwUnit.submit_time} />
                                            </Col>
                                        </Row>
                                    </ListItem>

                                    <Divider component='li' />

                                    <Restricted to={PermissionsTypes.MANAGE_HOMEWORK}>
                                        <ListItem>
                                            <strong>
                                                {t('numOfSubmit') + ' : ' + numOfSubmit}
                                            </strong>
                                        </ListItem>
                                    </Restricted>

                                    <Restricted to={PermissionsTypes.HOMEWORK_SUBMIT_STATUS}>
                                        <ListItem>
                                            <strong>
                                                <Row className="g-1">
                                                    <Col xs={'auto'}>
                                                            {t('status') + ': '}
                                                    </Col>
                                                    {submitionHw.submitions?.submitions[0]?.upload_time ?
                                                        (
                                                            <Col xs='auto'>
                                                                <Typography color='green'>
                                                                    {t('submited') + ' ' + submitionHw.submitions?.submitions[0]?.upload_time}
                                                                </Typography>
                                                            </Col>
                                                        )
                                                        : (
                                                            <Col xs='auto'>
                                                                <Typography color='error'>
                                                                    {t('notSubmitted')}
                                                                </Typography>
                                                            </Col>
                                                        )
                                                    }
                                                </Row>
                                            </strong>
                                        </ListItem>
                                    </Restricted>

                                </List>

                            </Collapse>
                        </Card>
                    </FadeTransform>
                </Col>



                <Col xs={12} md={8} className="mt-3">
                    <FadeTransform in
                        transformProps={{
                            exitTransform: dirAnimationReverse
                        }}>
                        <Restricted to={PermissionsTypes.MANAGE_HOMEWORK}>
                            <TableContent />
                        </Restricted>

                        <Restricted to={PermissionsTypes.HOMEWORK_SUBMIT_STATUS}>
                            <StudentSubmit submitData={submitionHw.submitions?.submitions[0]} submitFiles={submitionHw.submitions.submitFiles}
                                course={course} submit_homework={submit_homework} reset_after_error={reset_after_error}
                                updateSubmitHomework={updateSubmitHomework} getHomeworkFile={getHomeworkFile} deleteHomeworkFile={deleteHomeworkFile}
                                deleteSubmittion={deleteSubmittion} />
                        </Restricted>
                    </FadeTransform>
                </Col>
            </Row>
            <Restricted to={PermissionsTypes.MANAGE_HOMEWORK}>
                <SubmitHwModal courseID={course_id} unitID={params.unitID} isOpen={state.isOpenSubmit}
                    toggle={toggleSubmitModal} studentInfo={state.studentInfo} filesInfo={state.filesInfo} getHomeworkFile={getHomeworkFile}
                    giveFeedback={giveFeedback} />
            </Restricted>
        </>
    )
}

HwSubmit.propTypes = {
    /**Function to enable student to submit homework */
    submit_homework: PropTypes.func.isRequired,
    /**Function to edit homework after submit to add more files */
    updateSubmitHomework: PropTypes.func.isRequired,
    /**function to download a file submitted in the homework by the student */
    getHomeworkFile: PropTypes.func.isRequired,
    /**function to delete a file form homework submittion */
    deleteHomeworkFile: PropTypes.func.isRequired,
    /**function to make api call for give feedaback for submittion made by a student */
    giveFeedback: PropTypes.func.isRequired,
    /**function to enable the student to delete the submittion for a specific homework */
    deleteSubmittion: PropTypes.func.isRequired
}

export default withDirection(HwSubmit);
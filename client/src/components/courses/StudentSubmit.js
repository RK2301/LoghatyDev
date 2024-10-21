import React from "react";
import { Col, Row } from "reactstrap";
import PropTypes from 'prop-types';
import { Avatar, Chip, Divider, IconButton, Table, TableBody, Typography } from "@mui/material";
import EnhancedTabelHead, { StyledRowTabel, StyledTableCell, StyledToolTip } from "../materialUiOverride";
import { useTranslation } from "react-i18next";
import { getFileExtension } from "../services";
import { FaEdit, FaPaperPlane, FaPlus, FaTrash } from "react-icons/fa";
import AddUpdateSubmit from "./AddUpdateSubmit";
import { useState } from "react";
import styles from './coursesStyle.module.css'
import { useParams } from "react-router-dom";
import ErrorModal from "../errorModal/errorModalComponent";


/**
 * This component is to show student submit component
 * ,display the files the user dispaly with option to see feedback from the teacher as grade and notes
 */
const StudentSubmit = ({ submitData, submitFiles, course, submit_homework, reset_after_error,
    updateSubmitHomework, getHomeworkFile, deleteHomeworkFile, deleteSubmittion }) => {

    const { t } = useTranslation();

    const hw_id = parseInt(useParams().unitID);
    const [isOpen, setIsOpen] = useState(false);
    const [updSubmit, setUpdSubmit] = useState({});
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
    /**state to decide if to show delete file error message or delete submittiom=n message in delete modal */
    const [deleteMessage, setDeleteMessage] = useState(false);

    /**delete function to be triggered when the delete modal file opened */
    const [deleteFunction, setDeleteFunction] = useState();

    /**toggle the add submit modal, for update mode pass true as second parameter
     * toggle the 
     * @param {*} e 
     * @param {*} update 
     */
    const toggle = (e = null, update = false) => {
        setIsOpen(!isOpen);
        update ? setUpdSubmit(submitData) : setUpdSubmit({});
    }

    /**
     * 
     * @param {*} e 
     * @param {*} file_id 
     * @param {*} toDeleteSubmittion boolean, pass true to pass function to delete the submittion
     */
    const toggleDeleteModal = (e, file_id, toDeleteSubmittion) => {
        setDeleteModalOpen(!isDeleteModalOpen);
        if (file_id) {
            const deleteFileFunction = {
                delete: () => deleteHomeworkFile(course.course_id, hw_id, file_id)
            }
            setDeleteFunction(deleteFileFunction);
            setDeleteMessage(false);
        }else if(toDeleteSubmittion){
            const deleteSubmittionFunction = {
                delete: () => deleteSubmittion(course.course_id, hw_id)
            }
            setDeleteFunction(deleteSubmittionFunction);
            setDeleteMessage(true)
        }
    }


    const headCells = [
        {
            id: 'file_name',
            numeric: false,
            label: t('file_name'),
            isSort: true
        },
        {
            id: 'file_type',
            numeric: false,
            label: t('file_type'),
            isSort: true
        },
        {
            id: 'delete',
            numeric: false,
            label: t('delete'),
            isSort: false
        }
    ];
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('file_name');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const SubmitSide = () => {
        if (!submitData)
            return (
                <div className="d-flex flex-column justify-content-center align-items-center" style={{ height: '50vh' }}>
                    <div>
                        <FaPaperPlane size={100} />
                    </div>

                    <div>
                        <Typography variant='subtitle2'>
                            {t('notSubmitHomework')}
                        </Typography>
                    </div>
                </div>
            );

        if (submitData.grade) {
            const i = headCells.findIndex(head => head.id === 'delete');
            if (i !== -1)
                headCells.splice(i, 1)
        }

        return (
            <>
                <Row className="justify-content-center">
                    <Col xs={12} md={8}>
                        <Table>
                            <EnhancedTabelHead
                                order={order}
                                headCells={headCells}
                                orderBy={orderBy}
                                onRequestSort={handleRequestSort}
                            />

                            <TableBody>
                                {submitFiles.map(file => (
                                    <StyledRowTabel
                                        key={file.file_id}
                                        hover>
                                        <StyledTableCell>
                                            <a className={styles['download-link']}
                                                onClick={() => getHomeworkFile(course.course_id, hw_id, file.file_id)}>
                                                {file.file_name}
                                            </a>
                                        </StyledTableCell>

                                        <StyledTableCell>
                                            {getFileExtension(file.file_name)}
                                        </StyledTableCell>

                                        <StyledTableCell
                                            size='small'
                                            hidden={submitData.grade}>

                                            <IconButton
                                                onClick={() => toggleDeleteModal(null, file.file_id)}>
                                                <FaTrash size={16} color='black' />
                                            </IconButton>
                                        </StyledTableCell>
                                    </StyledRowTabel>
                                ))}
                            </TableBody>
                        </Table>
                    </Col>
                </Row>

                {submitData?.grade ?
                    (
                        <Row className="mt-4 justify-content-center">
                            <Col xs={12} md={8}>
                                <Divider>
                                    <Chip label={t('feedback')} />
                                </Divider>

                                <Row className="justify-content-between">
                                    <Col xs='auto'>
                                        <Chip avatar={<Avatar />} label={course.firstname + ' ' + course.lastname} />
                                    </Col>

                                    <Col xs='auto'>
                                        <Typography variant='body1'>
                                            {t('grade') + ': ' + submitData.grade + ' /100'}
                                        </Typography>
                                    </Col>
                                </Row>

                                {submitData.submit_note ?
                                    (
                                        <Row className="mt-2">
                                            <Col xs={12}>
                                                <Typography variant='h5'>
                                                    {t('note')}
                                                </Typography>
                                            </Col>

                                            <Col>
                                                <Typography variant='subtitle1'>
                                                    {submitData.submit_note}
                                                </Typography>
                                            </Col>
                                        </Row>
                                    )
                                    : (<></>)}
                            </Col>
                        </Row>
                    )
                    : (<></>)}
            </>
        )
    }


    return (
        <>
            <Row className="justify-content-center">
                <Col xs={12} md={8}>
                    <Row className="justify-content-between">
                        <Col xs='auto'>
                            <div className="d-flex">
                                <IconButton
                                    color='primary'
                                    onClick={() => toggle(null, false)}
                                    disabled={submitData?.upload_time}>
                                    <FaPlus size={17} />
                                </IconButton>

                                <IconButton
                                    color='primary'
                                    onClick={() => toggle(null, true)}
                                    disabled={!submitData?.upload_time || submitData.grade}
                                >
                                    <FaEdit size={17} />
                                </IconButton>
                            </div>
                        </Col>

                        <Col xs='auto'>
                            <StyledToolTip title={t('deleteSubmit')}>
                                <IconButton
                                    onClick={() => toggleDeleteModal(null, null, true)}
                                    color="error"
                                    hidden={!submitData?.upload_time}
                                >
                                    <FaTrash size={17} />
                                </IconButton>
                            </StyledToolTip>
                        </Col>
                    </Row>
                </Col>
            </Row>

            <SubmitSide />
            <AddUpdateSubmit isOpen={isOpen} toggle={toggle} updSubmit={updSubmit}
                reset_after_error={reset_after_error} submit_homework={submit_homework}
                updateSubmitHomework={updateSubmitHomework} />

            <ErrorModal isOpen={isDeleteModalOpen} toggle={toggleDeleteModal}
                _delete={deleteFunction?.delete} deleteMessage={ deleteMessage ? t('deleteSubmittion') : t('deleteFileMessage')} reset_after_error={reset_after_error} />
        </>
    )
}

StudentSubmit.propTypes = {
    /**object contain data about studnts submit like, when submit and feedback fron teacher */
    submitData: PropTypes.object.isRequired,
    /**array contain all files the students submit */
    submitFiles: PropTypes.array.isRequired,
    /**contain all course data, like teacher name, start date... */
    course: PropTypes.object.isRequired,
    /**function to enable student to submit homework */
    submit_homework: PropTypes.func.isRequired,
    /**Function to update submit to add more files for the submit */
    updateSubmitHomework: PropTypes.func.isRequired,
    /**function to delete a file from the submittion */
    deleteHomeworkFile: PropTypes.func.isRequired,
    /**function to delete a submittion made by the student for a specific homework */
    deleteSubmittion: PropTypes.func.isRequired
}

export default StudentSubmit;
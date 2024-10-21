import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Container, Row, Col } from "reactstrap";
import { FaEye, FaStickyNote, FaTrash } from "react-icons/fa";
import ErrorModal from "../errorModal/errorModalComponent";
import { ADD_NOTE, DELETE_NOTE, UPDATE_VIEW_NOTE } from '../../redux/ActionTypes'
import { formatTheDate } from "../services";
import AddViewNote from "./AddViewNotes";
import styles from '../teachers/teachers.module.css';
import { useEffect } from "react";
import { IconButton, Table, TableBody, TableContainer, TableRow } from "@mui/material";
import { StyledFeedbackButton, StyledRowTabel, StyledTabelHead, StyledTableCell } from "../materialUiOverride";
import ReportLoading from "../loadingComponents/ReportLoading";
import Error from "../error/errorComponent";



function Notes({ notes, deleteNote, getNotes, token, target_user_id, manager_id
    , addNote, updateNote, reset_after_error }) {

    useEffect(() => getNotes(target_user_id, token), []);
    const { t } = useTranslation();
    const [state, setState] = useState({
        isOpenDelete: false,
        delNoteID: '',
        isOpenViewUpdate: false,
        actionType: '',
        noteDetail: {}
    });

    /**
     * Function to pass to the errorModal to trigger when delete button triggered
     * @returns 
     */
    const deleteNoteProp = () => {
        deleteNote(state.delNoteID, token);
    }

    const toggleDelete = (event, noteID = '') => {
        setState({ isOpenDelete: !state.isOpenDelete, delNoteID: noteID });
    }

    const toggleViewUpdate = (event, actionType, noteDetail) => {
        setState({
            ...state,
            isOpenViewUpdate: !state.isOpenViewUpdate,
            actionType: actionType || '',
            noteDetail: noteDetail || {}
        });
    }

    if (notes.LoadingNotes) {
        return (
            <ReportLoading />
        )
    }
    if (notes.error) {
        return (
            <Error refresh={() => getNotes(target_user_id, token)} />
        )
    }


    const noteContent = notes.notes?.map(note => {
        return (
            <StyledRowTabel key={note.note_id} hover>
                <StyledTableCell>
                    {note.note_title}
                </StyledTableCell>
                <StyledTableCell>
                    {formatTheDate(note.created_at)}
                </StyledTableCell>
                <StyledTableCell padding='none'>
                    <IconButton onClick={() => toggleViewUpdate(null, UPDATE_VIEW_NOTE, note)} >
                        <FaEye color='black' size={18} />
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell padding='none'>
                    <IconButton onClick={() => toggleDelete(null, note.note_id)} color='error'>
                        <FaTrash size={17} color='black' />
                    </IconButton>
                </StyledTableCell>
            </StyledRowTabel>
        );
    });

    return (
        <div>
            <Container fluid className="mb-3">
                <Row>
                    <Col xs={12} md={6}>
                        <StyledFeedbackButton onClick={() => toggleViewUpdate(null, ADD_NOTE)} >
                            <FaStickyNote size={20} />
                        </StyledFeedbackButton>
                    </Col>
                </Row>
            </Container>
            <Container fluid>
                <Row className="justify-content-center">
                    <Col xs={12} md={12}>
                        <TableContainer>
                            <Table
                            //  responsive striped hover className={styles.teacherTable}
                            >
                                <StyledTabelHead>
                                    <TableRow>
                                        {
                                            [t('noteTitle'), t('uplaodDate'), t('noteContent'), t('delete')].map((cell, i) => (
                                                <StyledTableCell key={i} padding='checkbox'>
                                                    { cell }
                                                </StyledTableCell>
                                            ))
                                        }
                                        {/* <StyledTableCell>
                                            {t('noteTitle')}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {t('uplaodDate')}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {t('noteContent')}
                                        </StyledTableCell>
                                        <StyledTableCell>
                                            {t('delete')}
                                        </StyledTableCell> */}
                                    </TableRow>
                                </StyledTabelHead>

                                <TableBody>
                                    {noteContent}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Col>
                </Row>
            </Container>

            <ErrorModal isOpen={state.isOpenDelete} toggle={toggleDelete}
                action={DELETE_NOTE} _delete={deleteNoteProp} reset_after_error={reset_after_error} />

            <AddViewNote isOpen={state.isOpenViewUpdate} toggle={toggleViewUpdate} actionType={state.actionType}
                noteDetails={state.noteDetail} addNote={addNote} target_user_id={target_user_id} manager_id={manager_id}
                updateNote={updateNote} token={token} />

        </div>
    );
}

export default Notes;
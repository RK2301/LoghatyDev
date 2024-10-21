import React from 'react';
import { useTranslation } from 'react-i18next';
import { Container, Row, Col } from 'reactstrap';
import { FaDownload, FaUpload, FaTrash } from 'react-icons/fa'
import Error from '../error/errorComponent';
import styles from '../teachers/teachers.module.css';
import { useState } from 'react';
import UploadFile from './UploadFileComponent';
import ErrorModal from '../errorModal/errorModalComponent';
import { formatTheDate } from '../services';
import { StyledFeedbackButton, StyledRowTabel, StyledTabelHead, StyledTableCell } from '../materialUiOverride';
import { IconButton, Table, TableBody, TableContainer, TableRow } from '@mui/material';
import ReportLoading from '../loadingComponents/ReportLoading';


function FilesTabel(props) {
    const { t } = useTranslation();
    const [state, setState] = useState({
        isOpen: false,
        isOpenDelete: false,
    });
    const [deleteFunction, setDeleteFunction] = useState();

    const toggleUpload = () => {
        setState({ ...state, isOpen: !state.isOpen });
    }

    const toggleDelete = (event, fileID, fileName) => {
        setState({ ...state, isOpenDelete: !state.isOpenDelete });

        if (fileID && fileName)
            setDeleteFunction({ delete: () => props.deleteFile(fileID, fileName, props.files.id) })
    }

    if (props.files.isLoading) {
        return (
            <ReportLoading />
        )
    } else if (props.files.error) {
        return (
            <Error refresh={() => props.refreshFiles(props.files.id, props.token)} />
        )
    }

    const tabelContent = props.files.files.map(item => {
        return (
            <StyledRowTabel key={item.id} hover>
                <StyledTableCell padding='normal'>
                    {item.name}
                </StyledTableCell>
                <StyledTableCell>
                    {formatTheDate(item.upload_date)}
                </StyledTableCell>
                <StyledTableCell >
                    <IconButton
                        onClick={() => props.getFile(item.id, item.name, props.files.id)}>
                        <FaDownload size={17} color='black' />
                    </IconButton>
                </StyledTableCell>
                <StyledTableCell>
                    <IconButton
                        color='error'
                        onClick={() => toggleDelete(null, item.id, item.name)} >
                        <FaTrash color='black' size={17} />
                    </IconButton>
                </StyledTableCell>
            </StyledRowTabel>
        );
    });

    return (
        <div>
            <Container fluid className='mb-3'>
                <Row>
                    <Col xs={12} md={6}>
                        <StyledFeedbackButton onClick={toggleUpload}>
                            <FaUpload size={20} />
                        </StyledFeedbackButton>
                    </Col>
                </Row>
            </Container>

            <TableContainer >
                <Table
                //  responsive hover striped 
                // className={styles.teacherTable}
                >
                    <StyledTabelHead>
                        <TableRow>
                            {
                                [t('fileName'), t('uploadDate'), t('download'), t('delete')].map((cell, i) => (
                                    <StyledTableCell key={i} padding='checkbox'>
                                        { cell }
                                    </StyledTableCell>
                                ))
                            }
                            {/* <StyledTableCell>
                                {t('fileName')}
                            </StyledTableCell>
                            <StyledTableCell>
                                {t('uploadDate')}
                            </StyledTableCell>
                            <StyledTableCell>
                                {t('download')}
                            </StyledTableCell>
                            <StyledTableCell>
                                {t('delete')}
                            </StyledTableCell> */}
                        </TableRow>
                    </StyledTabelHead>

                    <TableBody>
                        {tabelContent}
                    </TableBody>
                </Table>
            </TableContainer>
            <UploadFile isOpen={state.isOpen} toggle={toggleUpload}
                uploadFile={props.uploadFile} files={props.files}
                token={props.token} userId={props.userId} />

            <ErrorModal isOpen={state.isOpenDelete} toggle={toggleDelete}
                _delete={deleteFunction?.delete} reset_after_error={props.reset_after_error}
                deleteMessage={t('deleteFileMessage')} />
        </div>
    );
}

export default FilesTabel;
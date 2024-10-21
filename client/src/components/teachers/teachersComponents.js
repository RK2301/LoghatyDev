import React, { Component, useEffect, useState } from 'react';
import { Container, Row, Col, Button, Card, CardHeader, CardBody } from 'reactstrap';
import Error from '../error/errorComponent';
import { FaEdit, FaFile, FaPrint, FaUserPlus, FaTrash } from 'react-icons/fa';
import styles from './teachers.module.css';
import withDirection, { DIRECTIONS } from 'react-with-direction';
import TeacherModal from './teachersModal';
import * as Action_Types from '../../redux/ActionTypes'
import ErrorModal from '../errorModal/errorModalComponent';
import Report from '../report/ReportComponent';
import { connect } from 'react-redux';
import {
    getFilesForReport, uploadFile, deleteFile, getFile, getNotes
    , deleteNote, addNote, updateNote, getTeachers, refreshTeachers, add_upd_teacher, reset_after_error, deleteTeacher, printTeachers
} from '../../redux/ActionCreators';
import { useTranslation } from 'react-i18next';
import CardTableLoading from '../loadingComponents/CardTableLoading';
import EnhancedTabelHead, { StyledFeedbackButton, StyledRowTabel, StyledTableCell } from '../materialUiOverride';
import { IconButton, Table, TableBody, TableContainer } from '@mui/material';
import { getComparator, stableSort } from '../services';


const mapStateToProps = (state) => {
    return {
        teachers: state.teachers,
    }
};

const mapDispacthToProps = (dispatch) => ({
    getTeachers: () => dispatch(getTeachers()),
    refreshTeachers: () => dispatch(refreshTeachers()),
    add_upd_teacher: (teacher, token, changeAddUpd, setSubmitting, restForm, operation) => dispatch(add_upd_teacher(teacher, token, changeAddUpd, setSubmitting, restForm, operation)),
    deleteTeacher: (teacherID, token) => dispatch(deleteTeacher(teacherID, token)),
    getFilesReport: (id, token) => dispatch(getFilesForReport(id, token)),
    uploadFile: (file, idUser, idManager, token, setSubmitting, restForm) => dispatch(uploadFile(file, idUser, idManager, token, setSubmitting, restForm)),
    reset_after_error: () => dispatch(reset_after_error()),
    deleteFile: (fileId, userID, token) => dispatch(deleteFile(fileId, userID, token)),
    getFile: (fileID, fileName, userID, token) => dispatch(getFile(fileID, fileName, userID, token)),
    getNotes: (userID, token) => dispatch(getNotes(userID, token)),
    deleteNote: (noteID, token) => dispatch(deleteNote(noteID, token)),
    addNote: (target_user_id, manager_id, note_title, note_text, token, setSubmitting) => dispatch(addNote(target_user_id, manager_id, note_title, note_text, token, setSubmitting)),
    updateNote: (note, token, setSubmitting) => dispatch(updateNote(note, token, setSubmitting)),
    printTeachers: () => dispatch( printTeachers() )
});

const Teachers = ({ teachers, getTeachers, add_upd_teacher, deleteTeacher, getFilesReport
    , reset_after_error, token, user, printTeachers }) => {

    useEffect(() => getTeachers(), []);
    const { t } = useTranslation();

    const [isOpen, setISOpen] = useState(false);
    const [updTeacher, setUpdTeacher] = useState({});
    const [isOpenDelete, setIsOpenDelete] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const [delID, setDelID] = useState('');
    const [report_teacher_id, set_report_teacher_id] = useState('');
    const [operationToDo, setOperationToDo] = useState('');

    /**state for table */
    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const rowsToRender = React.useMemo(
        () => {
            if (teachers.teachers) {
                return stableSort(teachers.teachers.slice(), getComparator(order, orderBy)).slice()
            }
        },
        [order, orderBy, teachers.teachers]
    );

    const toggle = (opr, id) => {
        let o;
        opr !== undefined ? o = opr : o = '';
        let updTeacher = {}
        if (id) {
            updTeacher = teachers.teachers.filter(teacher => teacher.id === id)[0];
        }
        setISOpen(!isOpen);
        setUpdTeacher(updTeacher);
        setOperationToDo(o);
    }

    const toggleReport = (event, id = '') => {
        setIsReportOpen(!isReportOpen);
        set_report_teacher_id(id);

        //send api call for the server to get files for specific teacher
        if (id !== '') {
            getFilesReport(id);
        }
    }

    const toggleDelete = (event, id) => {
        setIsOpenDelete(!isOpenDelete);
        setDelID(id ? id : '');
    }

    if (teachers.loading)
        return (
            <CardTableLoading />
        );
    else if (teachers.error)
        return (
            <Error refresh={() => getTeachers()} />
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
            label: t('phone'),
            isSort: true
        },
        {
            id: 'email',
            numeric: true,
            label: t('email'),
            isSort: true
        },
        {
            id: 'username',
            numeric: false,
            label: t('username'),
            isSort: true
        },
        {
            id: 'report',
            numeric: false,
            label: t('report'),
            isSort: false
        },
        {
            id: 'update',
            numeric: false,
            label: t('update'),
            isSort: false
        },
        {
            id: 'delete',
            numeric: false,
            label: t('delete'),
            isSort: false
        }
    ];



    const teachersRow = rowsToRender.map((teacher) => {
        return (
            <StyledRowTabel key={teacher.id} hover>
                <StyledTableCell> {teacher.id} </StyledTableCell>
                <StyledTableCell> {teacher.firstname + ' ' + teacher.lastname} </StyledTableCell>
                <StyledTableCell> {teacher.phone} </StyledTableCell>
                <StyledTableCell> {teacher.email} </StyledTableCell>
                <StyledTableCell> {teacher.username} </StyledTableCell>

                <StyledTableCell>
                    <IconButton onClick={() => toggleReport(null, teacher.id)}>
                        <FaFile size={17} color='black' />
                    </IconButton>
                </StyledTableCell>

                <StyledTableCell >
                    <IconButton onClick={() => toggle('UPDATE', teacher.id)}>
                        <FaEdit size={18} color='black' />
                    </IconButton>
                </StyledTableCell>

                <StyledTableCell >
                    <IconButton color='error'  onClick={() => { }}>
                        <FaTrash color='black' size={17} />
                    </IconButton>
                </StyledTableCell>
            </StyledRowTabel>
        );
    })

    return (
        <Container className='mt-4 p-0'>
            <Row className='justify-content-center'>
                <Col xs={12} md={11}>
                    <Card className='teacherCard' style={{ background: 'transparent', border: '2px solid black' }}>
                        <CardHeader className={styles.cardHeader} >
                            <Row>
                                <Col xs={12} md={6}>
                                    <Row className='g-2'>
                                        <Col xs={6}>
                                            <StyledFeedbackButton startIcon={<FaUserPlus size={17} />} onClick={() => toggle('ADD')} >
                                                {t('add')}
                                            </StyledFeedbackButton>
                                        </Col>
                                        <Col xs={6}>
                                            <StyledFeedbackButton startIcon={<FaPrint size={17}  />} onClick={() => printTeachers()} >
                                                {t('print')}
                                            </StyledFeedbackButton>
                                        </Col>
                                    </Row>
                                </Col>
                            </Row>
                        </CardHeader>
                        <CardBody>
                            <div className='scroll-content'>
                                <TableContainer>
                                    <Table>
                                        <EnhancedTabelHead
                                            order={order}
                                            headCells={headCells}
                                            orderBy={orderBy}
                                            onRequestSort={handleRequestSort}
                                        />
                                        <TableBody>
                                            {teachersRow}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <TeacherModal isOpen={isOpen} toggle={toggle} operationToDo={operationToDo}
                token={user.token} add_upd_teacher={add_upd_teacher}
                updateUser={updTeacher} reset_after_error={reset_after_error} />


            <ErrorModal isOpen={isOpenDelete} toggle={toggleDelete}
                _delete={() => deleteTeacher(delID, token)}
                reset_after_error={reset_after_error} />

            <Report isOpen={isReportOpen} toggle={toggleReport}
                action={Action_Types.TEACHER_REPORT} token={token}
                userId={user.data.id} targetUserID={report_teacher_id}
            />
        </Container>
    )


}

// class Teacher extends Component {

//     constructor(props) {
//         super(props);

//         this.state = {
//             isOpen: false,
//             updTeacher: {},
//             isOpenDelete: false,
//             isReportOpen: false,
//             delID: '',
//             report_teacher_id: ''
//         }
//         this.toggle = this.toggle.bind(this);
//         this.toggleDelete = this.toggleDelete.bind(this);
//         this.toggleReport = this.toggleReport.bind(this);
//     }

//     componentDidMount() {
//         if (!this.props.teachers.loading && !this.props.teachers.error && this.props.teachers.teachers.length === 0) {
//             this.props.getTeachers(this.props.user.token);
//         }
//     }


//     toggle(opr, id) {
//         //console.log(opr);
//         let o;
//         opr !== undefined ? o = opr : o = '';
//         let updTeacher = {}
//         if (id) {
//             updTeacher = this.props.teachers.teachers.filter(teacher => teacher.id === id)[0];
//         }
//         this.setState({
//             isOpen: !this.state.isOpen,
//             operationToDo: o,
//             updTeacher: updTeacher
//         });
//     }

//     toggleDelete(event, id) {
//         this.setState({
//             isOpenDelete: !this.state.isOpenDelete,
//             delID: id ? id : ''
//         })
//     }

//     toggleReport(event, id = '') {
//         this.setState({
//             isReportOpen: !this.state.isReportOpen,
//             report_teacher_id: id
//         });
//         //send api call for the server to get files for specific teacher
//         if (id !== '') {
//             this.props.getFilesReport(id, this.props.user.token)
//         }
//     }

//     render() {

//         if (this.props.teachers.loading) {
//             return (
//                 <CardTableLoading />
//             );
//         }
//         else if (this.props.teachers.error) {
//             //Component to show error and button to refresh the view//
//             return (
//                 <Error refresh={this.props.refreshTeachers} />
//             );
//         } else {
//             const teachersRow = this.props.teachers.teachers.map((teacher) => {
//                 return (
//                     <tr key={teacher.id}>
//                         <td> {teacher.id} </td>
//                         <td> {teacher.firstname + ' ' + teacher.lastname} </td>
//                         <td> {teacher.phone} </td>
//                         <td> {teacher.email} </td>
//                         <td> {teacher.username} </td>
//                         <td className={'text-center'}><button className={styles.tabelBtn} onClick={() => this.toggleReport(null, teacher.id)}> <FaFile /> </button></td>
//                         <td className={'text-center'}><button className={styles.tabelBtn} onClick={() => this.toggle('UPDATE', teacher.id)}> <FaEdit /> </button></td>
//                         <td className={'text-center'}><button className={styles.tabelBtn} onClick={() => this.toggleDelete(null, teacher.id)}> <FaTrashAlt /> </button></td>
//                     </tr>
//                 );
//             })

//             const TeacherCard = ({ }) => {
//                 const { t } = useTranslation();
//                 return (
//                     <Container className='mt-4'>
//                         <Row className='justify-content-start'>
//                             <Col xs={12}>
//                                 <Card className='teacherCard' style={{ background: 'transparent', border: '2px solid black' }}>
//                                     <CardHeader className={styles.cardHeader} >
//                                         <FormGroup row>
//                                             <Col xs={'auto'}>
//                                                 <Button className={styles.htableBtn} onClick={() => this.toggle('ADD')} > <FaUserPlus /> {t('add')}  </Button>
//                                             </Col>
//                                             <Col xs={'auto'}>
//                                                 <Button className={styles.htableBtn}> <FaPrint /> {t('print')} </Button>
//                                             </Col>
//                                             <Col xs={'auto'} className={this.props.direction === DIRECTIONS.LTR ? 'ms-md-auto' : 'me-md-auto'}>
//                                                 <Button className={styles.htableBtn}> <FaSortAmountDown /> {t('sort')}  </Button>
//                                             </Col>
//                                         </FormGroup>
//                                     </CardHeader>
//                                     <CardBody>
//                                         <div className='scroll-content'>
//                                             <Table hover responsive className={styles.teacherTable} >
//                                                 <thead>
//                                                     <tr>
//                                                         <th className={this.props.direction === DIRECTIONS.LTR ? 'firstTh' : 'lastTh'}>
//                                                             {t('id')}
//                                                         </th>
//                                                         <th>
//                                                             {t('fullname')}
//                                                         </th>
//                                                         <th>
//                                                             {t('phone')}
//                                                         </th>
//                                                         <th>
//                                                             {t('email')}
//                                                         </th>
//                                                         <th>
//                                                             {t('username')}
//                                                         </th>
//                                                         <th>
//                                                             {t('report')}
//                                                         </th>
//                                                         <th>
//                                                             {t('update')}
//                                                         </th>
//                                                         <th className={this.props.direction === DIRECTIONS.LTR ? 'lastTh' : 'firstTh'}>
//                                                             {t('delete')}
//                                                         </th>
//                                                     </tr>
//                                                 </thead>
//                                                 <tbody>
//                                                     {teachersRow}
//                                                 </tbody>
//                                             </Table>
//                                         </div>
//                                     </CardBody>
//                                 </Card>
//                             </Col>
//                         </Row>
//                         <TeacherModal isOpen={this.state.isOpen} toggle={this.toggle} operationToDo={this.state.operationToDo}
//                             token={this.props.user.token} add_upd_teacher={this.props.add_upd_teacher}
//                             updateUser={this.state.updTeacher} reset_after_error={this.props.reset_after_error} />


//                         <ErrorModal isOpen={this.state.isOpenDelete} toggle={this.toggleDelete}
//                             _delete={() => this.props.deleteTeacher(this.state.delID, this.props.user.token)}
//                             reset_after_error={this.props.reset_after_error} />

//                         <Report isOpen={this.state.isReportOpen} toggle={this.toggleReport}
//                             action={Action_Types.TEACHER_REPORT} token={this.props.user.token}
//                             userId={this.props.user.data.id} targetUserID={this.state.report_teacher_id}
//                         />
//                     </Container>
//                 );
//             }
//             return (<TeacherCard />)
//         }
//     }

//}
export default withDirection(connect(mapStateToProps, mapDispacthToProps)(Teachers));

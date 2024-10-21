import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaEdit, FaFile, FaPrint, FaSearch, FaTrash, FaTrashAlt, FaUserPlus } from 'react-icons/fa';
import { connect } from 'react-redux';
import { Button, Card, CardBody, CardHeader, Col, Container, Row } from 'reactstrap';
import { addUpdStudent, getAllStudents, getFilesForReport, printStudents, reset_after_error } from '../../redux/ActionCreators';
import CardTableLoading from '../loadingComponents/CardTableLoading';
import Error from '../error/errorComponent';
import { filterStudents, getComparator, stableSort } from '../services';
import { IconButton, Table, TableBody, TableContainer } from '@mui/material';
import EnhancedTabelHead, { StyledTableCell, StyledRowTabel, StyledFeedbackButton, Search, SearchIconWrapper, StyledInputBase } from '../materialUiOverride';
import Report from '../report/ReportComponent';
import { STUDENT_REPORT, UPDATE } from '../../redux/ActionTypes';
import StudentForm from './StudentForm';


const mapStateToProps = (state) => ({
    students: state.students
});

const mapDispacthToProps = (dispatch) => ({
    getStudents: (token) => dispatch(getAllStudents(token)),
    getFilesReport: (id, token) => dispatch(getFilesForReport(id, token)),
    addUpdStudent: (student, type, token, setSubmitting) => dispatch(addUpdStudent(student, type, token, setSubmitting)),
    reset_after_error: () => dispatch(reset_after_error()),
    printStudents: () => dispatch( printStudents() )
})

const Students = ({ students, getStudents, token, getFilesReport, user, addUpdStudent,
     reset_after_error, printStudents }) => {

    //api call to retreive all students
    useEffect(() => getStudents(token), []);
    const { t } = useTranslation();
    const [state, setState] = useState({
        searchValue: '',
        isOpenReport: false,
        targetUserID: ''
    });

    //state for add||update form modal
    const [addUpdState, setAddUpdState] = useState({
        isOpen: false,
        updStudent: {},
        operation: ''
    });

    const toggleFormModal = (e, opr) => {
        setAddUpdState({ ...addUpdState, isOpen: !addUpdState.isOpen, operation: opr, updStudent: {} });
    }

    const toggleUpdateStudent = (e, id = '') => {
        let updStudent = {};
        if (id) {
            updStudent = students.students.find(std => std.id === id);
        }
        setAddUpdState({ ...addUpdState, isOpen: !addUpdState.isOpen, operation: UPDATE, updStudent: updStudent });
    }

    const toggleReport = (e, id = '') => {
        if (id) {
            getFilesReport(id, token);
        }
        setState({ ...state, isOpenReport: !state.isOpenReport, targetUserID: id });
    }

    const [order, setOrder] = React.useState('asc');
    const [orderBy, setOrderBy] = React.useState('id');

    /**search state */
    const [searchValue, setSearchValue] = useState('');
    const [searchClicked, setSearchClicked] = useState(false);

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };
    const rowsToRender = React.useMemo(
        () => {
            if (students.students) {
                const filteredStudents = filterStudents(students.students, searchValue);
                return stableSort( filteredStudents.slice(), getComparator(order, orderBy)).slice()
            }
        },
        [order, orderBy, students.students, searchValue]
    );

    if (students.isLoading)
        return <CardTableLoading />
    if (students.error)
        return <Error refresh={() => getStudents(token)} />
    else {

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
        ]

        return (
            <>
                <Container className='mt-4' fluid>
                    <Row className='justify-content-center'>
                        <Col xs={12} md={11}>
                            <Card className='teacherCard' style={{ background: 'transparent', border: '2px solid black' }}>
                                <CardHeader className={'card_header'}>
                                    <Row className='justify-content-between'>
                                        <Col xs={12} md={6}>
                                            <Row className='g-2'>
                                                <Col xs={6}>
                                                    <StyledFeedbackButton startIcon={<FaUserPlus size={17} />} onClick={() => toggleFormModal(null, 'ADD')} >
                                                        {t('add')}
                                                    </StyledFeedbackButton>
                                                </Col>
                                                <Col xs={6}>
                                                    <StyledFeedbackButton
                                                     startIcon={<FaPrint size={17} />}
                                                     onClick={() => printStudents()}
                                                     >
                                                        {t('print')}
                                                    </StyledFeedbackButton>
                                                </Col>
                                            </Row>
                                        </Col>

                                        <Col xs={'auto'} className='mt-2 mt-md-0'>
                                                    <Search
                                                    onClick={() => setSearchClicked(true)}
                                                    onBlur={() => setSearchClicked(false)}
                                                    >
                                                        <SearchIconWrapper>
                                                            <FaSearch />
                                                        </SearchIconWrapper>
                                                        <StyledInputBase
                                                        value={searchValue}
                                                        onChange={(event) => setSearchValue(event.target.value)}
                                                        placeholder={searchClicked ? t('searchStudents') : ''}
                                                        />
                                                    </Search>
                                        </Col>
                                    </Row>

                                </CardHeader>
                                <CardBody>
                                    <div className='scroll-content'>
                                        <TableContainer>
                                            <Table >
                                                <EnhancedTabelHead
                                                    order={order}
                                                    headCells={headCells}
                                                    orderBy={orderBy}
                                                    onRequestSort={handleRequestSort}
                                                />
                                                <TableBody>
                                                    {rowsToRender.map(student => (
                                                        <StyledRowTabel
                                                            hover
                                                            key={student.id}
                                                        >
                                                            <StyledTableCell
                                                                align='center'
                                                            >
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
                                                            <StyledTableCell
                                                                align='center'
                                                            >
                                                                {student.username}
                                                            </StyledTableCell>

                                                            <StyledTableCell
                                                                align='center'
                                                                size={"small"}
                                                            >
                                                                <IconButton onClick={() => toggleReport(null, student.id)}>
                                                                    <FaFile size={17} color='black' />
                                                                </IconButton>
                                                            </StyledTableCell>

                                                            <StyledTableCell
                                                                align='center'
                                                                size={'small'}
                                                            >
                                                                <IconButton onClick={() => toggleUpdateStudent(null, student.id)}>
                                                                    <FaEdit size={18} color='black' />
                                                                </IconButton>
                                                            </StyledTableCell>

                                                            <StyledTableCell
                                                                align='center'
                                                                size={'small'}
                                                            >
                                                                <IconButton color='error' onClick={() => this.toggle('UPDATE', student.id)}>
                                                                    <FaTrash color='black' size={17} />
                                                                </IconButton>
                                                            </StyledTableCell>
                                                        </StyledRowTabel>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    </Row>
                </Container>

                <Report toggle={toggleReport} action={STUDENT_REPORT}
                    token={token} userId={user.data.id} targetUserID={state.targetUserID} isOpen={state.isOpenReport}
                    reset_after_error={reset_after_error} isStudent
                />
                <StudentForm isOpen={addUpdState.isOpen} toggle={toggleFormModal} operationToDo={addUpdState.operation}
                    addUpdStudent={addUpdStudent} reset_after_error={reset_after_error} updateUser={addUpdState.updStudent} />
            </>
        )
    }
}

export default connect(mapStateToProps, mapDispacthToProps)(Students);


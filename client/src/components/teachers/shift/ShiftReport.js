import { Autocomplete, Checkbox, IconButton, Table, TableBody, TableContainer, TablePagination, Typography } from '@mui/material';
import React from 'react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Col, Container, Row } from 'reactstrap';
import EnhancedTabelHead, { StyledRowTabel, StyledTableCell, StyledTextField, layout, mobilePaper } from '../../materialUiOverride';
import { FaEdit, FaMapMarkerAlt, FaPrint, FaRegClock, FaSearch, FaTrash } from 'react-icons/fa';
import { GetTimeFromDateAsHoursAndMin, formatDateTime, formatDateTimeWithoutYear, formatTheDate, formatTheTime, getComparator, getDifferenceInMinutes, getFirstAndLastDayOfMonth, getShiftHours, stableSort } from '../../services';
import { MobileDatePicker } from '@mui/x-date-pickers';
import dayjs from 'dayjs';
import { useEffect } from 'react';
import { connect } from 'react-redux';
import { deleteShift, getShifts, getTeachersForShiftReport, printShifts, shiftNote, updateShift } from '../../../redux/ActionCreators';
import Restricted from '../../../permissions/Restricted';
import * as Permissions from '../../../permissions/permissionTypes';
import TableLoading from '../../loadingComponents/TableLoading';
import NoteModal from './NoteModal';
import PropTypes from 'prop-types';
import LocationModal from './LocationModal';
import EditShiftModal from './EditShiftModal';
import ErrorModal from '../../errorModal/errorModalComponent';
import { reset_after_error } from '../../../redux/ActionCreators';

const mapStateToProps = (state) => ({
    teachers: state.teachers.teachers,
    shifts: state.shifts
});

const mapDispacthToProps = (dispacth) => ({
    getTeachersForShiftReport: () => dispacth(getTeachersForShiftReport()),
    getShifts: (start_date, end_date) => dispacth(getShifts(start_date, end_date)),
    shift_note: (shift_note) => dispacth(shiftNote(shift_note)),
    updateShift: (new_start_shift, old_start_shift, end_shift, teacher_id, setSubmitting) => dispacth(updateShift(new_start_shift, old_start_shift, end_shift, teacher_id, setSubmitting)),
    deleteShift: (teacher_id, start_shift) => dispacth(deleteShift(teacher_id, start_shift)),
    printShifts: (startDate, endDate, teacherIds) => dispacth(printShifts(startDate, endDate, teacherIds))
})

const ShiftReport = ({ teachers, getTeachersForShiftReport, shifts, getShifts, shift_note, teacher,
    updateShift, printShifts, deleteShift }) => {
    const { t } = useTranslation();
    const [fromDate, setFromDate] = useState();
    const [toDate, setToDate] = useState();
    const [selectedTeachers, setSelectedTeachers] = useState([]);

    //state & toggle func for delete modal
    const [isDelOpen, setDelOpen] = useState(false)
    const [delFunc, setDelFunc] = useState({})
    const toggleDelModal = (event, teacher_id, start_shift) => {
        setDelOpen(!isDelOpen)

        // the modal opened to delete specific shift
        if (teacher_id && start_shift)
            setDelFunc({
                delete: () => deleteShift(teacher_id, start_shift)
            })

    }

    useEffect(() => {
        getTeachersForShiftReport();

        //set the range to be the current month
        const firstLastArr = getFirstAndLastDayOfMonth();
        getShifts(firstLastArr[0], firstLastArr[1]);

        setFromDate(dayjs(firstLastArr[0]));
        setToDate(dayjs(firstLastArr[1]));

    }, []);

    //state for table
    const [order, setOrder] = useState('desc');
    const [orderBy, setOrderBy] = useState('start_shift');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(7);
    const [totalRows, setTotalRows] = useState(0);

    /**shifts that need to be displayed not only the slice piece */
    const [totalShifts, setTotalShifts] = useState([]);


    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleRequestSort = (event, property) => {
        const isAsc = orderBy === property && order === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    //note state and functions
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    const [selectedShift, setSelectedShift] = useState({});
    const [viewMode, setViewMode] = useState(false);

    //location modal state
    const [isLocationOpen, setIsLocationOpen] = useState(false);
    /**passs the location to the map */
    const [startLocation, setStartLocation] = useState({});
    const [endLocation, setEndLocation] = useState({});
    const toggleLocation = () => setIsLocationOpen(!isLocationOpen);

    //edit shift state
    const [isEditShiftOpen, setIsEditShiftOpen] = useState(false);
    const toggleEditShift = () => setIsEditShiftOpen(!isEditShiftOpen);

    const [start_shift, setStartShift] = useState(null);
    const [end_shift, setEndShift] = useState(null);
    const [teacher_id, setTeacherId] = useState('');
    const [teacher_name, setTeacherName] = useState('');

    // Avoid a layout jump when reaching the last page with empty rows.
    const emptyRows = page > 0 ? Math.max(0, (1 + page) * rowsPerPage - shifts.shifts.length) : 0;

    const visibleRows = React.useMemo(
        () => {
            const arr = stableSort(shifts.shifts, getComparator(order, orderBy)).filter(shift => {
                if (selectedTeachers.length > 0) {
                    const res = selectedTeachers.find(teacher => teacher.id === shift.teacher_id);
                    if (res)
                        return true;
                    return false;
                } else {
                    return true;
                }
            });
            setTotalRows(arr.length);
            setTotalShifts(arr);
            return arr.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            )
        },
        [order, orderBy, page, rowsPerPage, shifts.shifts, selectedTeachers],
    );

    const getTotalShiftsHours = () => {
        let totalMintes = 0;
        totalShifts.forEach(shift => totalMintes += getDifferenceInMinutes(shift.start_shift, shift.end_shift));

        const hours = Math.floor(totalMintes / 60);
        let min = totalMintes % 60;

        if (min < 10)
            min = `0${min}`;

        return `${hours}:${min}`;
    }

    /**format start shift to proper format
     * if from \ to is same year then show only dd-mm
     * else show as dd-mm-yyyy
     */
    const formatStartShift = (start) => {
        if (!start)
            return '';

        const from = new Date(formatDateTime(fromDate));
        const to = new Date(formatDateTime(toDate));

        if (from.getFullYear() === to.getFullYear())
            return formatDateTimeWithoutYear(start);

        return formatDateTime(start);
    }

    /**
     * format end shift if start and end shift in the same day && month then return hour when ended hh:mm
     * otherwise return the the format of dd-mm hh:mm
     */
    const formatEndShift = (start_shift, end_shift) => {
        if (!start_shift || !end_shift)
            return '';

        const from = new Date(formatDateTime(start_shift));
        const to = new Date(formatDateTime(end_shift));

        if (from.getMonth() === to.getMonth() && from.getDay() === to.getDay())
            return GetTimeFromDateAsHoursAndMin(end_shift);

        return formatDateTimeWithoutYear(end_shift);
    }

    /**handle print request to the server */
    const handlePrintRequest = () => {
        if (teacher.role === 't')
            printShifts(formatTheDate(fromDate), formatTheDate(toDate), [teacher.id]);
        else {
            //for manager check the teachers selected, if none then pass all teachers id's
            let teachersIds = [];

            if (selectedTeachers.length > 0)
                teachersIds = selectedTeachers.map(teacher => teacher.id);
            else
                teachersIds = teachers.map(teacher => teacher.id);

            printShifts(formatTheDate(fromDate), formatTheDate(toDate), teachersIds);
        }
    }


    const headCells = [
        {
            id: 'firstname',
            numeric: false,
            label: t('fullname'),
            isSort: true
        },
        {
            id: 'start_shift',
            numeric: false,
            label: t('start_shift'),
            isSort: true
        },
        {
            id: 'end_shift',
            numeric: false,
            label: t('end_shift'),
            isSort: true
        },
        {
            id: 'totalTime',
            numeric: false,
            label: t('totalTime'),
            isSort: false
        },
        {
            id: 'shift_note',
            numeric: false,
            label: t('note'),
            isSort: false
        },
        {
            id: 'location',
            numeric: false,
            label: t('location'),
            isSort: false
        },
        {
            id: 'shiftTime',
            numeric: false,
            label: t('time'),
            isSort: false
        },
        {
            id: 'deleteShift',
            numeric: false,
            label: t('delete'),
            isSort: false
        }
    ];

    if (teacher.role === 't') { headCells.shift(); headCells.pop(); headCells.pop() }


    const renderRows = visibleRows.map(shift => (
        <StyledRowTabel hover key={shift.teacher_id + ' ' + shift.start_shift} >
            <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>

                <StyledTableCell>
                    {shift.firstname + ' ' + shift.lastname}
                </StyledTableCell>
            </Restricted>

            <StyledTableCell>
                {formatStartShift(shift.start_shift)}
            </StyledTableCell>

            <StyledTableCell>
                {formatEndShift(shift.start_shift, shift.end_shift)}
            </StyledTableCell>

            <StyledTableCell>
                {getShiftHours(shift.start_shift, shift.end_shift)}
            </StyledTableCell>

            <StyledTableCell padding='none'>
                <IconButton
                    disabled={shift.teacher_id !== teacher.id && !shift.shift_note}
                    color={shift.shift_note ? 'success' : 'primary'}
                    onClick={() => {
                        if (shift.teacher_id !== teacher.id)
                            setViewMode(true);
                        else
                            setViewMode(false);
                        toggle();
                        setSelectedShift(shift);
                    }}
                >
                    <FaEdit size={18} />
                </IconButton>
            </StyledTableCell>

            <StyledTableCell padding='none'>
                <IconButton
                    onClick={() => {
                        setStartLocation(
                            {
                                start_longitude: shift.start_longitude,
                                start_latitude: shift.start_latitude
                            });

                        setEndLocation({
                            end_longitude: shift.end_longitude,
                            end_latitude: shift.end_latitude
                        });
                        toggleLocation();
                        setSelectedShift(shift);
                    }}
                    color='primary'>
                    <FaMapMarkerAlt size={18} />
                </IconButton>
            </StyledTableCell>

            <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                <StyledTableCell padding='none'>
                    <IconButton
                        onClick={() => {
                            setStartShift(shift.start_shift);
                            setEndShift(shift.end_shift);
                            setTeacherId(shift.teacher_id);
                            setTeacherName(shift.firstname + ' ' + shift.lastname)
                            toggleEditShift();
                        }}
                    >
                        <FaRegClock size={18} color='black' />
                    </IconButton>
                </StyledTableCell>
            </Restricted>

            <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                <StyledTableCell padding='none'>
                    <IconButton
                        onClick={() => toggleDelModal(null, shift.teacher_id, shift.start_shift)}
                    >
                        <FaTrash size={18} color='black' />
                    </IconButton>
                </StyledTableCell>
            </Restricted>


        </StyledRowTabel>
    ));

    return (
        <Container fluid>
            <Row>
                <Col xs={1} />
                <Col xs={'auto'}>
                    <Typography variant='h5'>
                        {t('shiftReport')}
                    </Typography>
                </Col>
            </Row>

            <Row className='justify-content-center mt-3'>
                <Col xs={12} md={10}>
                    <Row>
                        <Col xs={12} md={6}>
                            <Row>
                                <Col xs={6} md={'auto'}>
                                    <MobileDatePicker
                                        label={t('from')}
                                        value={fromDate}
                                        onChange={(value) => setFromDate(value)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                margin: 'dense',
                                                fullWidth: true
                                            },
                                            mobilePaper: mobilePaper,
                                            layout: layout
                                        }}
                                    />
                                </Col>
                                <Col xs={6} md={'auto'}>
                                    <MobileDatePicker
                                        label={t('to')}
                                        value={toDate}
                                        onChange={(value) => setToDate(value)}
                                        slotProps={{
                                            textField: {
                                                size: 'small',
                                                margin: 'dense',
                                                fullWidth: true
                                            },
                                            mobilePaper: mobilePaper,
                                            layout: layout
                                        }}
                                    />
                                </Col>
                            </Row>
                        </Col>

                        <Col xs={12} md={6}>
                            <Row className='justify-content-end g-2'>

                                <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                                    <Col xs={12} md={8}>
                                        <Autocomplete
                                            multiple
                                            value={selectedTeachers}
                                            onChange={(event, value) => setSelectedTeachers(value)}
                                            options={teachers}
                                            disableCloseOnSelect
                                            getOptionLabel={(teacher) => { return teacher.firstname + ' ' + teacher.lastname }}
                                            renderOption={(props, option, { selected }) => (
                                                <li {...props}>
                                                    <Checkbox
                                                        style={{ marginRight: 8 }}
                                                        checked={selected}
                                                    />
                                                    {option.firstname + ' ' + option.lastname}
                                                </li>
                                            )}
                                            renderInput={(params) => (
                                                <StyledTextField {...params} size='small' label={t('teachers')} />
                                            )}
                                        />
                                    </Col>
                                </Restricted>

                                <Col xs='auto' className='d-flex align-items-center'>
                                    <IconButton onClick={() => getShifts(formatTheDate(fromDate), formatTheDate(toDate))}>
                                        <FaSearch size={17} color='black' />
                                    </IconButton>
                                </Col>

                                <Col xs='auto' className='d-flex align-items-center'>
                                    <IconButton onClick={handlePrintRequest}>
                                        <FaPrint size={17} color='black' />
                                    </IconButton>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <Row className='justify-content-end'>
                        <Col xs='auto'>
                            <Typography variant='body2'>
                                <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                                    {selectedTeachers.length === 1 ? t('totalShiftsHour', { totalHours: getTotalShiftsHours() }) : <></>}
                                </Restricted>

                                <Restricted to={Permissions.TEACHER_SHIFT}>
                                    {t('totalShiftsHour', { totalHours: getTotalShiftsHours() })}
                                </Restricted>
                            </Typography>
                        </Col>
                    </Row>


                    <Row className='mt-2'>
                        {!shifts.isLoading ?
                            (<Col xs={12}>
                                <TableContainer >
                                    <Table size='small' padding='checkbox'>
                                        <EnhancedTabelHead
                                            order={order}
                                            orderBy={orderBy}
                                            headCells={headCells}
                                            onRequestSort={handleRequestSort}
                                        />

                                        <TableBody>
                                            {renderRows}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                <TablePagination
                                    component={'div'}
                                    count={totalRows}
                                    rowsPerPage={rowsPerPage}
                                    page={page}
                                    onPageChange={handleChangePage}
                                    rowsPerPageOptions={[]}
                                />
                            </Col>) :
                            <Col xs={12}>
                                <TableLoading />
                            </Col>
                        }
                    </Row>
                </Col>
            </Row>

            <NoteModal isOpen={isOpen} toggle={toggle} shift_note={selectedShift.shift_note}
                shift_note_api={shift_note} start_shift={selectedShift?.start_shift} viewMode={viewMode} />

            <LocationModal isOpen={isLocationOpen} toggle={toggleLocation}
                startLocation={startLocation} endLocation={endLocation} shift={selectedShift} />

            <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                <EditShiftModal isOpen={isEditShiftOpen} toggle={toggleEditShift} start_shift={start_shift} end_shift={end_shift}
                    teacher_id={teacher_id} updateShift={updateShift} teacher_name={teacher_name} />
            </Restricted>

            <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                <ErrorModal isOpen={isDelOpen} toggle={toggleDelModal} _delete={delFunc?.delete} reset_after_error={reset_after_error} />
            </Restricted>
        </Container>
    )
}

ShiftReport.propTypes = {
    /**object contain the data for the teacher currently opened the report */
    teacher: PropTypes.object.isRequired
}

export default connect(mapStateToProps, mapDispacthToProps)(ShiftReport);
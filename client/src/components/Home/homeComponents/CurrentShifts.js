import { Button, Table, TableBody, TableContainer, TablePagination, TableRow, Typography } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import { connect } from 'react-redux';
import withDirection, { DIRECTIONS } from 'react-with-direction';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import { getCurrentShifts } from '../../../redux/ActionCreators';
import { useEffect } from 'react';
import TableLoading from '../../loadingComponents/TableLoading';
import Error from '../../error/errorComponent'
import { StyledRowTabel, StyledTabelHead, StyledTableCell } from '../../materialUiOverride';
import Restricted from '../../../permissions/Restricted';
import * as Permissions from '../../../permissions/permissionTypes';
import { formatDateTime, getShiftHours } from '../../services';
import ShiftDuration from '../../teachers/shift/ShiftDuration';
import { Link } from 'react-router-dom';

const mapStateToProps = (state) => ({
    shifts: state.shifts
});

const mapDispacthToProps = (dispacth) => ({
    getCurrentShifts: () => dispacth(getCurrentShifts())
});


const CurrentShifts = ({ direction, getCurrentShifts, shifts, user }) => {

    useEffect(() => getCurrentShifts(), []);
    const { t } = useTranslation();

    const ShiftsTable = () => {

        const headCells = [t('fullname'), t('start_shift'), t('end_shift'), t('totalTime')];
        const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(5);

        const visibleRows = useMemo(() => {
            return shifts.shifts.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            )
        }, [shifts.shifts]);

        const handleChangePage = (event, newPage) => setPage(newPage)

        if (user?.role === 'm')
            headCells.splice(2, 1);

        if (visibleRows.length === 0)
            return (
                <Row className='justify-content-center align-items-center h-100'>
                    <Col xs='auto'>
                        <Typography variant='h6'>
                            {t('noShifts')}
                        </Typography>
                    </Col>
                </Row>
            )

        return (
            <>
                <TableContainer>
                    <Table size='small'>
                        <StyledTabelHead>
                            <TableRow>
                                {headCells.map(cell => (
                                    <StyledTableCell
                                        key={cell}>
                                        {cell}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </StyledTabelHead>

                        <TableBody>
                            {visibleRows.map(shift => (
                                <StyledRowTabel hover key={shift.start_shift}>
                                    <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                                        <StyledTableCell>
                                            {shift.firstname + ' ' + shift.lastname}
                                        </StyledTableCell>
                                    </Restricted>

                                    <StyledTableCell>
                                        {formatDateTime(shift.start_shift)}
                                    </StyledTableCell>

                                    <Restricted to={Permissions.VIEW_SHIFT_END_TIME}>
                                        <StyledTableCell>
                                            {formatDateTime(shift.end_shift)}
                                        </StyledTableCell>
                                    </Restricted>

                                    <StyledTableCell>
                                        <Restricted to={Permissions.VIEW_SHIFT_END_TIME}>
                                            {getShiftHours(shift.start_shift, shift.end_shift)}
                                        </Restricted>

                                        <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                                            <ShiftDuration shift_start={shift.start_shift} />
                                        </Restricted>
                                    </StyledTableCell>

                                </StyledRowTabel>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component={'div'}
                    count={shifts.shifts.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    rowsPerPageOptions={[]}
                />
            </>
        )
    }

    return (
        <Card className='mycard h-100'>
            <CardHeader className='p-1'>
                <Row className='justify-content-between'>
                    <Col xs='auto' className={`d-flex flex-column justify-content-center ${direction === DIRECTIONS.LTR ? 'ps-3' : 'pe-3'}`}>
                        <Typography variant='body2'>
                            {t('shifts')}
                        </Typography>
                    </Col>

                    <Col xs='auto'>
                        <Button variant='text' component={Link} to='/shift/reports'>
                            <Row className='g-1'>
                                <Col xs='auto'>
                                    <Typography variant='caption'>
                                        {t('moveToShifts')}
                                    </Typography>
                                </Col>

                                <Col xs='auto'>
                                    {DIRECTIONS.RTL === direction ? <FaArrowLeft size={14} /> : <FaArrowRight size={14} />}
                                </Col>
                            </Row>
                        </Button>
                    </Col>
                </Row>
            </CardHeader>

            <CardBody className='p-1'>
                {
                    shifts.isLoading ? <TableLoading /> :
                        shifts.error ? <Error refresh={() => getCurrentShifts()} /> :
                            <ShiftsTable />
                }
            </CardBody>
        </Card>
    )
}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(CurrentShifts));
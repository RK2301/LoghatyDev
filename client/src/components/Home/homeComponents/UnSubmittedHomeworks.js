import React, { useEffect } from "react";
import PropTypes from 'prop-types';
import { Card, CardBody, CardHeader } from "reactstrap";
import { useTranslation } from "react-i18next";
import { connect } from "react-redux";
import { getUnSubmittedHomeworks } from "../../../redux/ActionCreators";
import TableLoading from "../../loadingComponents/TableLoading";
import Error from "../../error/errorComponent";
import { IconButton, Table, TableBody, TableContainer, TablePagination, TableRow, Typography, useMediaQuery } from "@mui/material";
import { StyledRowTabel, StyledTabelHead, StyledTableCell } from "../../materialUiOverride";
import { useState } from "react";
import { useMemo } from "react";
import { formatDateTime, formatDateTimeWithoutYear } from "../../services";
import RemainTime from "../../courses/courseDetailsComponents/RemainTime";
import { FaDownload } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useTheme } from "@emotion/react";

const mapStateToProps = (state) => ({
    unSubmittedHomeworks: state.unSubmittedHomeworks
});

const mapDispacthToProps = (dispacth) => ({
    getUnSubmittedHomeworks: () => dispacth(getUnSubmittedHomeworks())
});

const UnSubmittedHomeworks = ({ unSubmittedHomeworks, getUnSubmittedHomeworks }) => {

    useEffect(() => getUnSubmittedHomeworks(), []);
    const { t } = useTranslation();


    const HomeworksTable = ({ }) => {

        const headCells = ['', t('startDate'), t('submitTime'), t('remainTime')
        //  t('submit')
        ];
        const [page, setPage] = useState(0);
        const [rowsPerPage, setRowsPerPage] = useState(5);

        const visibleRows = useMemo(() => {
            return unSubmittedHomeworks.homeworks.slice(
                page * rowsPerPage,
                page * rowsPerPage + rowsPerPage,
            )
        }, [unSubmittedHomeworks.homeworks]);
        const theme = useTheme();
        const [isMobile, setIsMobile] = useState(useMediaQuery(theme.breakpoints.down('md')));

        if (unSubmittedHomeworks.homeworks.length === 0)
            return (
                <div className='d-flex justify-content-center align-content-center h-100'>
                    <Typography>
                        {t('noUpcomingSubmittes')}
                    </Typography>
                </div>
            )

        return (
            <div className="h-100" style={{ overflowY: 'scroll' }}>
                <TableContainer>
                    <Table size='small' >
                        <StyledTabelHead >
                            <TableRow>
                                {headCells.map(cell => (
                                    <StyledTableCell key={cell} padding={isMobile ? 'normal' : 'none'}>
                                        {cell}
                                    </StyledTableCell>
                                ))}
                            </TableRow>
                        </StyledTabelHead>

                        <TableBody>
                            {visibleRows.map(homework => (
                                <StyledRowTabel hover>
                                    <StyledTableCell padding={isMobile ? 'normal' : 'none'}>
                                        {homework.hw_title}
                                    </StyledTableCell>

                                    <StyledTableCell padding={isMobile ? 'normal' : 'none'}>
                                        {formatDateTime(homework.upload_time)}
                                    </StyledTableCell>

                                    <StyledTableCell padding={isMobile ? 'normal' : 'none'}>
                                        {formatDateTimeWithoutYear(homework.submit_time)}
                                    </StyledTableCell>

                                    <StyledTableCell padding={isMobile ? 'normal' : 'none'}>
                                        <RemainTime submit_time={homework.submit_time} small />
                                    </StyledTableCell>

                                    {/* <StyledTableCell padding='none'>
                                        <IconButton
                                            color='primary'
                                            component={Link}
                                            to={`/courseDetails/${homework.course_id}/hw/${homework.unit_id}`}>
                                            <FaDownload size={15} />
                                        </IconButton>
                                    </StyledTableCell> */}

                                </StyledRowTabel>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    component='div'
                    count={unSubmittedHomeworks.homeworks.length}
                    page={page}
                    rowsPerPage={rowsPerPage}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    rowsPerPageOptions={[]}
                    padding='none'
                />
            </div>
        )
    }

    return (
        <Card className='mycard h-100'>
            <CardHeader>
                <strong>
                    {t('unSubmittedHomeworks')}
                </strong>
            </CardHeader>

            <CardBody className="p-1 h-100" >
                {unSubmittedHomeworks.isLoading ? <TableLoading heigh={'30vh'} /> :
                    unSubmittedHomeworks.error ? <Error refresh={() => getUnSubmittedHomeworks()} /> :
                        <HomeworksTable />
                }
            </CardBody>
        </Card>
    )
}

export default connect(mapStateToProps, mapDispacthToProps)(UnSubmittedHomeworks);
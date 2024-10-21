import React from "react";
import PropTypes from 'prop-types';
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import Restricted from "../../../permissions/Restricted";
import * as Permissions from '../../../permissions/permissionTypes';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { connect } from "react-redux";
import { getTeachersYearHours } from "../../../redux/ActionCreators";
import TableLoading from "../../loadingComponents/TableLoading";
import Error from "../../error/errorComponent";
import { useEffect } from "react";
import { useState } from "react";
import { Autocomplete, Divider, TextField, Typography } from "@mui/material";
import withDirection, {DIRECTIONS} from "react-with-direction";

const mapStateToProps = (state) => ({
    teachersYearHours: state.teachersYearHours
});

const mapDispacthToProps = (dispacth) => ({
    getTeachersYearHours: () => dispacth(getTeachersYearHours())
});

const ShiftBarChart = ({ teachersYearHours, getTeachersYearHours, user, direction }) => {

    useEffect(() => getTeachersYearHours(), []);
    const [selectedTeacher, setSelectedTeacher] = useState({});
    const { t } = useTranslation();

    const CustomToolTip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;

            return (
                <div>
                    <Typography variant='body2'> {data.month} </Typography>
                    <Divider />
                    <Typography variant='body2'>  {t('hours') + ': ' + data.total} </Typography>
                </div>
            );
        }
        return null;
    }

    const HoursChart = ({ }) => {

        const [teacherChartData, setTeacherChartData] = useState([]);
        useEffect(() => {
            if (Object.keys(selectedTeacher).length === 0) {
                setSelectedTeacher(teachersYearHours.teachers.find(teacher => teacher.id === user.id) || {});
                setTeacherChartData(teachersYearHours.yearHours.find(teacherData => teacherData.id === user.id)?.hours);
            } else {
                setTeacherChartData(teachersYearHours.yearHours.find(teacherData => teacherData.id === selectedTeacher.id)?.hours);
            }
        }, []);

        if (!teacherChartData || teacherChartData.length === 0)
            return (
                <div className="d-flex justify-content-center align-items-center h-100">
                    <Typography>
                        {t('noHoursToDisplay')}
                    </Typography>
                </div>
            )

        return (
            <ResponsiveContainer width={'100%'} >
                <BarChart data={teacherChartData} >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" reversed={direction === DIRECTIONS.LTR ? false : true} />
                    <YAxis orientation={direction === DIRECTIONS.LTR ? 'left' : 'right'} />
                    <Tooltip content={<CustomToolTip />} />
                    <Bar dataKey="total" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        )
    }

    return (
        <Card className="mycard h-100">
            <CardHeader className="p-2">
                <Row className="justify-content-between">
                    <Col xs='auto' className="d-flex align-items-center">
                        {t('teacherHours')}
                    </Col>

                    <Restricted to={Permissions.MANAGE_TEACHERS_SHIFTS}>
                        <Col xs={6} md={4}>
                            {/**teacher auto complete */}
                            <Autocomplete
                                value={selectedTeacher}
                                disableClearable
                                onChange={(event, newVal) => setSelectedTeacher(newVal)}
                                options={teachersYearHours.teachers}
                                getOptionLabel={(option) => option.fullname || ''}
                                isOptionEqualToValue={(option, value) => option?.id === value.id}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size='small'
                                        variant="standard"
                                        placeholder={t('teacher')}
                                        inputProps={{
                                            ...params.inputProps,
                                            autoComplete: 'new-password', // disable autocomplete and autofill
                                        }}
                                    />
                                )}
                            />
                        </Col>
                    </Restricted>
                </Row>
            </CardHeader>

            <CardBody className="p-1 h-100">
                {teachersYearHours.isLoading ? <TableLoading heigh={'30vh'} /> :
                    teachersYearHours.error ? <Error refresh={() => getTeachersYearHours()} /> :
                        <HoursChart />
                }
            </CardBody>
        </Card>
    )
}

ShiftBarChart.propTypes = {
    /**object cotain current use data like name and id */
    user: PropTypes.object.isRequired
}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(ShiftBarChart));
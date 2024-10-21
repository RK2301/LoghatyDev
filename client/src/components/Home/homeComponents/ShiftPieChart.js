import React, { useCallback, useState } from "react";
import PropTypes from 'prop-types';
import { connect } from "react-redux";
import { useTranslation } from "react-i18next";
import { Card, CardBody, CardHeader, Col, Row } from "reactstrap";
import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { useMediaQuery, useTheme } from "@mui/material";
import { useEffect } from "react";
import { getTop5Teachers } from "../../../redux/ActionCreators";
import { use } from "i18next";
import TableLoading from "../../loadingComponents/TableLoading";
import Error from "../../error/errorComponent";

const mapStateToProps = (state) => ({
    top5Teachers: state.top5Teachers
});

const mapDispacthToProps = (dispacth) => ({
    getTop5Teachers: () => dispacth( getTop5Teachers() )
});


const ShiftPieChart = ({top5Teachers, getTop5Teachers }) => {

    useEffect( () => getTop5Teachers(), []);

    const theme = useTheme();
    const [isMobile, setIsMobile] = useState( useMediaQuery(theme.breakpoints.down('md')) );
    const colors = ['#0288d1', '#ab47bc', '#f57c00', '#388e3c', '#d32f2f'];
    // const data = [{ name: 'rami khattab', hours: 120 }, { name: 'test', hours: 90 }, { name: 'test2', hours: 90 }, { name: 'test2', hours: 70 }, { name: 'test2', hours: 50 }];

    const { t } = useTranslation();

    const renderActiveShape = (activeIndex) => (props) => {
        if (activeIndex === -1) return null;

        const RADIAN = Math.PI / 180;
        const {
            cx,
            cy,
            midAngle,
            innerRadius,
            outerRadius,
            startAngle,
            endAngle,
            fill,
            payload,
            percent,
            value
        } = props;
        const sin = Math.sin(-RADIAN * midAngle);
        const cos = Math.cos(-RADIAN * midAngle);
        const sx = cx + (outerRadius + 10) * cos;
        const sy = cy + (outerRadius + 10) * sin;
        const mx = cx + (outerRadius + 1) * cos;
        const my = cy + (outerRadius + 5) * sin;
        const ex = mx + (cos >= 0 ? 1 : -1) * 22;
        const ey = my;
        const textAnchor = cos >= 0 ? "start" : "end";
        return (
            <g>
                <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
                    {payload.fullname}
                </text>
                <Sector
                    cx={cx}
                    cy={cy}
                    innerRadius={innerRadius}
                    outerRadius={outerRadius}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    fill={fill}
                />
                <Sector
                    cx={cx}
                    cy={cy}
                    startAngle={startAngle}
                    endAngle={endAngle}
                    innerRadius={outerRadius + 3}
                    outerRadius={outerRadius + 6}
                    fill={fill}
                />
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    textAnchor={textAnchor}
                    fill="#333"
                >{`${value}`}</text>
                <text
                    x={ex + (cos >= 0 ? 1 : -1) * 12}
                    y={ey}
                    dy={18}
                    textAnchor={textAnchor}
                    fill="#999"
                >
                    {`(${(percent * 100).toFixed(2)}%)`}
                </text>
            </g>
        );
    };

    const PieShift = ({ }) => {
        /**five colors to show for each sector */
        const [activeIndex, setActiveIndex] = useState(-1);
        const onPieEnter = useCallback(
            (_, index) => {
                setActiveIndex(index);
            },
            [setActiveIndex]
        );
        if( top5Teachers.teacehrs.length === 0 )
          return(
              <div className="h-100 d-flex justify-content-center align-items-center">
                { t('noTeacherShifts') }
              </div>
            )

        return (
            <ResponsiveContainer>
                <PieChart>
                    <Pie
                        data={top5Teachers.teacehrs}
                        dataKey={'total'}
                        nameKey={'fullname'}
                        activeShape={renderActiveShape(activeIndex)}
                        activeIndex={activeIndex}
                        onMouseEnter={onPieEnter}
                        paddingAngle={3}
                        outerRadius={'80%'}
                        innerRadius={'60%'}
                        fill="#8884d8"
                        stroke='none'
                        strokeWidth={0}
                    >
                        {top5Teachers.teacehrs.map((entry, index) => (
                            <Cell key={index} fill={colors[index % colors.length]} />
                        ))}
                    </Pie>
                    <Legend
                        layout={isMobile ? 'horizontal' : 'vertical'}
                        align={isMobile ? 'center' : 'right'}
                        verticalAlign={isMobile ? undefined : 'middle'}
                        iconType='line'
                    />
                </PieChart>
            </ResponsiveContainer>
        )
    }

    return (
        <Card className='mycard h-100'>
            <CardHeader>
                <Row>
                    <Col xs='auto'>
                        {t('hoursCurrentMonth')}
                    </Col>
                </Row>
            </CardHeader>

            <CardBody className="p-1">
                { top5Teachers.isLoading ? <TableLoading heigh={'35vh'} /> :
                top5Teachers.error ? <Error refresh={() => getTop5Teachers()} /> :
                <PieShift />
                }
            </CardBody>
        </Card>
    )
}

ShiftPieChart.propTypes = {

}

export default connect(mapStateToProps, mapDispacthToProps)(ShiftPieChart)
import React, { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FaArrowLeft, FaArrowRight, FaBell, FaChartBar, FaPlay, FaPlayCircle, FaRegSun, FaStopCircle } from "react-icons/fa";
import { Col, Row } from "reactstrap";
import styles from './shift.module.css';
import { Link } from "react-router-dom";
import withDirection, { DIRECTIONS } from 'react-with-direction'
import { MdModeEditOutline } from "react-icons/md";
import { accessLocation } from "./shiftServices";
import { connect } from "react-redux";
import { error_state, getCurrentShift, shiftNote, start_end_shift, subscribeUser } from "../../../redux/ActionCreators";
import { START_SHIFT, END_SHIFT } from "../../../redux/messages";
import { getTheTimeFromDate } from "../../services";
import BackDropSpinner from "../../backDropSpinner/BackDropSpinner";
import { Button } from "@mui/material";
import { useState } from "react";
import NoteModal from "./NoteModal";
import ShiftDuration from "./ShiftDuration";
import ReminderModal from "./ReminderModal";
import { t } from "i18next";

const mapStateToProps = (state) => ({
    currentShift: state.currentShift
});

const mapDispacthToProps = (dispacth) => ({
    getCurrentShift: () => dispacth(getCurrentShift()),
    start_end_shift: (location, user_id, type, token, startShift) => dispacth(start_end_shift(location, user_id, type, token, startShift)),
    errorAccessLocation: (t) => dispacth(error_state({ msg: t('errorAccessLocation') })),
    shift_note: (shift_note) => dispacth(shiftNote(shift_note)),
    denyToNotify: () => dispacth( error_state( {msg: t('denyToNotify')} ) ),
    subscribeUser: (teacher_id) => dispacth( subscribeUser(teacher_id) )
})

const Shift = ({ direction, currentShift, teacher, token, getCurrentShift,
    start_end_shift, errorAccessLocation, shift_note, denyToNotify, subscribeUser }) => {
    const { t } = useTranslation();
    useEffect(() => getCurrentShift(), []);

    /**state for modal */
    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(!isOpen);

    /**state for reminder modal */
    const [isNotifyOpen, setIsNotifyOpen] = useState(false);
    const toggleReminder = () => setIsNotifyOpen(!isNotifyOpen);


    const getUserLocation = () => {
        accessLocation()
            .then(position => {
                // console.log(position);
                currentShift.shift.start_shift ? start_end_shift(position, teacher.id, END_SHIFT, token, currentShift.shift.start_shift) :
                    start_end_shift(position, teacher.id, START_SHIFT, token);
            })
            .catch(err => {
                //show error for user, because can't access the location
                console.log(err);
                errorAccessLocation(t);
            })
    }

    return (
        <>
            <div className={"h-100 " + styles.shiftContainer + ' d-flex flex-column justify-content-around'}>

                <Row>
                    <Col xs={1}></Col>
                    <Col xs={'auto'}>
                        <h1>
                            {t('shift')}
                        </h1>
                    </Col>
                </Row>



                <div className="d-flex flex-column align-items-center justify-content-center">
                    <Row>
                        <Col xs={'auto'}>
                            <button className={styles.shiftButton} onClick={getUserLocation} disabled={currentShift.isLoading || (!currentShift.shift.start_shift && currentShift.error)}>
                                {currentShift.shift.start_shift ? (<FaStopCircle size={200} />) : (<FaPlayCircle size={200} />)}
                            </button>
                        </Col>
                    </Row>

                    <Row className="justify-content-center mt-2">
                        <Col xs={'auto'}>
                            <Row>
                                {currentShift.shift.start_shift ? (<>
                                    <Col xs={'auto'}>
                                        {getTheTimeFromDate(currentShift.shift.start_shift)}
                                    </Col>
                                    <Col xs={'auto'}>
                                        {direction === DIRECTIONS.LTR ? <FaArrowRight /> : <FaArrowLeft />}
                                    </Col>
                                    <Col xs={'auto'}>
                                        {currentShift.shift.end_shift ? currentShift.shift.end_shift : '--'}
                                    </Col>

                                    <Col xs='auto'>
                                        <ShiftDuration shift_start={currentShift.shift.start_shift} />
                                    </Col>
                                </>) : (<></>)
                                }
                            </Row>
                        </Col>
                    </Row>
                </div>

                <Row className="justify-content-around mt-5">
                    <Col xs={12} md={'auto'}>
                        <Button
                            onClick={toggle}
                            variant='text'
                            className="w-100"
                            disabled={!currentShift.shift.start_shift}>
                            <Row className="justify-content-center  g-1">
                                <Col xs={'auto'} className="d-flex flex-cloumn justify-content-center">
                                    <MdModeEditOutline size={25} />
                                </Col>
                                <Col xs={'auto'}>
                                    {currentShift.shift?.shift_note ? t('updateNote') : t('addNote')}
                                </Col>
                            </Row>
                        </Button>
                    </Col>

                    <Col xs={12} md={'auto'}>
                        <Button variant='text' className="w-100" component={Link} to='reports'>
                            <Row className="justify-content-center  g-3">
                                <Col xs={'auto'} className="d-flex flex-cloumn justify-content-center">
                                    <FaChartBar size={25} />
                                </Col>
                                <Col xs={'auto'}>
                                    {t('report')}
                                </Col>
                            </Row>
                        </Button>
                    </Col>

                    <Col xs={12} md={'auto'}>
                        <Button variant='text' className="w-100" onClick={toggleReminder}>
                            <Row className="justify-content-center  g-3">
                                <Col xs={'auto'} className="d-flex flex-cloumn justify-content-center">
                                    <FaBell size={20} />
                                </Col>
                                <Col xs={'auto'}>
                                    { t('reminder') }
                                </Col>
                            </Row>
                        </Button>
                    </Col>
                </Row> 


                {/* <div className={`${styles['side-bar']} d-flex flex-column justify-content-around align-items-center`}>
                    <Row className="justify-content-center">
                        <Col xs={'auto'}>
                            <Link className={styles['side-bar-link']}>
                                <FaChartBar size={25} />
                            </Link>
                        </Col>
                    </Row>
                    <Row className="justify-content-center">
                        <Col xs={'auto'}>
                            <Link className={styles['side-bar-link'] + ' ' + styles.circleButton} >
                                <FaPlay size={25} />
                            </Link>
                        </Col>
                    </Row>

                    <Row className="justify-content-center">
                        <Col xs={'auto'}>
                            <Link className={styles['side-bar-link']}>
                                <FaRegSun size={25} />
                            </Link>
                        </Col>
                    </Row>
                </div> */}
            </div>
            <BackDropSpinner isOpen={currentShift.isLoading} />
            <NoteModal isOpen={isOpen} toggle={toggle} shift_note={currentShift.shift?.shift_note}
                shift_note_api={shift_note} start_shift={currentShift.shift?.start_shift} />
            <ReminderModal isOpen={isNotifyOpen} toggle={toggleReminder} denyToNotify={denyToNotify} 
            notify={currentShift.shift?.notify} subscribeUser={subscribeUser} />    
        </>
    );
}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(Shift));
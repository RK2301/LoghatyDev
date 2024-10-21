import React from "react";
import PropTypes from 'prop-types';
import { useEffect } from "react";
import { Typography } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import { formatDateTime } from "../../services";

/**Component that display the time remian from the current moment to the submit time
 * , the remain time will gain color red if submit time has passed
 */
const RemainTime = ({ submit_time, small }) => {

    useEffect(() => {
        const interval = setInterval(() => {
            setRemainTime(getRemainTime(submit_time));
        }, 1000);

        return () => clearInterval(interval);
    }, []);
    const {t} = useTranslation();

    /**change time remaining for red when deadline passed */
    const [submitPassed, setSubmitPassed] = useState(false);

    const getRemainTime = (submit_time) => {
        const currentTime = new Date();
        let remainingTime = new Date(formatDateTime(submit_time)) - currentTime // Ensure non-negative remaining time
        if (remainingTime < 0) {
            remainingTime = remainingTime * -1;
            if (!submitPassed)
                setSubmitPassed(true);
        }

        const months = Math.floor(remainingTime / (30 * 24 * 60 * 60 * 1000));
        const days = Math.floor((remainingTime % (30 * 24 * 60 * 60 * 1000)) / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remainingTime % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remainingTime % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((remainingTime % (60 * 1000)) / 1000);

        return { months, days, hours, minutes, seconds };
    }
    const [remainTime, setRemainTime] = useState(getRemainTime(submit_time));

    const formatRemainTime = (remainTime) => {
        let toReturn = '';
        const units = Object.keys(remainTime);

        /**to make sure only 2 units display on the screen */
        let digits = 1;
        units.forEach((unit, index) => {
            if( remainTime[unit] !== 0 && digits < 3){
              toReturn+= remainTime[unit] + ' ' + t(unit) + ' ';
              digits++;
            }
        });

        return toReturn;

        // units.forEach((unit, i) => {
        //     if (unit === 'seconds') {
        //         if (remainTime['minutes'] === 0)
        //             return toReturn += remainTime[unit] + ' ' + t(unit);
        //         else
        //             return;
        //     }

        //     if (remainTime[unit] > 0) {
        //         toReturn += remainTime[unit] + ' ' + t(unit);

        //         if (unit !== 'minutes' && remainTime[units[i + 1]])
        //             toReturn += ', ';
        //     }
        // })

        // return toReturn;
    }

    return (
        <Typography color={submitPassed ? 'error' : null} variant={small ? 'body2' : 'body1'}>
            <strong>
                { formatRemainTime(remainTime)}
            </strong>
        </Typography>
    )
}

RemainTime.propTypes = {
    /**string indicate submit time in format yyyy-mm-dd hh:mm */
    submit_time: PropTypes.string.isRequired,
    /**boolean indicate if to return the remain time in small text */
    small: PropTypes.bool
}

export default RemainTime;
import React, { useEffect, useState } from "react";
import { formatDateTime } from "../../services";
import { Typography } from "@mui/material";

/**component that display how much time passsed since the log to the shift, show in format hh:mm:ss */
const ShiftDuration = ({ shift_start }) => {

    useEffect(() => {
        const interval = setInterval(() => {
            setShiftDuration(getShiftDuration());
        }, 1000);

        return () => clearInterval(interval);
    }, [])

    const getShiftDuration = () => {
        const start = new Date(formatDateTime(shift_start));
        const now = new Date();

        const timePassed = now - start;
        const hours = Math.floor((timePassed % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((timePassed % (60 * 60 * 1000)) / (60 * 1000));
        const seconds = Math.floor((timePassed % (60 * 1000)) / 1000);

        return {
            hours,
            minutes: minutes < 10 ? `0${minutes}` : minutes,
            seconds: seconds < 10 ? `0${seconds}` : seconds
        };
    }
    const [shiftDuration, setShiftDuration] = useState(getShiftDuration());
    const formatShiftDuration = () => `${shiftDuration.hours}:${shiftDuration.minutes}:${shiftDuration.seconds}`;

    return (
        <Typography color='green'>
            {formatShiftDuration()}
        </Typography>
    );
}

export default ShiftDuration;
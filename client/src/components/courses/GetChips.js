import React from "react";
import { formatTheDate } from "../services";
import { Chip } from "@mui/material";
import { FaCheck, FaClock, FaSpinner } from "react-icons/fa";
import { useTranslation } from "react-i18next";

/**
    * based on course start - end date show chip with corresponding color and text  
    */
const GetChips = ({ course }) => {
    const start_date = new Date(formatTheDate(course.start_date));
    const end_date = new Date(formatTheDate(course.end_date));
    const now = new Date();

    const {t} = useTranslation();
    
    if (now > end_date) {
        //course completed
        return (
            <Chip color='success' label={t('courseCompleted')} icon={<FaCheck />} />
        )
    } else if (now >= start_date) {
        //course in progress
        return (<Chip color='info' label={t('courseInProgress')} icon={<FaSpinner />} />)
    }
    //course still not started
    return (<Chip color='secondary' label={t('courseNotYetStarted')} icon={<FaClock />} />)
}

export default GetChips;
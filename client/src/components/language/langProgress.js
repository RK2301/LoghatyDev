import React from "react";
import { Progress } from "reactstrap";
import styles from './language.module.css'

/**
 * This Component to show progress on language excercises,
 * the component show inside the bar the number of questions solved of overall questions
 * @param {*} current the current question the student try to solve
 * @param {*} overall the overall quesions the student try to solve  
 * @returns 
 */
const LangProgress = ({current, overall }) => {
    return (
        <Progress
            className="my-2"
            value={ overall !==0 ? ((current-1)/overall)*100 : 0 }
            barClassName={ styles.langBar }
        >
            {  current-1 + ' / ' + overall }
        </Progress>
    )
}

export default LangProgress;
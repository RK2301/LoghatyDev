import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, ButtonGroup, Col, Row } from "reactstrap";
import Load from '../loadComponent/loadComponent';
import Error from '../error/errorComponent'
import styles from './language.module.css';
import { FadeTransform } from 'react-animation-components';
import { FaCheck, FaChevronLeft, FaGripHorizontal, FaTimes } from "react-icons/fa";
import { BeatLoader } from "react-spinners";
import ToastMessage from './toastMessage'
import LangProgress from "./langProgress";
import { MdCelebration } from "react-icons/md";
import { FLASH_CARDS, SENTENCES_COMPLETION } from "../../redux/messages";
import FlasCards from "./questionsType/FlashCards";

const LanguageExercises = ({ exercises, getExercises, type, amount, changeView, getCsAnswer, questionAnswer
    , student, token, resetAnswer, resetExercises }) => {

    // console.log(exercises);

    const { t } = useTranslation();
    const [state, setState] = useState({
        curQue: 1, answers: [],
        snackbarOpen: true, snackbarMessage: '', isError: undefined
    });

    if (exercises.isLoading) {
        return (
            <Load />
        )
    } else if (exercises.error) {
        return (
            <Error refresh={() => getExercises()} />
        )
    }


    const chooseAnswer = (ansChoosen) => {
        state.answers[state.curQue] = ansChoosen;
        setState({ ...state, answers: state.answers.slice() })
    }

    const moveQuestion = () => {

        resetAnswer(); 
        setState({ ...state, curQue: state.curQue + 1 })
    }

    const getIsChoosen = (word_id) => {

        let toReturn = ' ';
        if (state.answers[state.curQue] === word_id)
            toReturn = styles.choosenAnswer;

        return toReturn;
    }

    /**
     * Check if a given word should be styled as correct or uncorrect when answer recieved from the server
     * @param {*} word_id 
     * @returns 
     */
    const IsCorrect = (word_id) => {
        let toReturn = ' ';
        if (questionAnswer.correctAns && questionAnswer.correctAns[2] === false && state.answers[state.curQue] === word_id) {
            return styles.uncorrect;
        }

        if (questionAnswer.correctAns && questionAnswer.correctAns[2] && state.answers[state.curQue] === word_id)
            return styles.correct;

        if (questionAnswer.correctAns && !questionAnswer.correctAns[2] && questionAnswer.correctAns[1].filter(word => word.word_id === word_id)[0])
            return styles.correct;

        return toReturn;
    }

    //check the corrent answered question is correct//
    const checkQuestion = (know) => {
        type === FLASH_CARDS ? getCsAnswer(student.id, null, exercises.exercises.filter((e, i) => i + 1 === state.curQue)[0].word_id, token, know) :
        getCsAnswer(student.id, exercises.exercises.filter((e, i) => i + 1 === state.curQue)[0].sentence_id,
            state.answers[state.curQue], token);
    }

    const endExercise = () => {
        resetExercises();
        resetAnswer();
        setState({ ...state, curQue: 1, answers: [] })
        changeView(null, 0);
    }

    const EndExercise = () => {
        return (
            <>

                <div className="d-flex flex-column justify-content-center h-100">
                    <FadeTransform in
                        transformProps={{
                            exitTransform: 'scale(0.5) TranslateY(0%) ',
                        }}>
                        <Row className="justify-content-center">
                            <Col xs={'auto'}>
                                <MdCelebration size={150} />
                            </Col>
                        </Row>
                        <Row className="justify-content-center">
                            <Col xs={'auto'}>
                                {t('congras')}
                            </Col>
                        </Row>
                        <Row className="justify-content-center mt-3 mt-md-4">
                            <Col xs={12} md={5}>
                                <button className={styles.lanBtn} onClick={() => endExercise()} >
                                    <Row className="justify-content-center">
                                        <Col xs={'auto'}>
                                            <FaGripHorizontal size={30} />
                                        </Col>
                                        <Col xs={'auto'}>
                                            {t('dashboard')}
                                        </Col>
                                    </Row>
                                </button>
                            </Col>
                        </Row>
                    </FadeTransform>
                </div>
            </>
        );
    }

    const currentQuestion = exercises.exercises.filter((e, i) => i + 1 === state.curQue).map(question => {
        if (type === SENTENCES_COMPLETION) {
            return (
                <>
                    <FadeTransform in
                        transformProps={{
                            exitTransform: 'scale(0.5) TranslateY(0%) ',
                        }}>
                        <Col xs={{ offset: 1, size: 'auto' }}>
                            {question.sentence_text}
                        </Col>
                        <Col xs={12} className="mt-3 mt-md-4">
                            <Row>
                                {question.words.map(word => (
                                    <Col xs={12} md={6} key={`${word.word_id}`} >
                                        <button className={'text-start ps-5 ' + styles.optionBtn + ' mb-3 ' + ` ${IsCorrect(word.word_id)}` + ' ' + getIsChoosen(word.word_id)}
                                            name={`${word.word_id}`} onClick={() => chooseAnswer(word.word_id)} disabled={questionAnswer.correctAns}>
                                            {word.word_text}
                                        </button>
                                    </Col>
                                ))}
                            </Row>
                        </Col>
                    </FadeTransform>
                </>
            );
        }else if(type === FLASH_CARDS){
            return(
            <>
              <FlasCards flashCards={exercises.exercises} curQue={state.curQue}
               chooseAnswer={chooseAnswer} moveQuestion={moveQuestion} getCsAnswer={getCsAnswer}
               checkQuestion={checkQuestion} />
            </>
            )
        }
    })

    return (
        //if the number if question greater than the the exercises sent then show end screen
        <>
            {exercises.exercises.length >= state.curQue ? (<>
                <Row className="justify-content-between m-2 m-md-3">
                    <Col xs={'auto'}>
                        <h3>
                            {t(type)}
                        </h3>
                    </Col>
                    <Col xs={12} md={4}>
                        <LangProgress current={state.curQue} overall={exercises.exercises.length} />
                    </Col>
                </Row>

                <Row className="mt-3 mt-md-4 ">
                    {currentQuestion}
                </Row>

                <Row className={"justify-content-center mt-5 mb-2 "}>
                    <Col xs={12} md={5}>
                        <ButtonGroup className={styles.btnGroup}>
                            { type !== FLASH_CARDS ? 
                            (
                                <>
                            <button disabled={!questionAnswer.correctAns} className={styles.lanBtn}
                                onClick={moveQuestion}>
                                <Row className="justify-content-center">
                                    <Col xs={'auto'}>
                                        <FaChevronLeft size={20} />
                                    </Col>
                                    <Col xs={'auto'}>
                                        {t('next')}
                                    </Col>
                                </Row>
                            </button>
                            <button className={styles.lanBtn} onClick={() => checkQuestion()}
                                disabled={questionAnswer.correctAns || !state.answers[state.curQue]}>
                                <Row className="justify-content-center">
                                    {questionAnswer.isLoading ? (<>
                                        <Col xs={'auto'}>
                                            <BeatLoader size={10} />
                                        </Col>
                                    </>) :
                                        (<>
                                            <Col xs={'auto'}>
                                                <FaCheck size={20} />
                                            </Col>
                                            <Col xs={'auto'}>
                                                {t('check')}
                                            </Col>
                                        </>)
                                    }
                                </Row>
                            </button>
                            </>
                            ) : (<></>)}
                            <button className={styles.lanBtn} onClick={endExercise}>
                                <Row className="justify-content-center">
                                    <Col xs={'auto'}>
                                        <FaGripHorizontal size={20} />
                                    </Col>
                                    <Col xs={'auto'}>
                                        {t('dashboard')}
                                    </Col>
                                </Row>
                            </button>
                        </ButtonGroup>
                    </Col>
                </Row>
                {/* <ToastMessage isOpen={state.snackbarOpen} message={state.snackbarMessage} isError={state.isError}
            handleClose={handleCloseSnack} /> */}
            </>) :
                (<EndExercise />)}
        </>
    );
}

// const openSnackBar = (message, isError) => {
//     setState({ ...state, snackbarOpen: !state.snackbarOpen, snackbarMessage:message || '', isError: isError   })
// }
// const handleCloseSnack = (event, reason) => {
//     if (reason === 'clickaway') {
//       return;
//     }
//     openSnackBar();
//   };

export default LanguageExercises;
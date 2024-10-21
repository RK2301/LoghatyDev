import { FaAngleLeft, FaBell, FaPlay, FaUserAlt } from "react-icons/fa";
import { MdSettings } from "react-icons/md";
import { connect } from "react-redux";
import {  ButtonGroup, Col, Container, Row } from "reactstrap";
import styles from './language.module.css';
import { useTranslation } from "react-i18next";
import { Link, useParams } from "react-router-dom";
import { FadeTransform } from 'react-animation-components';
import { useState } from "react";
import { getExercises, getCsAnswer, reset_answer, resetExercises } from '../../redux/ActionCreators';
import LanguageExercises from "./LanguageExercises";
 
const mapStateToProps = (state) => ({
    exercises: state.language,
    questionAnswer: state.questionAnswer
});

const mapDispacthToProps = ( dispacth ) => ({
    getExercises: ( student_id, lang, type, amount, token ) => dispacth( getExercises( student_id, lang, type, amount, token ) ),
    getCsAnswer: (student_id, sentence_id, word_id, token, know) => dispacth( getCsAnswer(student_id, sentence_id, word_id, token, know) ),
    resetAnswer: () => dispacth( reset_answer() ),
    resetExercises: () => dispacth( resetExercises() )
});

const Language = ({ student, exercises, getExercises, token, questionAnswer, getCsAnswer, resetAnswer, resetExercises }) => {

    const { t } = useTranslation();
    const course_id = parseInt(useParams().course_id);
    const lang = useParams().lan;

    const [state, setState] = useState({
        activeIndex: 0,
        type: '',
        amount: -1
    });

    const changeView = (e, i) => {
        if(i === 3){ getExercises(student.id, lang, state.type, state.amount, token ) }
        const newIndex = i > 3 ? 0 : i;
        setState({ ...state, activeIndex: newIndex })
    };

    const getStyle = (type) => {
        if( Number.isInteger(type) ){
            return state.amount === type ? styles.optionBtnChecked : '';
        }
        return state.type === type ? styles.optionBtnChecked : ' ';
    }

    const changeType = (type) => {
        setState({ ...state, type: type });
    }

    const changeMode = (mode) => {
        setState( { ...state, amount: mode } );
    }

    const SlideButtons = () => (
        <Row className="justify-content-center">
            <Col xs={8} md={5}>
                <ButtonGroup className={styles.btnGroup}>
                    <button className={styles.lanBtn} onClick={() => changeView(null, state.activeIndex + 1)}
                     disabled= { (state.activeIndex === 1 && state.type === '') || (state.activeIndex === 2 && state.amount === -1 ) } >
                        {t('next')}
                    </button>
                    <button className={styles.lanBtn} onClick={() => changeView(null, state.activeIndex - 1)}>
                        {t('prev')}
                    </button>
                </ButtonGroup>
            </Col>
        </Row>
    );

    const DashBoard = () => {
        return (
            <>
                <Row className="justify-content-center mt-2">
                    <Col xs={12} md={5}>
                        <ButtonGroup className={styles.btnGroup} >
                            <button className={styles.lanBtn}>
                                <Row className="justify-content-center">
                                    <Col xs={'auto'}> <FaAngleLeft /> </Col>
                                    <Col xs={{ size: 'auto', offset: 0 }}>
                                        <Link to={`/courseDetails/${course_id}`} className={styles.langLink}>
                                            {t('back')}
                                        </Link>
                                    </Col>

                                </Row>
                            </button>
                            <button className={styles.lanBtn} onClick={() => changeView(null, 1)}>
                                <Row className="justify-content-center" >
                                    <Col xs={'auto'}> <FaPlay /> </Col>
                                </Row>
                            </button>
                            <button className={styles.lanBtn}>
                                {t('level') + ' ' + t('points') + ' '}
                            </button>
                        </ButtonGroup>
                    </Col>
                </Row>

                <Row className="mt-2">
                    <Col xs={{ size: 'auto', offset: 1 }}>
                        <h3>
                            {t('acheivment')}
                        </h3>
                    </Col>
                </Row>
            </>
        )
    }

    const QuestionAmount = () => (
        <>
            <Row className="m-4">
                <Col xs={'auto'}>
                    <h3>
                        {t('mode')}
                    </h3>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className="mb-3">
                    <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle(10)}
                        onClick={() => changeMode(10)}>
                        {'1- ' + t('reallyQuick')}
                    </button>
                </Col>
                <Col xs={12} className="mb-3">
                    <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle(20)}
                        onClick={() => changeMode(20)}>
                        {'2- ' + t('normal')}
                    </button>
                </Col>
                <Col xs={12} className="mb-3">
                    <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle(30)}
                        onClick={() => changeMode(30)}>
                        {'3- ' + t('extrawork')}
                    </button>
                </Col>
                <Col xs={12} className="mb-3">
                    <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle(40)}
                        onClick={() => changeMode(40)}>
                        {'4- ' + t('dedicated')}
                    </button>
                </Col>
            </Row>
        </>
    )

    const QuestionType = () => {
        return (
            <>

                <Row className="m-4">
                    <Col xs={'auto'}>
                        <h3>
                            {t('questionType')}
                        </h3>
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} className="mb-3">
                        <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle('fc')}
                            onClick={() => changeType('fc')}>
                            {'1- ' + t('fc')}
                        </button>
                    </Col>
                    <Col xs={12} className="mb-3">
                        <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle('sc')}
                            onClick={() => changeType('sc')}>
                            {'2- ' + t('sc')}
                        </button>
                    </Col>
                    <Col xs={12} className="mb-3">
                        <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle('ws')}
                            onClick={() => changeType('ws')}>
                            {'3- ' + t('ws')}
                        </button>
                    </Col>
                    <Col xs={12} className="mb-3">
                        <button className={"text-start ps-3  " + styles.optionBtn + ' ' + getStyle('wp')}
                            onClick={() => changeType('wp')}>
                            {'4- ' + t('wp')}
                        </button>
                    </Col>
                </Row>

            </>
        );
    }


    return (
        <Container fluid className={styles.container}>
            <Row style={{ minHeight: '100vh' }}>
                <Col xs={12} className="d-flex flex-column">
                    <Row style={{ height: '25vh' }}>
                        <Col xs={12}>
                            <Row className="justify-content-between">
                                <Col xs={'auto'} className={styles.sideLogo}>
                                    <FaBell />
                                </Col>
                                <Col xs={'auto'} className={styles.sideLogo}>
                                    <MdSettings />
                                </Col>
                            </Row>
                            <Row className="justify-content-center mt-3">
                                <Col xs={'auto'}>
                                    <div className="d-flex flex-column">
                                        <div className="text-center">
                                            <FaUserAlt className={styles.userLogo} />
                                        </div>
                                        <div>
                                            {t('user', { name: student.firstname + ' ' + student.lastname })}
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    <FadeTransform in
                        transformProps={{
                            exitTransform: 'scale(0.5) TranslateY(0%) ',
                        }}>
                        <Row style={{ height: '70vh', overflowY: 'scroll' }} className={styles.mainContent + ' m-2'}>
                            <Col>
                                {state.activeIndex === 0 ? <DashBoard /> :
                                    state.activeIndex === 1 ? (
                                        <>
                                            <FadeTransform in
                                                transformProps={{
                                                    exitTransform: 'scale(0.5) TranslateY(0%) ',
                                                }}>
                                                <QuestionType />
                                                <SlideButtons />
                                            </FadeTransform>
                                        </>
                                    ) : state.activeIndex === 2 ? (
                                        <>
                                            <FadeTransform in
                                                transformProps={{
                                                    exitTransform: 'scale(0.5) TranslateY(0%) ',
                                                }}>
                                                <QuestionAmount />
                                                <SlideButtons />
                                            </FadeTransform>
                                        </>
                                    ) :
                                     (<>
                                      <LanguageExercises exercises={exercises} getExercises={getExercises} type={ state.type }
                                      amount={state.amount} changeView={changeView} getCsAnswer={getCsAnswer}  questionAnswer={questionAnswer}
                                      student={student} token={token} resetAnswer={resetAnswer} resetExercises={resetExercises} />
                                     </>)
                                    }

                            </Col>
                        </Row>
                    </FadeTransform>
                </Col>
            </Row>
        </Container>
    )

}

export default connect(mapStateToProps, mapDispacthToProps)(Language);
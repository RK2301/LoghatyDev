import React, { useState } from "react";
import styles from '../language.module.css';
import { Col, Row } from "reactstrap";
import { FaCheck, FaTimes } from "react-icons/fa";
import { FadeTransform } from 'react-animation-components';

const FlasCards = ({ flashCards, curQue, chooseAnswer, moveQuestion, checkQuestion }) => {

    const [state, setState] = useState({ flip: false });
    const flipFlashCard = (newState) => {
        // console.log(`new State for flip : ${!state.flip}`);
        newState === false ? setState({ ...state, flip: false }) :
            setState({ ...state, flip: !state.flip })
    };

    const nextCard = (know) => {
        //make api call for the server to save the answer then move question
        flipFlashCard(false);
        moveQuestion();
        checkQuestion(know)
    }

    const CheckButton = () => {
        return (
            <button className={styles.checkFlashCardButton} onClick={() => nextCard(true)}>
                <FaCheck className={styles.checkFlashCard} />
            </button>
        );
    }

    const XmarkButton = () => {
        return (
            <button className={styles.xMarkButton} onClick={() => nextCard(false)}>
                <FaTimes className={styles.xMarkFlashCard} />
            </button>
        );
    }

    return (
        <>
            <Col>
                <Row className="justify-content-center">
                    <Col xs={1} className="d-md-block d-none">
                        <div className="d-flex flex-column justify-content-center h-100">
                            <CheckButton />
                        </div>
                    </Col>

                    <Col xs={10} md={5} style={{ height: '50vh' }}>

                        {flashCards.filter((flashCard, i) => i + 1 === curQue).map(flashCard => {
                            return (
                                <div className={`d-flex flex-column justify-content-center align-items-center ${styles.flashCard} h-100 ${state.flip ? styles.flip : ' '} `}
                                    onClick={flipFlashCard} key={flashCard.word_id} >
                                    <div className={`${styles.front}`}>
                                        <FadeTransform in
                                            transformProps={{
                                                exitTransform: 'scale(0.5) TranslateY(0%) ',
                                            }}>
                                            {flashCard.word_text}
                                        </FadeTransform>
                                    </div>
                                    <div className={`${styles.back}`}>
                                        {flashCard.answers.map(ans => {
                                            return (
                                                <div className={`${styles.flashCardOption}`} key={ans.synonym_id}>
                                                    {ans.synonym_text}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            );
                        })

                        }

                    </Col>

                    <Col xs={1} className="d-md-block d-none">
                        <div className="d-flex flex-column justify-content-center h-100 ">
                            <XmarkButton />
                        </div>
                    </Col>

                    <Col xs={10} className="d-block d-md-none mt-3">
                        <Row>
                            <Col xs={6}>
                                <CheckButton />
                            </Col>
                            <Col xs={6}>
                                <XmarkButton />
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Col>
        </>
    )

}

export default FlasCards;
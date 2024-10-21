import React from "react";
import { connect } from "react-redux";
import { Col, FormGroup, Row } from "reactstrap";
import { BeatLoader } from 'react-spinners';
import { reset_state } from "../../redux/ActionCreators";
import { useEffect } from "react";
import { Alert, Button } from "@mui/material";
import { StyledErrorAlert, StyledFeedbackButton } from "../materialUiOverride";

const mapStateToProps = (state) => ({
    operation: state.operation
});

const mapDispacthToProps = (dispatch) => ({
    reset_operation: () => dispatch(reset_state())
});

/**
 * The component is the feedback section at each form, with contain the submit button & label to show errors. 
 * The props: 
 * @param btnText text to show inside the button - optional
 * @param btnLogo logo component to show in the button - optional
 * @param disabled the disabled attribute for the button, can be value for variable, the default false - optional
 * @param toggle toggle function to close the modal after successfull doing the operation. (if the feedback inside a form modal) 
 * @param onClickHandler function to run if the button clicked - optional
 * @param classNames array which contain className's for the button - optional
 */
const Feedback = ({ operation, reset_operation, btnText,
    btnLogo, disabled, toggle, onClickHandler, classNames, error }) => {


    useEffect(() => {
        if (operation.oprSuccessed) {
            if (toggle) {
                toggle();
            }
        }
    }, [operation.oprSuccessed]);

    const classNamesJoin = classNames ? classNames.join(' ') : '';

    return (
        <>
            <FormGroup row className="justify-content-center mt-3">
                <Col xs={10} md={5}>
                    <StyledFeedbackButton type="submit" disabled={disabled} onClick={() => { if (onClickHandler) {console.log(`called on click from submit button`); ;onClickHandler() } }} className={classNamesJoin}>
                        <Row className='justify-content-center'>
                            {btnLogo && !operation.isLoading ? <Col xs={'auto'}> {btnLogo} </Col> : <></>}
                            {operation.isLoading ? <Col xs={'auto'}> <BeatLoader size={10} /> </Col> :
                                btnText ? <Col xs={'auto'}> {btnText} </Col> : <></>}
                        </Row>
                    </StyledFeedbackButton>
                </Col>
                {
                    operation.error ?
                        <Row className="justify-content-center mt-3">
                            <Col xs={12} md={7}>
                                <StyledErrorAlert>
                                    { Array.isArray(operation.error) ? 
                                    operation.error.map( (error, i) => (
                                        <div key={i}>
                                            { error }
                                        </div>
                                    )) 
                                    : operation.error}
                                </StyledErrorAlert>
                            </Col>
                        </Row>
                        : <></>
                }
            </FormGroup>
        </>
    )
}

export default connect(mapStateToProps, mapDispacthToProps)(Feedback);
import React from "react";
import { PropagateLoader } from 'react-spinners'
import MyProgress from "../myProgessBar/myprogress";
import { reset_state } from "../../redux/ActionCreators";
import { connect } from "react-redux";

const mapStateToProps = (state) => ({
    operation: state.operation
});

const mapDispacthToProps = (dispatch) => ({
    reset_state_operation: () => dispatch( reset_state() )
})

function FormFeedbackModal(props) {
    console.log(props);

    if (props.operation.isLoading) {
        return (
            <PropagateLoader height={15} speedMultiplier={1} />
        );
    } else if (props.operation.error) {
        return (
            <p className="formMsg"> {props.operation.error} </p>
        )
    } else if (props.operation.oprSuccessed) { 

        if (props.reset_state_operation){
            setTimeout(() => {
                props.reset_state_operation();
                if(props.toggle){
                    props.toggle();
                }
            }, 3000);
        }
        return (
            <>
                <MyProgress timeToComplete={props.timeToComplete} />
            </>
        );
    }
}

export default connect(mapStateToProps, mapDispacthToProps)(FormFeedbackModal);
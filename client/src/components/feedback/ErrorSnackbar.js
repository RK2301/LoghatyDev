import React from "react";
import { ErrorSnackBar } from "../materialUiOverride";
import { connect } from "react-redux";
import { reset_error_state } from "../../redux/ActionCreators";

const mapStateToProps = (state) => ({
    errorState: state.errorState
});

const mapDispacthToProps = (dispatch) => ({
    reset_error_state : () => dispatch( reset_error_state() )
  });  

const ErrorSnack = ({ errorState, reset_error_state }) => {
    return (
        <>
            <ErrorSnackBar
                open = { errorState.error }
                messagecontent = { errorState.errorMessage }
                onClose = {(event, reason) => {
                    if(reason === 'clickaway')
                      return
                    else
                    reset_error_state() 
                }}
            />
        </>
    );
}

export default connect(mapStateToProps, mapDispacthToProps)(ErrorSnack);
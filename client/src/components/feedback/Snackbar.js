import React from "react";
import { SuccessSnackbar } from "../materialUiOverride";
import { connect } from "react-redux";
import { reset_state } from "../../redux/ActionCreators";

const mapStateToProps = (state) => ({
    operation: state.operation
});

const mapDispacthToProps = (dispatch) => ({
    reset_operation : () => dispatch( reset_state() )
  }); 

const SuccessSnack = ({ operation, reset_operation }) => {
    return (
        <>
            <SuccessSnackbar
                open={ operation.oprSuccessed }
                messagecontent = { operation.successMsg }
                onClose={(event, reason) => {
                    if(reason === 'clickaway')
                      return
                    else{
                        reset_operation()
                    }  
                }}
            />
        </>
    );
}

export default connect(mapStateToProps, mapDispacthToProps)(SuccessSnack);
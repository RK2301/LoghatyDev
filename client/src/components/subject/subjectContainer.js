import React, { useEffect, useState } from "react";
import { Col, Container, Row } from "reactstrap";
import ListSubjectsSide from "./ListSubjectsSide";
import SubjectFormSide from "./subjectFormSide";
import { Route, Routes } from "react-router-dom";
import { Divider, Grid } from "@mui/material";
import { connect } from "react-redux";
import { addSubject, getSubjects, reset_after_error, updateSubject } from "../../redux/ActionCreators";

const mapStateToProps = (state) => ({
    subjects: state.subjects
});

const mapDispacthToProps = (dispatch) => ({
    getSubjects: () => dispatch(getSubjects()),
    addSubject: (subject, setSubmitting) => dispatch(addSubject(subject, setSubmitting)),
    updateSubject: (subject, setSubmitting) => dispatch(updateSubject(subject, setSubmitting)),
    reset_after_error: () => dispatch(reset_after_error())
})


const SubjectContainer = ({ subjects, getSubjects, addSubject, updateSubject, reset_after_error }) => {

    /**
     * api call to get all the subjects from the db
     */
    useEffect(() => { getSubjects() }, []);

    const [state, setState] = useState({
        selectedSubject: {},
        addSubject: false
    });
    const width = window.innerWidth;
    // console.log(width);

    const selectSubject = (subject) => {
        // console.log(subject);
        setState({ ...state, selectedSubject: subject, addSubject: false })
        debugger
    }

    const addNewSubject = () => {
        setState({ ...state, selectedSubject: {}, addSubject: true })
    }

    const SecondSideLayout = ({ mobile }) => {
        debugger
        return (
            <Row className="justify-content-center h-100">
                <Col>
                    <SubjectFormSide selectedSubject={state.selectedSubject} addSubject={state.addSubject}
                        subjects={subjects.subjects} addNewSubject={addSubject} mobile={mobile} />
                </Col>
            </Row>
        )
    }

    return (
        <>
            {width >= 768 ?
                (
                    <Grid container >
                        <Grid item md={5}>
                                <ListSubjectsSide selectSubject={selectSubject} addNewSubject={addNewSubject} subjects={subjects} />
                        </Grid>
                        <Divider orientation='vertical' variant='middle' flexItem color='black' />
                        <Grid item md={6} className="p-5">
                            <SubjectFormSide selectedSubject={state.selectedSubject} addSubject={state.addSubject}
                                addNewSubject={addSubject} updateSubject={updateSubject} reset_after_error={reset_after_error} />
                        </Grid>
                    </Grid>
                )
                // (<Container fluid className="h-100 d-none d-md-block">
                //     <Row className="h-100 ">
                //         <Col md={5} className="ps-5 pe-5 pb-5 pt-3">
                //             <ListSubjectsSide selectSubject={selectSubject} addNewSubject={addNewSubject} />
                //         </Col>

                //         <Col md={7} className="p-5">
                //             <Row className="justify-content-center h-100">
                //                 <Col md={10}>
                //                     <SubjectFormSide selectedSubject={state.selectedSubject} addSubject={state.addSubject} />
                //                 </Col>
                //             </Row>
                //         </Col>
                //     </Row>
                // </Container>
                // )
                :
                (<Container fluid className="h-100">
                    <Routes>
                        <Route path="/addUpd/:id" element={<SubjectFormSide selectedSubject={state.selectedSubject} addSubject={state.addSubject} subjects={subjects.subjects} addNewSubject={addSubject}
                            updateSubject={updateSubject} reset_after_error={reset_after_error} mobile />} />
                        <Route path="/*" element={<ListSubjectsSide subjects={subjects} selectSubject={selectSubject} addNewSubject={addNewSubject} mobile />} />
                    </Routes>
                </Container>
                )
            }
        </>
    )
}

export default connect(mapStateToProps, mapDispacthToProps)(SubjectContainer);

//<SecondSideLayout mobile />
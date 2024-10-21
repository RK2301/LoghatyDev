import React, { useEffect, useState } from "react";
import PropTypes from 'prop-types';
import { Col, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import { useTranslation } from "react-i18next";
import { Checkbox, Chip, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import { Search, SearchIconWrapper, StyledFeedbackButton, StyledInputBase } from "../../materialUiOverride";
import { FaSearch } from "react-icons/fa";
import Feedback from "../../feedback/Feedback";
import { useParams } from "react-router-dom";
import withDirection from "react-with-direction";

/**This component represent a modal list to add new students to the course */
const StudentsModal = ({ isOpen, toggle, reset_after_error, notEnrolledStudents, registerStudents, direction }) => {

    /**The students to show, for search the array can be filtered */
    const [students, setStudents] = useState([]);

    const [searchValue, setSearchValue] = useState('');
    const [searchClicked, setSearchClicked] = useState(false);

    useEffect(() => { 
          setStudents(notEnrolledStudents.slice().sort((s1, s2) => s1.class_id - s2.class_id)) 
    }, [notEnrolledStudents])
    const { t } = useTranslation();
    const course_id = parseInt(useParams().id);

    /**based on the search value filter the students to be showen
     * the search is based on find class id or student name.
     */
    const filterStudents = (value) => {

        if (!value) {
            setStudents(notEnrolledStudents);
        } else {
            //filter
            if (!isNaN(parseInt(value))) {
                //filter based on class_id
                const class_id = parseInt(value);
                const filteredArray = notEnrolledStudents.filter(student => {
                    if (student.class_id === class_id)
                        return true;
                    if (class_id < 4) {
                        //for 1 show classs and 11, same for 2, and for 3 show 3 and graduate
                        if (`${student.class_id}`.includes(`${class_id}`))
                            return true;
                    }
                    return false;
                })
                    .sort((s1, s2) => s1.class_id - s2.class_id);
                setStudents(filteredArray);
            } else {
                //filter based of first name and last name
                const searchName = value.toLowerCase();
                const filteredArrayByName = notEnrolledStudents.filter(student => {
                    const fullname = `${student.firstname} ${student.lastname}`.toLowerCase();
                    return fullname.includes(searchName);
                })
                    .sort((s1, s2) => s1.class_id - s2.class_id);
                setStudents(filteredArrayByName)
            }
        }

    }

    //save which students selected to be add later
    const [selectedStudents, setSelectedStudents] = useState([]);

    /**handle when a students selected by chnage the value at the index to true */
    const handleSelectStudent = (id) => {
        const i = notEnrolledStudents.findIndex(student => student.id === id);

        const arr = selectedStudents.slice();
        arr[i] = !arr[i];
        setSelectedStudents(arr);
    }

    /**after close the modal, must reset the selected students and students, so espically when add new studnets, to prevent 
     * errors
     */
    const closeModal = () => {
        setSelectedStudents([]);
        setSearchValue('');
        toggle();
        reset_after_error();
    }

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={closeModal}
            centered
            scrollable backdrop='static'
            size={'md'}
            unmountOnClose>
            <ModalHeader toggle={closeModal} >
                {t('registerStudents')}
            </ModalHeader>

            <ModalBody dir={direction}>
                <Row className='justify-content-end  mb-2'>
                    <Col xs={'auto'} >
                        <Search
                            onClick={() => setSearchClicked(true)}
                            onBlur={() => setSearchClicked(false)}
                        >
                            <SearchIconWrapper>
                                <FaSearch />
                            </SearchIconWrapper>
                            <StyledInputBase
                                value={searchValue}
                                onChange={(event) => { setSearchValue(event.target.value); filterStudents(event.target.value) }}
                                placeholder={searchClicked ? t('searchStudents') : ''}
                            />
                        </Search>
                    </Col>
                </Row>

                {/**Show the teachers selected in a chips */}
                <Row className="mb-2">
                    <Col xs='auto'>
                        {selectedStudents.map((isSelected, i) => {
                            if (isSelected)
                                return (
                                    <Chip
                                        variant='outlined'
                                        color='primary'
                                        label={notEnrolledStudents[i].firstname + ' ' + notEnrolledStudents[i].lastname}
                                        onDelete={() => handleSelectStudent(notEnrolledStudents[i].id)}
                                        sx={{ marginLeft: '2px' }}
                                        className='mb-1'
                                    />
                                );
                            return <></>
                        })}
                    </Col>
                </Row>

                <List disablePadding>
                    {
                        students.map((student, i) => (
                            <>
                                {i === 0 ? (
                                    <Divider variant='fullWidth' >
                                        <Chip label={t('class') + ' ' + students[i].class_id}
                                            size='small' />
                                    </Divider>
                                ) : (<></>)}

                                <ListItem
                                    key={student.id}
                                    disablePadding
                                >
                                    <ListItemButton
                                        onClick={() => handleSelectStudent(student.id)}>
                                        <ListItemIcon>
                                            <Checkbox
                                                edge='start'
                                                checked={ selectedStudents[notEnrolledStudents.findIndex(s => s.id === student.id)] }
                                                tabIndex={-1}
                                                color='info' />
                                        </ListItemIcon>
                                        <ListItemText primary={student.firstname + ' ' + student.lastname + ' - ' + student.id} />
                                    </ListItemButton>
                                </ListItem>
                                {students[i + 1] && students[i + 1].class_id !== student.class_id ?
                                    (<Divider variant='fullWidth'>
                                        <Chip label={t('class') + ' ' + students[i + 1].class_id} />
                                    </Divider>)
                                    : (<Divider variant='middle' />)}
                            </>
                        ))
                    }
                </List>

                <Row className="justify-content-center mt-3">
                    <Col>
                        <Feedback
                            btnText={t('add')}
                            toggle={closeModal}
                            disabled={selectedStudents.filter(isSelected => isSelected).length == 0}
                            onClickHandler={ () => {
                                const students = {
                                    course_id: course_id,
                                    students: []
                                }
                                selectedStudents.forEach((isSelected, i) => {
                                    if(isSelected)
                                     students.students.push( notEnrolledStudents[i].id );
                                });
                                //make api call to register the new students
                                registerStudents(students);
                            }}
                        />
                    </Col>
                </Row>
            </ModalBody>
        </Modal>
    )
}

StudentsModal.prototype = {
    isOpen: PropTypes.bool.isRequired,
    toggle: PropTypes.func.isRequired,
    /**array contain the students not enrolled yet to the course */
    notEnrolledStudents: PropTypes.array.isRequired,
    /**function to make api call to the server to register new students to the course */
    registerStudents: PropTypes.func.isRequired
}
//handleSelectStudent(i)
export default withDirection(StudentsModal);
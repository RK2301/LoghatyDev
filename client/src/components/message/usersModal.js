import React, { useState } from "react";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Col, Modal, ModalBody, ModalHeader, Row } from "reactstrap";
import TableLoading from "../loadingComponents/TableLoading";
import Error from "../error/errorComponent";
import PropTypes from 'prop-types';
import { Checkbox, Chip, Divider, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from "@mui/material";
import { connect } from "react-redux";
import { getAllUsers } from "../../redux/ActionCreators";
import withDirection from 'react-with-direction';


const mapStateToProps = (state) => ({
    allUsers: state.allUsers
});

const mapDispacthToProps = (dispatch) => ({
    getAllUsers: () => dispatch(getAllUsers())
})


const UsersModal = ({ isOpen, toggle, mode, allUsers, getAllUsers, selectedUsers, 
    setSelectedUsers, numberOfUsersSelected, direction }) => {

    useEffect(() => {
        if (mode === 'a' || mode === 'u')
            getAllUsers()
    }, []);
    const { t } = useTranslation();
    const [allTeachersSelected, setAllTeachersSelected] = useState(false);

    /**for each class save if all students selcted */
    const [classesStudents, setClassesStudents] = useState([]);

    const selectAllTeachers = () => {
        const newSelectedUsers = { ...selectedUsers };
        if (!allTeachersSelected) {
            //move to select all teachers
            allUsers.users.teachers.forEach(teacher => newSelectedUsers[teacher.id] = true);
            setSelectedUsers(newSelectedUsers);
            setAllTeachersSelected(true);
        } else {
            //all teachers selected so unselect all
            allUsers.users.teachers.forEach(teacher => newSelectedUsers[teacher.id] = false);
            setSelectedUsers(newSelectedUsers);
            setAllTeachersSelected(false);
        }
    }

    /**return true or false to check if all teachers are selected */
    const isAllTeachersSelected = (id) => {
        for (let teacher in allUsers.users.teachers) {
            if (!selectedUsers[teacher.id]) {
                setAllTeachersSelected(false)
                return;
            }
        }
        setAllTeachersSelected(true);
    }

    const isAllClassStudentSelected = (class_id) => {
        const studenstClass = allUsers.students?.filter(student => student.class_id === class_id);

        for (let student in studenstClass) {
            if (!selectedUsers[student.id]) {
                classesStudents[class_id] = true;
                setClassesStudents(classesStudents.slice());
                return;
            }
        }
        classesStudents[class_id] = false;
        setClassesStudents(classesStudents.slice());
    }

    /**for a given class id select all students is part of this class */
    const selectedAllClassStudents = (class_id) => {
        const newSelectedUsers = { ...selectedUsers };

        allUsers.users.students.forEach(student => {
            if (student.class_id === class_id) {
                !classesStudents[class_id] ? newSelectedUsers[student.id] = true : newSelectedUsers[student.id] = false;
            }
        });
        classesStudents[class_id] = !classesStudents[class_id];
        setClassesStudents(classesStudents);
        setSelectedUsers(newSelectedUsers);
    }

    /**handle select or unselect a user
     * @param teacher boolean indicate if teacher has been clicked
     * @param class_id for student must pass class id to check if the all class mate is selected
     * 
     */
    const handleSelectUser = (id, teacher, class_id) => {
        const newSelectedUsers = { ...selectedUsers };
        newSelectedUsers[id] = !newSelectedUsers[id];
        setSelectedUsers(newSelectedUsers);

        if (teacher)
            isAllTeachersSelected();
        else
            isAllClassStudentSelected(class_id);
    }

    /**for each show this item as first item, enable select all class students or unselect */
    const SelectAllListItem = ({ class_id }) => (
        <ListItem disablePadding>
            <ListItemButton
                onClick={() => {
                    if (mode === 'a')
                        selectedAllClassStudents(class_id)
                }}>
                <ListItemIcon>
                    <Checkbox
                        edge='start'
                        checked={classesStudents[class_id]}
                        tabIndex={-1}
                        disabled={mode === 'u'}
                        color='info' />
                </ListItemIcon>
                <ListItemText primary={classesStudents[class_id] ? t('unSelectAll') : t('selectAll')} />
            </ListItemButton>
        </ListItem>
    )

    const UsersList = () => (
        <>
            <Row className="justify-content-center">
                <Col xs='auto'>
                    <Typography variant='caption'>
                        {t('autoSaveUsers')}
                    </Typography>
                </Col>
            </Row>
            <Row className="mb-2">
                <Col xs='auto'>
                    <Typography variant='body2'>
                        {t('totalUserSelected', { total: numberOfUsersSelected() })}
                    </Typography>
                </Col>
            </Row>

            <List disablePadding>
                {
                    allUsers.users?.teachers?.map((teacher, i) => (
                        <>
                            {
                                i === 0 ?
                                    (
                                        <>
                                            <Divider variant='fullWidth' >
                                                <Chip label={t('teachers')}
                                                    size='small' />
                                            </Divider>

                                            <ListItem disablePadding>
                                                <ListItemButton
                                                    onClick={() => {
                                                        if (mode === 'a')
                                                            selectAllTeachers()
                                                    }}>
                                                    <ListItemIcon>
                                                        <Checkbox
                                                            edge='start'
                                                            checked={allTeachersSelected}
                                                            tabIndex={-1}
                                                            disabled={mode === 'u'}
                                                            color='info' />
                                                    </ListItemIcon>
                                                    <ListItemText primary={allTeachersSelected ? t('unSelectAll') : t('selectAll')} />
                                                </ListItemButton>
                                            </ListItem>

                                        </>
                                    ) : <></>
                            }

                            <ListItem key={teacher.id} disablePadding>
                                <ListItemButton
                                    onClick={() => {
                                        if (mode === 'a')
                                            handleSelectUser(teacher.id, true)
                                    }}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge='start'
                                            checked={selectedUsers[teacher.id]}
                                            tabIndex={-1}
                                            disabled={mode === 'u'}
                                            color='info' />
                                    </ListItemIcon>
                                    <ListItemText primary={teacher.fullname} />
                                </ListItemButton>
                            </ListItem>
                        </>
                    ))
                }

                {
                    allUsers.users?.students?.map((student, i) => (
                        <>
                            {i === 0 ? (
                                <>
                                    <Divider variant='fullWidth' >
                                        <Chip label={t('class') + ' ' + student.class_id}
                                            size='small' />
                                    </Divider>

                                    <SelectAllListItem class_id={student.class_id} />
                                </>
                            ) : (<></>)}

                            <ListItem
                                key={student.id}
                                disablePadding
                            >
                                <ListItemButton
                                    onClick={() => {
                                        if(mode === 'a')
                                            handleSelectUser(student.id, null, student.class_id)
                                    }}>
                                    <ListItemIcon>
                                        <Checkbox
                                            edge='start'
                                            checked={selectedUsers[student.id]}
                                            tabIndex={-1}
                                            disabled={ mode === 'u' }
                                            color='info' />
                                    </ListItemIcon>
                                    <ListItemText primary={student.fullname} />
                                </ListItemButton>
                            </ListItem>
                            {allUsers.users.students[i + 1] && allUsers.users.students[i + 1].class_id !== student.class_id ?
                                (
                                    <>
                                        <Divider variant='fullWidth'>
                                            <Chip label={t('class') + ' ' + allUsers.users.students[i + 1].class_id} />
                                        </Divider>
                                        <SelectAllListItem class_id={allUsers.users.students[i + 1].class_id} />
                                    </>
                                )
                                : (<Divider variant='middle' />)}
                        </>
                    ))
                }
            </List >
        </>
    )

    return (
        <Modal
            isOpen={isOpen}
            modalTransition={{ timeout: 500 }}
            backdropTransition={{ timeout: 700 }}
            toggle={() => toggle()}
            centered
            scrollable
            size={'md'}
            unmountOnClose
        >
            <ModalHeader toggle={toggle}>
                {t('usersToSent')}
            </ModalHeader>

            <ModalBody dir={direction}>
                {
                    allUsers.isLoading ? <TableLoading /> :
                        allUsers.error ? <Error refresh={() => getAllUsers()} /> :
                            <UsersList />
                }
            </ModalBody>
        </Modal>
    )
}

UsersModal.propTypes = {
    mode: PropTypes.oneOf(['a', 'u']).isRequired,
    /**obejct hold as key users id to indicate if the user selected to sent the the message to */
    selectedUsers: PropTypes.object.isRequired
}

export default withDirection(connect(mapStateToProps, mapDispacthToProps)(UsersModal));
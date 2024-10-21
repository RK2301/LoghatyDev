import { Divider, Fab, IconButton, List, ListItem, ListItemButton, ListItemText, Tooltip, useMediaQuery, useTheme } from "@mui/material";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { MdAdd, MdDelete } from "react-icons/md";
import PropTypes from 'prop-types';
import { Col, Row } from "reactstrap";
import Zoom from "@mui/material/Zoom";
import { Link } from "react-router-dom";
import { StyledFAB, StyledListItemButton, StyledToolTip } from "../materialUiOverride";
import ListLoading from "../loadingComponents/listLoading";
import Error from '../error/errorComponent'
import { FaTrash } from "react-icons/fa";

/**
 * Render List of subjects from the db
 */
const ListSubjectsSide = ({ subjects, selectSubject, addSubject, addNewSubject, mobile }) => {

    const { i18n, t } = useTranslation();
    const [selectedItem, setSelectedItem] = useState(-1);
    const handleItemSelect = (i, subject) => {
        setSelectedItem(i);
        selectSubject(subject);
    }

    const mobileProps = (id) => mobile ? { component: Link, to: 'addUpd' + `/${id}` } : {};
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    const getSecondaryText = (subject) => {
        let toReturn = '';
        const keys = Object.keys(subject);
        keys.forEach((lan, i) => {
            lan === i18n.language || lan === 'id' ? toReturn += '' : toReturn += subject[lan];
            toReturn += ' ';
            if (i !== keys.length - 1 && i18n.language !== lan && lan !== 'id')
                toReturn += '| '
        })
        return toReturn
    }

    if (subjects.isLoading) {
        return (
            <ListLoading />
        )
    } else if (subjects.error) {
        return <Error />
    }

    return (
        <>
            <Row className="mb-1 ps-5 pe-5 pt-3">
                <Col xs={'auto'}>
                    {mobile ?
                        (
                            <StyledFAB
                                aria-label="add"
                                //  sx={{position:'absolute', bottom: '10%', right :10}}
                                component={Link}
                                to={`addUpd/-1`}
                                onClick={() => { addNewSubject(); setSelectedItem(-1) }}
                            >
                                <MdAdd className="basic-icon" size={'30px'} />
                            </StyledFAB>
                        )
                        :
                        (
                            <IconButton
                                onClick={() => { addNewSubject(); setSelectedItem(-1) }}>
                                <MdAdd className="basic-icon" />
                            </IconButton>
                        )
                    }
                </Col>
            </Row>

            <div
             className={ isMobile ? "" : "ps-5 pe-5 pb-5 pt-md-1"} 
             style={ isMobile ? {} : {maxHeight: '70vh', width:'100%' ,overflowY: 'scroll'}}>
                <List disablePadding>
                    {
                        subjects.subjects.map((s, i) => (
                            <>
                                <ListItem
                                    disablePadding
                                    key={i}
                                    className={isMobile ? "pe-2" : ""}
                                >
                                    <StyledListItemButton
                                        selected={selectedItem === i}
                                        component={Link}
                                        to={'addUpd' + `/${s.id}`}
                                        onClick={() => handleItemSelect(i, s)}
                                    >

                                        <ListItemText
                                            primary={s[i18n.language]}
                                            secondary={getSecondaryText(s)}
                                        />

                                        {/* <Col xs={'auto'}>
                                            <Tooltip title={t('delete')} arrow TransitionComponent={Zoom} leaveDelay={200}>
                                                <IconButton size='medium'>
                                                    <MdDelete className="small-icon" size={25} />
                                                </IconButton>
                                            </Tooltip>
                                        </Col> */}
                                    </StyledListItemButton>

                                    <StyledToolTip title={t('delete')}>
                                        <IconButton color='error' edge='end'
                                            onClick={() => {
                                                // toggle();
                                                // setDeleteFunction({ delete: () => deleteMessage(message.message_id) })
                                            }}
                                            sx={{
                                                '&:after': {
                                                    content: '""',
                                                    position: 'absolute',
                                                    height: '100%',
                                                    display: 'block',
                                                    left: 0,
                                                    width: '1px',
                                                    bgcolor: 'divider',
                                                },
                                            }}>
                                            <FaTrash size={17} color='black' />
                                        </IconButton>
                                    </StyledToolTip>
                                </ListItem>
                                {i !== subjects.length - 1 ? <Divider variant='middle' component={'li'} /> : <></>}
                            </>
                        ))
                    }
                </List>
            </div>
        </>
    )

}

ListSubjectsSide.propTypes = {
    /**Function to set the selected subject to show the second side of the screen */
    selectSubject: PropTypes.func.isRequired,
    /**Function to trigger when the add button clicked, to open the other side of the screen to add new subject */
    addNewSubject: PropTypes.func.isRequired,
    /**indicate if the component render for mobile view */
    mobile: PropTypes.bool
}

export default ListSubjectsSide;
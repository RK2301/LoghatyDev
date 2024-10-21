import React, { Component, useEffect, useState } from "react";
import { ButtonGroup, Collapse, Input, Label, Nav, Navbar, NavbarBrand, NavItem, Col, UncontrolledDropdown, DropdownToggle, DropdownMenu, DropdownItem, Row, Container, Dropdown } from "reactstrap";
import 'react-bootstrap-sidebar-menu/dist/';
import { Link, NavLink, useLocation } from "react-router-dom";
import './headerCss.css';
import withDirection, { DIRECTIONS } from 'react-with-direction';
import styles from './header.module.css';
import { Avatar, BottomNavigation, BottomNavigationAction, Divider, IconButton, ListItemIcon, Menu, MenuItem } from "@mui/material";
import { MdBackHand, MdChatBubble, MdHome, MdLogout, MdOutlineHelp, MdSettings } from 'react-icons/md'
import { useTranslation } from "react-i18next";
import { FaBookOpen, FaChalkboardTeacher, FaClock, FaUserAlt, FaUserGraduate } from "react-icons/fa";
import { StyledMenu } from "../materialUiOverride";
import LogOutModal from "./LogOutModal";
import Restricted from "../../permissions/Restricted";
import * as PermissionsTypes from '../../permissions/permissionTypes';
import { addCoursePath, courseDetailsPath, coursesPath, messagesPath, shiftReportsPath, subjectPath } from "../../redux/config";


class Header extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isOpen: false,
            value: 'recents',
            openLogoutModal: false
        }
        this.toggleNav = this.toggleNav.bind(this);
        this.toggleLogout = this.toggleLogout.bind(this);
    }

    toggleNav() {
        this.setState({
            isOpen: !this.state.isOpen,
        });
    }

    toggleLogout() {
        this.setState({ ...this.state, openLogoutModal: !this.state.openLogoutModal });
    }

    render() {

        const DropDownLink = ({ to }) => {
            return (
                <Link style={{ backgroundColor: 'red' }} to={to} />
            )
        }

        /**
         * Component render the view for user badge at the top of the navbar 
         */
        const UserBadge = () => {
            const { t } = useTranslation();
            const [anchorEl, setAnchorEl] = React.useState(null);
            const open = Boolean(anchorEl);
            const handleClick = (event) => {
                setAnchorEl(event.currentTarget);
            };
            const handleClose = () => {
                setAnchorEl(null);
            };
            return (
                <>
                    <div className="d-flex flex-column justify-content-center">
                        <IconButton
                            onClick={handleClick}>
                            <Avatar
                                sx={{ border: '1.5px solid black', height: '50px', width: '50px', bgcolor: 'transparent' }}
                            >
                                <FaUserAlt color="black" />
                            </Avatar>
                        </IconButton>

                        <StyledMenu
                            anchorEl={anchorEl}
                            id="account-menu"
                            open={open}
                            onClose={handleClose}
                            onClick={handleClose}
                        >
                            {/* <MenuItem>
                                <Row className="justify-content-start">
                                    <Col xs={'auto'}>
                                        <MdBackHand className="basic-icon" />
                                    </Col>
                                    <Col xs={'auto'}>
                                        {t('user', { name: this.props.user.data.firstname + ' ' + this.props.user.data.lastname })}
                                    </Col>
                                </Row>
                            </MenuItem>

                            <Divider sx={{ bgcolor: 'black' }} /> */}

                            <div
                                className={"d-flex flex-column m-2 " + styles.userDropDownDiv}
                            >
                                <MenuItem>
                                    <Row className="justify-content-start">
                                        <Col xs={'auto'}>
                                            <MdBackHand className="basic-icon" />
                                        </Col>
                                        <Col xs={'auto'}>
                                            {t('user', { name: this.props.user.data.firstname + ' ' + this.props.user.data.lastname })}
                                        </Col>
                                    </Row>
                                </MenuItem>

                                <Restricted to={PermissionsTypes.MANAGE_MESSAGES}>
                                    <MenuItem onClick={handleClose} component={Link} to='/messages' className={styles.dropDownLink}>
                                        <ListItemIcon>
                                            <MdChatBubble className="basic-icon" />
                                        </ListItemIcon>
                                        {t('messages')}
                                    </MenuItem>
                                </Restricted>

                                <MenuItem onClick={handleClose}>
                                    <ListItemIcon>
                                        <MdOutlineHelp className="basic-icon" />
                                    </ListItemIcon>
                                    {t('help')}
                                </MenuItem>
                            </div>

                            <Divider sx={{ bgcolor: 'black' }} />

                            <MenuItem onClick={() => { handleClose(); this.toggleLogout() }}>
                                <ListItemIcon>
                                    <MdLogout className="basic-icon" />
                                </ListItemIcon>
                                {t('logout')}
                            </MenuItem>
                        </StyledMenu>
                    </div>
                </>
            )
        }

        const BottomNav = ({ }) => {
            const { t } = useTranslation();
            const location = useLocation();

            const [shiftValue, setShiftValue] = useState('/shift');
            const [courseValue, setCourseValue] = useState(coursesPath);
            const [messageValue, setMessageValue] = useState(messagesPath);

            useEffect(() => {

                //path for the shift
                if( location.pathname.includes(shiftReportsPath) ){
                    setShiftValue( shiftReportsPath );
                    return;
                }

                //course pathes, for course details && subjects && add course
                if( location.pathname.includes(courseDetailsPath) || location.pathname === coursesPath ||
                location.pathname.includes(addCoursePath) || location.pathname.includes( subjectPath ) ){
                    setCourseValue( location.pathname );
                    return;
                }

                if( location.pathname.includes( messagesPath ) ){
                    setMessageValue( location.pathname );
                    return;
                }
            }, [location.pathname])

            return (
                <>
                    <div className="d-block d-md-none">
                        <BottomNavigation value={location.pathname}
                            className=""
                            onChange={(event, value) => this.setState({ ...this.state, value: value })}
                            showLabels={false}>



                            {
                                (this.props.user.data.role === 'm' || this.props.user.data.role === 't') &&
                                (
                                    <BottomNavigationAction
                                        component={Link}
                                        to='/shift'
                                        label={t('shift')}
                                        value={shiftValue}
                                        icon={<FaClock className={styles.NavBottomIcons} size={20} />}
                                    />
                                )
                            }

                            <BottomNavigationAction
                                label={t('courses')}
                                value={courseValue}
                                LinkComponent={Link}
                                to='/main_courses'
                                icon={<FaBookOpen className={styles.NavBottomIcons} />}
                            />

                            <BottomNavigationAction
                                label={t('home')}
                                value="/home"
                                LinkComponent={Link}
                                to='/home'
                                icon={<MdHome className={styles.NavBottomIcons} />}
                            />


                            {
                                this.props.user.data.role === 'm' && (
                                    <BottomNavigationAction
                                        label={t("teachers")}
                                        value="/teachers"
                                        LinkComponent={Link}
                                        to='/teachers'
                                        icon={<FaChalkboardTeacher className={styles.NavBottomIcons} />}
                                    />
                                )
                            }

                            {
                                this.props.user.data.role === 'm' && (
                                    <BottomNavigationAction
                                        label={t('students')}
                                        value="/students"
                                        component={Link}
                                        to='/students'
                                        icon={<FaUserGraduate className={styles.NavBottomIcons} />}
                                    />
                                )
                            }


                            {/* <Restricted to={PermissionsTypes.VIEW_MESSAGES}>
                                <BottomNavigationAction
                                    label={t('messages')}
                                    value="/messages"
                                    component={Link}
                                    to='/messages'
                                    icon={<MdChatBubble className={styles.NavBottomIcons} />}
                                />
                            </Restricted> */}

                            {
                                (this.props.user.data.role === 't' || this.props.user.data.role === 's') && (
                                    <BottomNavigationAction
                                        label={t('messages')}
                                        value={ messageValue }
                                        component={Link}
                                        to='/messages'
                                        icon={<MdChatBubble className={styles.NavBottomIcons} />}
                                    />
                                )
                            }

                        </BottomNavigation>
                    </div>
                </>
            );
        }

        const TopNavMobile = ({ }) => {
            const { i18n, t } = useTranslation();
            const languages = [
                {
                    key: 'en',
                    name: 'English'
                },
                {
                    key: 'ar',
                    name: 'عربي'
                },
                {
                    key: 'he',
                    name: 'עברית'
                }
            ]

            return (
                <>
                    <Navbar fixed="top" className={"d-block d-md-none " + styles.topNavBar} >
                        <Container fluid>
                            <Row className="justify-content-between">

                                <Col xs={'auto'}>
                                    <div className="d-flex flex-column justify-content-center h-100">
                                        <Nav navbar>
                                            <Dropdown isOpen={this.state.isOpen} toggle={this.toggleNav}>
                                                <DropdownToggle nav caret>
                                                    {i18n.language === 'en' ? 'English' : i18n.language === 'ar' ? 'عربي' : 'עברית'}
                                                </DropdownToggle>
                                                <DropdownMenu right className="myDropdown mt-1">
                                                    {languages.map(lan => (
                                                        <DropdownItem className="myDropdownItem" key={lan.key}>
                                                            <NavItem onClick={() => this.props.changeLang(lan.key)} className={"text-center dropdown-link"}>
                                                                {lan.name}
                                                            </NavItem>
                                                        </DropdownItem>
                                                    ))}
                                                </DropdownMenu>
                                            </Dropdown>
                                        </Nav>
                                    </div>

                                </Col>
                                <Col xs={'auto'}>
                                    <img src={require('../logIn/LoghatyLogo.jpg')}
                                        height={60} width={100} className=" rounded" alt='LoghatyLogo' />
                                </Col>
                                <Col xs={'auto'} className="d-flex flex-column justify-content-center">
                                    <UserBadge />
                                </Col>
                            </Row>
                        </Container>
                    </Navbar>
                </>
            );
        }

        const DesktopNavbar = () => {
            const { i18n, t } = useTranslation();
            return (
                <>
                    <Navbar expand sticky="top" className="mynav d-none d-md-block ">
                        <div className="container" >
                            <div className="row ">
                                <NavbarBrand href="/home" className="m-auto col-auto">
                                    <img src={require('../logIn/LoghatyLogo.jpg')} height={60} width={100} className="rounded" alt='LoghatyLogo' />
                                </NavbarBrand>
                                <Collapse isOpen={this.state.isOpen} navbar className="col-auto">
                                    <Nav navbar>
                                        <NavItem>
                                            <NavLink to='/home' className='nav-link'>
                                                <Row className="justify-content-center g-2">
                                                    <Col xs={'auto'}>
                                                        <MdHome className="basic-icon" />
                                                    </Col>
                                                    <Col xs={'auto'}>
                                                        {t('home')}
                                                    </Col>
                                                </Row>
                                            </NavLink>
                                        </NavItem>

                                        <Restricted to={PermissionsTypes.ACCESS_TEACHERS}>
                                            <UncontrolledDropdown nav inNavbar setActiveFromChild>
                                                <DropdownToggle nav >
                                                    <Row className="justify-content-center g-2">
                                                        <Col xs={'auto'}>
                                                            <FaChalkboardTeacher className="basic-icon" />
                                                        </Col>
                                                        <Col xs={'auto'}>
                                                            {t('teachers')}
                                                        </Col>
                                                    </Row>
                                                </DropdownToggle>

                                                <DropdownMenu right className="myDropdown mt-1">
                                                    <DropdownItem className="myDropdownItem">
                                                        <NavLink to='/teachers' className={'dropdown-link'} >
                                                            {t('teachers')}
                                                        </NavLink>
                                                    </DropdownItem>
                                                    <DropdownItem className="myDropdownItem">
                                                        <NavLink to='/shift' className={'dropdown-link'} >
                                                            {t('shift')}
                                                        </NavLink>
                                                    </DropdownItem>
                                                </DropdownMenu>
                                            </UncontrolledDropdown>
                                        </Restricted>

                                        <Restricted to={PermissionsTypes.ACCESS_STUDENTS}>
                                            <NavItem>
                                                <NavLink to='/students' className='nav-link' >
                                                    <Row className="justify-content-center g-2">
                                                        <Col xs={'auto'}>
                                                            <FaUserGraduate className="basic-icon" />
                                                        </Col>
                                                        <Col xs={'auto'}>
                                                            {t('students')}
                                                        </Col>
                                                    </Row>
                                                </NavLink>
                                            </NavItem>
                                        </Restricted>

                                        <NavItem>
                                            <NavLink to='/main_courses' className='nav-link'>
                                                <Row className="justify-content-center g-2">
                                                    <Col xs={'auto'}>
                                                        <FaBookOpen className="basic-icon" />                                                    </Col>
                                                    <Col xs={'auto'}>
                                                        {t('courses')}
                                                    </Col>
                                                </Row>
                                            </NavLink>
                                        </NavItem>

                                        <Restricted to={PermissionsTypes.VIEW_MESSAGES}>
                                            <NavItem>
                                                <NavLink to='/messages' className='nav-link'>
                                                    <Row className="justify-content-center g-2">
                                                        <Col xs={'auto'}>
                                                            <MdChatBubble className="basic-icon" />                                                    </Col>
                                                        <Col xs={'auto'}>
                                                            {t('messages')}
                                                        </Col>
                                                    </Row>
                                                </NavLink>
                                            </NavItem>
                                        </Restricted>

                                        <Restricted to={PermissionsTypes.TEACHER_SHIFT}>
                                            <NavItem>
                                                <NavLink to='/shift' className='nav-link'>
                                                    <Row className="justify-content-center g-2">
                                                        <Col xs={'auto'}>
                                                            <FaClock className="basic-icon" />                                                    </Col>
                                                        <Col xs={'auto'}>
                                                            {t('shift')}
                                                        </Col>
                                                    </Row>
                                                </NavLink>
                                            </NavItem>
                                        </Restricted>

                                    </Nav>
                                    <Nav navbar style={{ backgroundColor: 'none' }} className={this.props.direction === DIRECTIONS.LTR ? 'ms-auto' : 'me-auto'}>
                                        <NavItem className="d-flex flex-row align-items-center">
                                            <Col xs={'auto'}>
                                                <ButtonGroup aria-label="language changer" className={styles.btnGrp} role="group">
                                                    <Input type="radio" className={"btn-check " + styles.lanBtn} name="en" id="en"
                                                        checked={i18n.language === 'en'} onChange={() => this.props.changeLang('en')} />
                                                    <Label className={[styles.lanBtn + ' ', i18n.language === 'en' ? styles.checkedLang : ''].join('')} for="en"  >English</Label>

                                                    <Input type="radio" className="btn-check" name="btnradio" id="btnradio2"
                                                        checked={i18n.language === 'ar'} onChange={() => this.props.changeLang('ar')} />
                                                    <Label className={[styles.lanBtn + ' ', i18n.language === 'ar' ? styles.checkedLang : ''].join('')} for="btnradio2">عربي</Label>

                                                    <Input type="radio" className="btn-check" name="btnradio" id="btnradio3"
                                                        checked={i18n.language === 'he'} onChange={() => this.props.changeLang('he')} />
                                                    <Label className={[styles.lanBtn + ' ', i18n.language === 'he' ? styles.checkedLang : ''].join('')} for="btnradio3">עברית</Label>
                                                </ButtonGroup>
                                            </Col>
                                        </NavItem>
                                        <NavItem className="m-1">
                                            <UserBadge />
                                        </NavItem>
                                    </Nav>
                                </Collapse>
                            </div>
                        </div>
                    </Navbar>
                </>
            );
        };

        return (
            <>
                <DesktopNavbar />
                <TopNavMobile />
                <BottomNav />
                <LogOutModal isOpen={this.state.openLogoutModal} toggle={this.toggleLogout} logout={this.props.logout} />
            </>
        );
    }
}
export default withDirection(Header);


/*
            <Nav className="col-md-12 d-none d-md-block bg-light sidebar"
            activeKey="/home"
            onSelect={selectedKey => alert(`selected ${selectedKey}`)}
            >
                <div className="sidebar-sticky"></div>
            <Nav.Item>
                <Nav.Link href="/home">Active</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="link-1">Link</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="link-2">Link</Nav.Link>
            </Nav.Item>
            <Nav.Item>
                <Nav.Link eventKey="disabled" disabled>
                Disabled
                </Nav.Link>
            </Nav.Item>
            </Nav>  
*/
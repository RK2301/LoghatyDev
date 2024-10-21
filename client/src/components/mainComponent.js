import './main.css';
import Header from './header/headerComponent';
import React, { Component } from 'react';
import { Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group'
import { DIRECTIONS } from 'react-with-direction';
import Teachers from './teachers/teachersComponents'
import CourseMain from './courses/courseMain';
import CourseDetails from './courses/CourseDetails';
import Language from './language/language';
import PermissionProvider from '../permissions/PermissionProvider';
import Students from './students/Students';
import SubjectContainer from './subject/subjectContainer';
import AddCourse from './courses/AddCourse';
import ShiftManager from './teachers/shift/ShiftManager';
import Home from './Home/Home';
import MessageContainer from './message/MessageContainer';
import MessageForm from './message/MessageForm';
import { connect } from 'react-redux';
import { animated, useSpring } from '@react-spring/web';
import AnimatedRoute from './AnimatedRoute';
import { addCoursePath, coursesPath, teachersPath } from '../redux/config';



const mapStateToProps = (state) => ({
    user: state.login
});


class MainComponent extends Component {

    constructor(props) {
        super(props);
        this.state = {
            pathArr: ['home', 'Teachers'],
            lang: ''
        }
        this.changeLang = this.changeLang.bind(this);
    }

    changeLang(newLang) {

        this.setState({
            lang: newLang,
        });
        this.props.i18n.changeLanguage(newLang);
        newLang === 'en' ? this.props.changeDirection(DIRECTIONS.LTR) : this.props.changeDirection(DIRECTIONS.RTL);
        try {
            sessionStorage.setItem('lan', newLang);
        } catch (e) { }
    }

    render() {



        const AnimationComponent = () => {
            const location = useLocation();

            return (
                // <TransitionGroup>
                //     <CSSTransition key={location.key} classNames={'page'} timeout={2000}>
                <Routes location={location}>
                    {/* <Route path='/home' element={ } /> */}
                    <Route path='/home' element={
                        <AnimatedRoute children={<Home user={this.props.user.data} />} path={'/home'} />
                    } />
                    
                    <Route path='/teachers' element={
                      <AnimatedRoute path={teachersPath} children={<Teachers user={this.props.user} _delete={this.props._delete} />} />
                    }/>

                    <Route path='/students' element={
                        <AnimatedRoute children={<Students token={this.props.user.token} user={this.props.user} />} path={'/students'} />
                    } />

                    <Route path='/main_courses' element={
                     <AnimatedRoute path={coursesPath} children={ <CourseMain user={this.props.user.data} token={this.props.user.token} /> } />
                    }/>

                    <Route path="/courseDetails/:id/*" element={
                    <CourseDetails token={this.props.user.token} user={this.props.user.data} />
                    }/>
                    
                    <Route path='/shift/*' element={<ShiftManager teacher={this.props.user.data} token={this.props.user.token} />} />
                    <Route path='/subjects/*' element={ <SubjectContainer />} />

                    <Route path='/addcourse' element={
                     <AnimatedRoute path={addCoursePath} children={<AddCourse />} />
                    }>
                        <Route path='/addcourse/:id' element={<AnimatedRoute path={addCoursePath} children={<AddCourse addMode={false} />}  />} />
                    </Route>
                    <Route path='/messages/add' element={<MessageForm mode='a' addNewMessage={this.props.addNewMessage} />} />
                    <Route path='/messages/*' element={<MessageContainer user={this.props.user.data} />} />
                    <Route path='/*' element={<Navigate to='/home' />} />
                </Routes>
                //     </CSSTransition>
                // </TransitionGroup>
            )
        }

        const AppContent = () => {

            return (
                <PermissionProvider userPermissions={this.props.user.permissions}>
                    <div className='container-fluid' id='appContainer'>
                        <div className='row mainRow'  >
                            <div className='col-12' >
                                <div className='d-flex flex-column h-100'>
                                    <div className='row'>
                                        <div className='col-12'>
                                            <Header changeDirection={this.props.changeDirection} t={this.props.t} i18n={this.props.i18n}
                                                lang={this.state.lang} changeLang={this.changeLang}
                                                getTeachers={this.props.getTeachers} user={this.props.user} getCurrentShift={this.props.getCurrentShift}
                                                logout={this.props.logout} />
                                        </div>
                                    </div>

                                    <div className='row flex-grow-1 pt-3' >
                                        <AnimationComponent />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </PermissionProvider>
            );
        }

        return (
            <Routes>
                <Route path='/language/:course_id/:lan/:student_username' element={<Language student={this.props.user.data} token={this.props.user.token} />} />
                <Route path='/*' element={<AppContent />} />
            </Routes>
        );
    }
}

export default connect(mapStateToProps)(MainComponent);

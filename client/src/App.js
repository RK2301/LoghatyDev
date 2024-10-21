import './App.css';
import React, { Component, useEffect } from 'react';
import LogIn from './components/logIn/logInComp';
import MainComponent from './components/mainComponent';
import SuccessSnack from './components/feedback/Snackbar';
import './App.css'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { connect, useDispatch, useSelector } from 'react-redux'
import { _delete, getCurrentShift, logout, addNewMessage, logUserWithCookies, connection_status } from './redux/ActionCreators'
import DirectionProvider, { DIRECTIONS } from 'react-with-direction/dist/DirectionProvider';
import './i18next/i18n';
import { useTranslation } from 'react-i18next'
import { Suspense } from 'react';
import { Util } from 'reactstrap';
import { ThemeProvider } from '@emotion/react';
import { changeMuiDirection, theme } from './components/materialUiOverride';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import i18next from 'i18next';
import ErrorSnackbar from './components/feedback/ErrorSnackbar';
import Cookies from 'js-cookie';
import BackDropSpinner from './components/backDropSpinner/BackDropSpinner';
import { useState } from 'react';
import rtlPlugin from 'stylis-plugin-rtl';
import { CacheProvider } from '@emotion/react';
import createCache from '@emotion/cache';
import { prefixer } from 'stylis';
import { useTheme } from '@mui/material';
import ConnectionSnakbar from './components/feedback/ConnectionSnackbar';

// Create rtl cache
const cacheRtl = createCache({
  key: 'muirtl',
  stylisPlugins: [prefixer, rtlPlugin],
});

Util.setGlobalCssModule({
  btn: 'myBtn'
});

const mapStateToProps = (state) => ({
});

const mapDispacthToProps = (dispatch) => ({
  _delete: (id, token, oprType, changeState) => dispatch(_delete(id, token, oprType, changeState)),
  getCurrentShift: (user_id, token) => dispatch(getCurrentShift(user_id, token)),
  logout: () => dispatch(logout()),
  addNewMessage: (message, resetForm, setSubmitting) => dispatch(addNewMessage(message, resetForm, setSubmitting)),
  logUserWithCookies: (username) => dispatch(logUserWithCookies(username))
});

const App = ({ _delete, getCurrentShift, logout, addNewMessage, logUserWithCookies }) => {

  const [t, i18n] = useTranslation();
  const [direction, setDirection] = useState(DIRECTIONS.LTR);

  const changeDirection = (direction) => {
    setDirection(direction);
  };

  useEffect(() => {
    try {
      sessionStorage.setItem('lan', i18next.language);
      if (i18n.language !== 'en')
        setDirection(DIRECTIONS.RTL);

      // Register the service worker here
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker
          .register('/service-worker.js') // Specify the correct path to your service worker file
          .then((registration) => {
            console.log('Service Worker registered with scope:', registration.scope);
          })
          .catch((error) => {
            console.error('Service Worker registration failed:', error);
          });
      }

    } catch (e) { }
  }, []);


  const GetTheNextPage = () => {
    const { i18n, t } = useTranslation();
    const { data } = useSelector((state) => state.login);
    const cookie = Cookies.get('rememmber');
  

    /**when a rememmber cookie found then make a quick api call to get user data and token
     * if success move to main component, error move back to the logIn
     */
    const CookieRender = ({ }) => {
      useEffect(() => logUserWithCookies(cookie), []);
      const { isLoading, error } = useSelector(state => state.operation);

      if (isLoading)
        return (
          <BackDropSpinner isOpen={true} />
        );

      if (error)
        return (
          <Navigate to={'/login'} />
        );
    };

    if (cookie && !data.username)
      return (<CookieRender />)

    if (!data.username) {
      return (
        <Navigate to={'/login'} />
      )
    }
    return (
      <>
        <MainComponent changeDirection={changeDirection} t={t} i18n={i18n}
          // lang={lang} changeLang={changeLang}
          _delete={_delete}
          getCurrentShift={getCurrentShift}
          logout={[logout]} addNewMessage={addNewMessage} />
        <SuccessSnack />
        <ConnectionSnakbar />
      </>
    );
  }

  const Direction = () => {
    const Body = () => (
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <Routes>
            <Route path='/login' element={<LogIn />} />
            <Route path='/*' element={<GetTheNextPage />} />
          </Routes>
          <ErrorSnackbar />
        </LocalizationProvider>
      </ThemeProvider>
    );

    return (
      <>
        {
          direction === DIRECTIONS.LTR ? <Body /> : (
            <CacheProvider value={cacheRtl}>
              <Body />
            </CacheProvider>
          )
        }
      </>
    )
  }

  return (
    <Suspense fallback={<BackDropSpinner isOpen={true} />}>
      <BrowserRouter>
        <DirectionProvider direction={direction}>
          <Direction />
        </DirectionProvider>
      </BrowserRouter>
    </Suspense>
  );

};


// class App extends Component {

//   constructor(props) {
//     super(props);
//     this.state = {
//       direction: DIRECTIONS.LTR,
//     }
//   }

//   componentDidMount() {
//     try {
//       sessionStorage.setItem('lan', i18next.language);
//     } catch (e) { }
//   }
//   changeDirection = (dir) => {
//     this.setState({
//       direction: dir,
//     })
//   }
//   render() {

//     const GetTheNextPage = () => {
//       const { i18n, t } = useTranslation();
//       const { data } = useSelector((state) => state.login);
//       const cookie = Cookies.get('rememmber');

//       /**when a rememmber cookie found then make a quick api call to get user data and token
//        * if success move to main component, error move back to the logIn
//        */
//       const CookieRender = ({ }) => {
//         useEffect(() => this.props.logUserWithCookies(cookie), []);
//         const { isLoading, error } = useSelector(state => state.operation);

//         if (isLoading)
//           return (
//             <BackDropSpinner isOpen={true} />
//           );

//         if (error)
//           return (
//             <Navigate to={'/login'} />
//           );
//       };

//       if (cookie && !data.username)
//         return (<CookieRender />)

//       if (!data.username) {
//         return (
//           <Navigate to={'/login'} />
//         )
//       }
//       return (
//         <>
//           <MainComponent changeDirection={this.changeDirection} t={t} i18n={i18n}
//             lang={this.state.lang} changeLang={this.changeLang}
//             _delete={this.props._delete}
//             getCurrentShift={this.props.getCurrentShift}
//             logout={[this.props.logout]} addNewMessage={this.props.addNewMessage} />
//           <SuccessSnack />
//           <ErrorSnackbar />
//         </>
//       );
//     }

//     return (
//       <Suspense fallback={<BackDropSpinner isOpen={true} />}>
//         <BrowserRouter>
//           <DirectionProvider direction={this.state.direction}>
//             <ThemeProvider theme={theme}>
//               <LocalizationProvider dateAdapter={AdapterDayjs}>
//                 <Routes>
//                   <Route path='/login' element={<LogIn />} />
//                   <Route path='/*' element={<GetTheNextPage />} />
//                 </Routes>
//               </LocalizationProvider>
//             </ThemeProvider>
//           </DirectionProvider>
//         </BrowserRouter>
//       </Suspense>
//     );
//   }
// }

//There is not store or Provider tag in the context or prop of that component and so the
// component throws an error because it want to see a Provider tag or store in its parent hierarchy.
export default (connect(mapStateToProps, mapDispacthToProps)(App));

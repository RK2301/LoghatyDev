import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import  LanguageDetector   from 'i18next-browser-languagedetector'
import XHR from "i18next-http-backend";
import i18nBackend  from 'i18next-http-backend';



i18n
.use( XHR )
.use( initReactI18next )
.use( LanguageDetector )
.use( i18nBackend )
.init({
   // lng:  ,
    fallbackLng: 'en',
    interpolation: {
        escapeValue: false
    },
    // backend: {
    //     loadPath: 'http://localhost:80/api/translate',
    //     parse: (data) => {
    //        const toReturn = JSON.parse(data);
    //        console.log(toReturn);
    //        return toReturn;
    //     }
    // },
    backend: {
        loadPath: "http://localhost:80/i18n/{{lng}}.json",
    }
});


export default i18n;
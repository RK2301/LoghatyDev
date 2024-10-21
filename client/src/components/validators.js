import { t } from "i18next";
import { checkUsername } from '../redux/ActionCreators'

/**
 * Check if required value, if there is no value then a error message will 
 * be store to the errors object
 * @param {*} value 
 * @param {*} name 
 * @param {*} errors 
 * @returns 
 */
export const required = (value, name, errors) => {
    if (!value) {
        errors[name] = t('required');
        return true;
    }
    return false;
}

/**
 * Check if a given string contain only numbers
 * @param {*} value 
 * @param {*} name 
 * @param {*} errors Object errors to store a error if found
 * @returns true if error found, else false
 */
export const onlyNumbers = (value, name, errors) => {
    const regex = /^[0-9]+$/;
    if (!regex.test(value)) {
        errors[name] = t('onlyNumbers');
        return true;
    }
    return false;
}

/**
 * Check if given string equal to the given length, if not an error message for name 
 * filed will be placed
 * @param {*} value 
 * @param {*} name 
 * @param {*} length 
 * @param {*} errors 
 * @returns true if error found, else false
 */
export const sholudEqual = (value, name, length, errors) => {
    if (value.length !== length) {
        errors[name] = t('sholudBeEqual', { length: length });
        return true;
    }
    return false;
}

/**
 * 
 * @param {*} min minimum length to check if given string is at least with min length
 * @returns return a function which will check if a given  
 * the return function if found an error will stored to the errors object
 */
export const shouldBeAtLeast = (min) => (value, name, errors) => {
    if (value.length < min) {
        errors[name] = t('shouldBeAtLeast', { min: min });
        return true;
    }
    return false
}

/**
 * 
 * @param {*} max maxiumum length to check if given string is at most with max length
 * @returns return a function which will check if a given strin at most max length
 * the returned function if found an error will stored to the errors object
 */
export const shouldBeAtMost = (max) => (value, name, errors) => {
    if (value.length > max) {
        errors[name] = t('shouldBeAtMost', { max: max });
        return true;
    }
    return false
}

/**
 * for a given number check if the value between the range in other words
 *  from <= value <= to
 * @param {*} value a number
 * @param {*} from 
 * @param {*} to 
 * @param {*} errors 
 */
export const valueBetween = (value, from, to, name, errors) => {
    if (!value || isNaN(value) || isNaN(from) || isNaN(to))
        return false;

    if (value >= from && value <= to)
    return true
    else
    errors[name] = t('gradeValue')

}

/**
 * make an api call to check if the given username is unique
 * @param {*} username 
 * @param {*} token to authentication for the server
 * @returns error message if there an error, else undefined
 */
export const uniqueUsername = async (username, token) => {

    let error;
    try {
        await checkUsername(token, username)();
    } catch (err) {
        error = err;
    }
    return error;
}

/**check if word contain capital letter */
export const containCapitalLetter = (word, name, errors) =>  {
   const res = /[A-Z]/g.test(word);
   if(!res && errors)
      errors[name] = '  ';
    return res;
};

/**check if a word cotain a number at least */
export const containNumbers = (word, name, errors) => {
    const res = /[1-9]/g.test(word);

    if(!res && errors)
       errors[name] = '  ';
    return res;
}
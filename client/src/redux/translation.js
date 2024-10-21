import { TRANSLATE_FAILED, TRANSLATE_SUCESS } from "./ActionTypes";


export const translation = (state = {
    en: {},
    ar: {},
    he: {},
    err: undefined
}, action) => {
    switch(action.type) {
        case TRANSLATE_SUCESS:
            return {...state, en: action.payload.en, ar: action.payload.ar, he: action.payload.he};
        case TRANSLATE_FAILED :
            return {...state, err: action.payload};  
    }
}

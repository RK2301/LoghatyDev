import * as ActionTypes from './ActionTypes';

export const Teachers = (state = {
    loading: false,
    error: undefined,
    teachers: []
}, action) => {
    switch(action.type){
        
        case ActionTypes.LOADING_TEACHERS:
            return { ...state, loading: true, error: undefined, teachers: [] };

        case ActionTypes.ADD_TEACHERS:
            return { ...state, loading: false, error: undefined, teachers: action.payload };

        case ActionTypes.ERR_LOAD_TEACHERS:
            return { ...state, loading: false, error: action.payload, teachers: [] };

        case ActionTypes.ADD_NEW_TEACHER:
            const cpyArr = state.teachers.slice();
            cpyArr.push(action.payload);
            return { ...state, loading: false, error: undefined, teachers: cpyArr };

        case ActionTypes.DELETE_TEACHER:
            const cpyTeachers = state.teachers.slice();
            const delIndex = cpyTeachers.findIndex( (teacher) => teacher.id === action.payload );
            if(delIndex !== -1) { cpyTeachers.splice(delIndex, 1); }
            return { ...state, loading: false, error: undefined, teachers: cpyTeachers };   

        case ActionTypes.REFRESH_TEACHERS:
            return { ...state, loading:false, error: undefined, teachers: []}    
        
        case ActionTypes.UPD_TEACHER:
            const toUpTeacherArr = state.teachers.slice();
            const i = toUpTeacherArr.findIndex( teacher => teacher.id === action.payload.id );
           if (i !== -1) toUpTeacherArr.splice(i, 1, action.payload);
           return {...state, loading: false, error: undefined, teachers: toUpTeacherArr};  
            
        default: 
            return state;               
    }
}
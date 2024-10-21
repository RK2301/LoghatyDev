import { ManagerPermissions, StudentPermissions, TeacherPermissions } from '../permissions/userPermissions';
import * as Action_Types from './ActionTypes';
import Cookies from 'js-cookie';

export const Login = (state = {
    loading: false,
    error: undefined,
    data: {},
    token: '',
    permissions : []
}, action) => {
    switch(action.type){
        case Action_Types.LOG_IN_LOADING:
            return { ...state , loading:true, error:undefined, data:[], token: '', permissions : []};

        case Action_Types.LOG_IN_FAILED:
            return { ...state, loading:false, error:action.payload, data:[], token: ''};

        case Action_Types.LOG_IN_SUCCESS:
            let userPermissions = [];
            switch(action.payload.data.role){//give the user appropirate permissions
                case 's':
                    userPermissions = StudentPermissions;
                    break;
                case 't':
                    userPermissions = TeacherPermissions;
                    break;
                case 'm':
                    userPermissions = ManagerPermissions;
                    break;
                 default:
                    userPermissions = []           
            }
            /**Save user data to renew later the token from the nodejs */
            sessionStorage.setItem('username', action.payload.data.username);
            sessionStorage.setItem('token', action.payload.token);

            console.log(action.payload.data);
            return {...state, loading:false, error:undefined, data:action.payload.data, token:action.payload.token, permissions: userPermissions };

        case Action_Types.LOG_OUT:
            //delete cookie and reset the data object
            Cookies.remove('rememmber');
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('username');
            return {...state, loading:false, error:undefined, data: {}, token: ''};    
        default:
            return state;         
    }
}
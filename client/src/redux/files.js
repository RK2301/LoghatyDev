import * as Action_types from './ActionTypes';

export const FilesReport = (state = {
    isLoading: true,
    error: undefined,
    files: [],
    id: ''
}, action) => {
    switch(action.type) {
        case Action_types.Loading_Files :
         return { ...state, isLoading: true, error: undefined, fiels: [], id: action.payload};

        case Action_types.Error_Loading_Files:
            return { ...state, isLoading:false, error: action.payload, files: []};
         
        case Action_types.Load_Files_Success: 
        return { ...state, isLoading: false, error: undefined, files: action.payload };

        case Action_types.ADD_NEW_FILE:
            const toAdd = state.files.slice();
            toAdd.push(action.payload);
            console.log(toAdd);
            return { ...state, isLoading: false, error: undefined, files: toAdd  };

        case Action_types.DELETE_FILE: 
         const delArr = state.files.slice();
         const delIndex = delArr.findIndex(file => file.id === action.payload);
         if(delIndex !== -1)
           delArr.splice(delIndex, 1);  
         return { ...state, isLoading: false, error: undefined, files: delArr };

         default:
            return state;
    }
}

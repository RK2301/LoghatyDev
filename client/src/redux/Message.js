import * as ActionTypes from './ActionTypes';

export const Messages = (state = {
    isLoading: false,
    error: false,
    messages: []
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_MESSAGES:
            return { isLoading: true, error: undefined, messages: [] };

        case ActionTypes.ERROR_MESSAGES:
            return { isLoading: false, error: action.payload, messages: [] };


        case ActionTypes.ADD_MESSAGES:
            return { isLoading: false, error: undefined, messages: action.payload };
            
        
        case ActionTypes.ADD_NEW_MESSAGE:
            const newMessagesArr = state.messages.slice();
            newMessagesArr.unshift( action.payload )
            return { isLoading:false, error: undefined, messages: newMessagesArr}    
        
        case ActionTypes.UPDATE_MESSAGE:
            const allMessages = state.messages.slice();
            const indexToUpdate = allMessages.findIndex(message => message.message_id === action.payload.message_id);
            if(indexToUpdate !== -1){
                const messageToUpdate = {...allMessages[indexToUpdate]};
                messageToUpdate.message_title = action.payload.message_title;
                messageToUpdate.message_content = action.payload.message_content;
                allMessages[indexToUpdate] = messageToUpdate;
            }

            return {...state, messages: allMessages};

        case ActionTypes.DELETE_MESSAGE: 
            const toDeleteArr = state.messages.slice();
            const delIndex = toDeleteArr.findIndex(message => message.message_id === action.payload);
            if(delIndex !== -1)
               toDeleteArr.splice(delIndex, 1);
            
               return {...state, messages: toDeleteArr};

               default:
                return state;
    }
}
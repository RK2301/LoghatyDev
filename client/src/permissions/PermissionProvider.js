import React from 'react';
import PermissionConetxt from './PermissionContext';

const PermissionProvider = ( { userPermissions, children } ) => {

    const isAllowedTo = (permission) => {
       return userPermissions.findIndex( per => per === permission ) !== -1
    }

    return <PermissionConetxt.Provider value={ {isAllowedTo} }> { children } </PermissionConetxt.Provider>
}

export default PermissionProvider;
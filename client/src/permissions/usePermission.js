import { useContext } from "react";
import PermissionConetxt from "./PermissionContext";

const usePermission = ( permission ) => {
    const { isAllowedTo } = useContext(PermissionConetxt);
    return isAllowedTo(permission);
}

export default usePermission;
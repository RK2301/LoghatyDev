import React, { useContext } from "react";
import usePermission from "./usePermission";

const Restricted = ( { to ,fallback ,children } ) => {

    const allowed = usePermission( to );
    if( allowed ){
        return <> { children } </>
    }
    else if( fallback ){
        return <> { fallback } </>
    }
    return <> </>
}
export default Restricted;
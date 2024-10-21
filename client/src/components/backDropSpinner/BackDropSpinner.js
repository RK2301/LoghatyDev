import { Backdrop } from "@mui/material";
import { PuffLoader } from 'react-spinners';

const BackDropSpinner = ({isOpen}) => {

    return (
        <Backdrop open={isOpen} sx={{ zIndex: 999 }}>
            <PuffLoader size={100} />
        </Backdrop>
    );

}

export default BackDropSpinner;
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import ShiftReport from './ShiftReport';
import Shift from './shift';

const ShiftManager = ( { teacher, token} ) => {

    return(
        <Routes>
            <Route path='/reports' element={ <ShiftReport teacher={teacher} />} />
            <Route path='/*' element={<Shift teacher={teacher} token={token} />} />
        </Routes>
    )
}

export default ShiftManager;
import { formatDateTime, formatDateTimeWithSeconds } from '../components/services';
import * as ActionTypes from './ActionTypes';

export const Shifts = (state = {
    isLoading: false,
    error: undefined,
    shifts: []
}, action) => {
    switch (action.type) {
        case ActionTypes.LOADING_SHIFTS:
            return { isLoading: true, error: undefined, shifts: [] };


        case ActionTypes.ERROR_SHIFTS:
            return { isLoading: false, error: action.payload, shifts: [] }

        case ActionTypes.ADD_SHIFTS:
            action.payload.forEach(shift => {
                shift.start_shift = formatDateTimeWithSeconds(shift.start_shift);
                shift.start_shift_date = new Date(formatDateTimeWithSeconds(shift.start_shift));

                if (shift.end_shift) {
                    shift.end_shift = formatDateTimeWithSeconds(shift.end_shift);
                    shift.end_shift_date = new Date(formatDateTimeWithSeconds(shift.end_shift));
                }
            });
            console.log(action.payload);
            return { isLoading: false, error: undefined, shifts: action.payload };

        case ActionTypes.UPDATE_SHIFT:
            const shift = action.payload;

            const index = state.shifts.findIndex(s => s.teacher_id === shift.teacher_id && formatDateTimeWithSeconds(s.start_shift) === formatDateTimeWithSeconds(shift.old_start_shift));
            const updateShift = { ...state.shifts[index] };

            updateShift.start_shift = shift.new_start_shift;
            updateShift.end_shift = shift.end_shift ? shift.end_shift : null;

            const shifts = state.shifts.slice();
            shifts.splice(index, 1, updateShift);

            return { ...state, error: undefined, shifts: shifts };

        case ActionTypes.DELETE_SHIFT:
            const {teacher_id, start_shift} = action.payload

            const delIndex = state.shifts.findIndex(s => s.teacher_id === teacher_id && formatDateTimeWithSeconds(s.start_shift) === formatDateTimeWithSeconds(start_shift))

            const delShifts = state.shifts.slice()
            delShifts.splice(delIndex, 1)

            return { ...state, error: undefined, shifts: delShifts}

        default:
            return state;
    }
}
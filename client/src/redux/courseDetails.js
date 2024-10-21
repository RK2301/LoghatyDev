import * as Action_Types from './ActionTypes';

export const CourseDetails = (state = {
    isLoading: false,
    error: undefined,
    courseDetails: {}
}, action) => {
    switch(action.type){
        case Action_Types.LOADING_DETAILS:
            return { ...state, isLoading: true, error: undefined, courseDetails: {}};
          
        case Action_Types.ERROR_DETAILS:
            return { ...state ,isLoading: false, error: action.payload, courseDetails: {}};
            
        case Action_Types.ADD_DETAILS:
            return { ...state ,isLoading: false, error: undefined, courseDetails: getCourseDetails(action.payload) }; 

        case Action_Types.ADD_LESSON:
            const cd = {...state.courseDetails};
            const allLesson = cd.lessons.slice();
            allLesson.push( action.payload );
            cd.lessons = allLesson;
            return {  ...state, isLoading: false, error: undefined, courseDetails: cd};
            
        case Action_Types.UPDATE_LESSON:
            const CD = {...state.courseDetails};
            const lessonArr = CD.lessons.slice();
            const toReplace = lessonArr.findIndex( lesson => lesson.lesson_id === action.payload.lesson_id) ;
            if( toReplace !== -1)
             lessonArr.splice(toReplace, 1, action.payload) ;

             CD.lessons = lessonArr;
          return {  ...state, isLoading: false, error: undefined, courseDetails: CD};

        case Action_Types.DELETE_LESSON:
            const c_d = {...state.courseDetails};
            const delete_lesson_arr = c_d.lessons.slice();
            const toDelete = delete_lesson_arr.findIndex( lesson => lesson.lesson_id === action.payload) ;
            if( toDelete !== -1)
             delete_lesson_arr.splice(toDelete, 1) ; 
            
             c_d.lessons = delete_lesson_arr;
            return {  ...state, isLoading: false, error: undefined, courseDetails:c_d } ;

        case Action_Types.ADD_UNIT:
                const new_course_details = {...state.courseDetails};
                const new_unit = action.payload;
                const files = new_course_details.files.concat(new_unit.files);

                //remove the files array from the unit object
                delete new_unit.files;
                const units = new_course_details.units.slice();
                units.push( new_unit );

                new_course_details.files = files;
                new_course_details.units = units;

                return{ ...state, isLoading: false, error: undefined, courseDetails: new_course_details };

        case Action_Types.UPDATE_UNIT:
              const upd_unit = action.payload;
              upd_unit.unit_id = parseInt(upd_unit.unit_id);
              upd_unit.lesson_id = parseInt(upd_unit.lesson_id);
              if(upd_unit.note_id)
                upd_unit.note_id = parseInt( upd_unit.note_id )  

              const copy_files = state.courseDetails.files.slice();       
              const new_files = copy_files.concat( upd_unit.files ); 
              delete upd_unit.files;

              const copy_units = state.courseDetails.units.slice();
              const delIndex = copy_units.findIndex(unit => unit.unit_id === upd_unit.unit_id);
              if(delIndex !== -1)
                copy_units.splice(delIndex, 1, upd_unit);
              
              return {...state, courseDetails: {...state.courseDetails, units: copy_units, files: new_files}};
           
        case Action_Types.DELETE_UNIT: 
        const unit_id = action.payload;
        let filesArr = state.courseDetails.files.slice();
        filesArr = filesArr.filter(file => file.unit_id !== unit_id);

        const unitArr = state.courseDetails.units.slice();
        const delUnitIndex = unitArr.findIndex(unit => unit.unit_id === unit_id);
        if( delUnitIndex !== -1 )
         unitArr.splice(delUnitIndex, 1);

         return {...state, courseDetails: {...state.courseDetails, files: filesArr, units: unitArr}}  
              
        case Action_Types.DELETE_UNIT_FILE:
                const file_id = action.payload;
                console.log(`the file to delete ${file_id}`);
                const deleteFilesArr = state.courseDetails.files.slice();
                const deleteIndex = deleteFilesArr.findIndex(file => file.file_id === file_id);
                if(deleteIndex !== -1)
                  deleteFilesArr.splice(deleteIndex, 1);
                console.log(deleteFilesArr);
                return {...state, courseDetails: {...state.courseDetails, files: deleteFilesArr}}  

        
        default:
            return state;    
    }
}

const getCourseDetails = (courseDetails) => {
    //console.log(courseDetails);

    const toReturn = {
        lessons: [],
        units: [],
        files: []
    }

    courseDetails.forEach( course => {
        if (course.lesson_id && !toReturn.lessons.filter(lesson => lesson.lesson_id === course.lesson_id)[0] ) 
          toReturn.lessons.push({
            lesson_id : course.lesson_id,
            course_id : course.course_id,
            lesson_date: course.lesson_date,
            lesson_time : course.lesson_time,
            lesson_title : course.lesson_title,
            is_visible : course.is_visible,
            visible_time : course.visible_time,
          })

        if(course.unit_id && !toReturn.units.filter(unit => unit.unit_id === course.unit_id)[0] ){
            let toPush = {
                unit_id: course.unit_id,
                lesson_id: course.lesson_id,
                note_id : course.note_id || 0,
                note_text: course.note_text
              };
            if(course.submit_time)
             toPush = { ...toPush,
             hw_visible: Boolean(course.hw_visible),
             submit_time: course.submit_time,
             upload_time: course.upload_time,
             hw_visible_time: course.hw_visible_time,
             hw_title: course.hw_title
            } 
           toReturn.units.push(toPush) ;
        }

         if(course.file_id && !toReturn.files.filter( file => file.file_id === course.file_id)[0] )
           toReturn.files.push({
            file_id : course.file_id,
            upload_date : course.upload_date,
            user_upload : course.user_upload,
            file_name : course.file_name,
            unit_id: course.unit_id
           })

    } );

    console.log(toReturn);
    return toReturn;
}
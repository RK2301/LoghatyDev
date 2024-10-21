const queries = require('../queries');
const conn = require('../db');

/**
 * query the db to get all the subjects
 * @param {*} req the requrest object, to use the t function
 * @returns 
 */
const getAllSubjects = ( req ) => {
    return new Promise((resolve, reject) => {
        const getSubejctsSql = queries.getAllSubjects();
        conn.query( getSubejctsSql, (err, data) => {
            if(err){
                console.log(err);
                reject( req.t('error')  )
            }else{
                resolve(data)
            }
        } )
    })
}

/**
 * make a request on the sql server to insert new subject
 * a success return the subject object with the new id 
 * @param {*} subject 
 * @param {*} req 
 */
const addSubject = (subject, req) => {

    return new Promise( (resolve, reject) => {

        const sql = queries.addSubject();
        conn.query(sql, [subject.en, subject.ar, subject.he], (err, data) => {
            if(err){
                console.log(err);
                reject( req.t("error") );
            }else{
                //return success subject with the new id
                resolve( {...subject, id: data.insertId } );
            }
        })

    } )
}


const updateSubject = (subject, req) => {
    return new Promise( (resolve, reject) => {
        const sql = queries.updateSubject();
        conn.query(sql, [subject.en, subject.ar, subject.he, subject.id], (err, data) => {
            if(err){
                console.log(err);
                reject(req.t('error'));
            }else{
                if(data.affectedRows > 0){
                    resolve(subject);
                }else{
                    //the requrest resource to update not found
                    reject(req.t('notFound'));
                }
            }
        })
    })
}

module.exports = {
    getAllSubjects,
    addSubject,
    updateSubject
}
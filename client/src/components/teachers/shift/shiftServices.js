
/**
 * get user location after getting permission to access location
 * @returns object with latitude, longitude fields or false if the user reject to access location
 */
export const accessLocation = () => {
    return new Promise( (resolve, reject) => {

        if('geolocation' in navigator){
        
            return navigator.geolocation.getCurrentPosition( position => {
                 resolve({
                     latitude: position.coords.latitude,
                     longitude:position.coords.longitude
                     });
            }, err => reject(false), 
            { maximumAge:2000, timeout:5000, enableHighAccuracy:true })
        }else{
             reject(false);
        }

    } )
}
import { useDispatch, useSelector } from "react-redux"
import { ErrorSnackBar } from "../materialUiOverride"
import { useTranslation } from "react-i18next"
import { connection_status } from "../../redux/ActionCreators"
import { useEffect } from "react"

/**This component goal to show error message if client lost connection to the internet */
const ConnectionSnakbar = ({ }) => {

    const connection = useSelector(state => state.connection.connected)
    const { t } = useTranslation();
    const dispatch = useDispatch()


    useEffect(() => {

        const updateConnectionStatus = () => {
          dispatch(connection_status(navigator.onLine))
        }
  
        window.addEventListener('online', () => {updateConnectionStatus(); console.log('You Are Online');
        })
        window.addEventListener('offline', () => {updateConnectionStatus(); console.log('You Are Offline');
         })
  
        // Set initial connectivity status
        updateConnectionStatus();
  
        return () => {
          window.removeEventListener('online', updateConnectionStatus)
          window.removeEventListener('offline', updateConnectionStatus)
        };
      }, [navigator.onLine])

    return (
        <ErrorSnackBar
            open={!connection}
            messagecontent={ t('noConnection') }
            keepOpen={!connection}
            onClose={(event, reason) => {
                if (reason === 'clickaway')
                    return
            }}
        />
    )
}

export default ConnectionSnakbar
import { TabContext, TabList } from "@mui/lab";
import { Slide, IconButton, Menu, Snackbar, SnackbarContent, styled, Tab, Tabs, Skeleton, TableHead, TableRow, TableCell, TableSortLabel, Box, Table, createTheme, responsiveFontSizes, TextField, Button, Divider, Alert, ListItemButton, Fab, Autocomplete, autocompleteClasses, Paper, Tooltip, Zoom, SpeedDial, SpeedDialAction, useMediaQuery, InputBase, alpha } from "@mui/material";
import { FaCheckCircle, FaExclamationCircle, FaUndo } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { Col, Row } from "reactstrap";
import PropTypes from 'prop-types';
import common from '@mui/material/colors/common';
import { DateField, MobileDatePicker, pickersLayoutClasses } from "@mui/x-date-pickers";
import { blue } from "@mui/material/colors";



export let theme = createTheme({
    direction: 'rtl',
    palette: {
        primary: {
            main: common.black,
            light: common.black,
            dark: common.white

        },
        secondary:{
            main: '#B39DDB',
            light: '#B39DDB'
        }
    },
    typography: {
        fontFamily: ['Franklin Gothic Medium', 'Arial Narrow', 'Arial', 'sans-serif'].join(),
    },
    components: {
        MuiTableCell: {
            styleOverrides: {
                head: {
                    fontWeight: 'bold',
                    fontSize: '17px',
                }
            }
        },
        MuiAutocomplete: {
            styleOverrides: {
                paper: {
                    backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
                    boxShadow: '0px 0px 1px 1px'
                },
                option: {
                    backgroundColor: blue,
                    borderRadius: '8px',
                    margin: '5px',
                    // '&[aria-selected="true"].Mui-focused':{
                    // }
                }
            }
        },
        MuiTooltip: {
            styleOverrides: {
                tooltip: {
                    backgroundColor: 'black',
                    color: 'whitesmoke',
                },
                arrow: {
                    color: 'black'
                }
            }
        },
        MuiSpeedDialAction:{
            styleOverrides:{
                staticTooltipLabel: {
                    fontSize: '14px',
                }
            }
        }
    }
});

theme = responsiveFontSizes(theme);

/***************Style Feedback Button************** */
export const StyledFeedbackButton = styled((props) => (
    <Button
        fullWidth
        variant='outlined'
        {...props}
    />
))(({ theme }) => ({
    '&.MuiButton-root': {
        border: '2px solid black',
        borderRadius: '10px',
        '&:hover': {
            backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
        }
    }
}))

/****Style Text Field****************** */
export const StyledTextField = styled((props) => (
    <TextField
        fullWidth
        size='small'
        margin='dense'
        {...props}
    />
))(({ theme }) => ({
    '& label.Mui-focused': {
        color: 'black',
    },
    '& .MuiOutlinedInput-root': {
        '& fieldset': {
            // borderColor: 'black'
            backgroundColor: 'transparent'
        },
        '&:hover fieldset': {
            borderColor: 'black'
        },
        '&.Mui-focused fieldset': {
            borderColor: 'black'
        },
        '&.Mui-focused.Mui-error fieldset': {
            borderColor: 'red'
        }
    }
}));

/**********************Styled Date Field Component**************** */
export const StyledDateField = styled((props) => (
    <DateField
        fullWidth
        size='small'
        margin='dense'
        {...props}
    />
))(({ theme }) => ({}));

/**
 * Override the menu dropdown 
 */
export const StyledMenu = styled((props) => (
    <Menu
        elevation={0}
        anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'right',
        }}
        transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiPaper-root': {
        borderRadius: 10,
        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
        backgroundColor: 'transparent',
        border: '2px solid black',
        elevation: 0,
        overflow: 'visible',
        '&:before': {
            content: '""',
            display: 'block',
            position: 'absolute',
            border: '2px solid black',
            top: 0,
            right: 14,
            width: 10,
            height: 10,
            backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
            transform: 'translateY(-50%) rotate(45deg)',
            zIndex: 0,
        },
        '& .MuiMenu-list': {
            backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
            borderRadius: 10,
        }
    },

}));

/**
 * Success Snack bar to show as feedback for success operation. like: add teacher/ student,
 * update data. for timeout set for 5sec
 * @param messageContent message to display in the snackbar
 */
export const SuccessSnackbar = styled((props) => (
    <Snackbar
        autoHideDuration={5000}
        TransitionComponent={Slide}
        transitionDuration={500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: props.fab ? 150 : 60, md: 50, lg: 30 } }}
        {...props}
    >
        <SnackbarContent
            message={
                <SuccessSnackContent
                    message={props.messagecontent} />}
            action={<Action handleclose={props.onClose} />}
        />
    </Snackbar>
))(({ theme }) => ({
    '&.MuiSnackbar-root': {
        backgroundColor: 'transparent',
        "& .MuiSnackbarContent-root": {
            backgroundColor: '#66bb6a',
            borderShadow: '0px 0px 2px 2px ',
            color: 'black'
        }
    }
}));

const Action = ({ handleclose }) => (
    <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => handleclose()}
    >
        <MdClose fontSize='larger' />
    </IconButton>
)

const SuccessSnackContent = ({ message }) => (
    <>
        <Row>
            <Col xs={'auto'}>
                <FaCheckCircle size={20} />
            </Col>
            <Col xs={'auto'}>
                {message}
            </Col>
        </Row>
    </>
)

/***********************Create Error Snack bar********************* */
export const ErrorSnackBar = styled((props) => (
    <Snackbar
        autoHideDuration={props.keepOpen ? null : 7000}
        TransitionComponent={Slide}
        transitionDuration={500}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        sx={{ bottom: { xs: props.fab ? 150 : 60, md: 50, lg: 30 } }}
        {...props}
    >
        <SnackbarContent
        message={
                <ErrorSnackContent
                    message={props.messagecontent} />}
            action={<TryAction handleClose={props.onClose} />}
        />
    </Snackbar>
))(({ theme }) => ({
    '&.MuiSnackbar-root': {
        backgroundColor: 'transparent',
        "& .MuiSnackbarContent-root": {
            backgroundColor: '#f44336',
            borderShadow: '0px 0px 2px 2px ',
            color: 'black'
        }
    }
}));

const TryAction = ({ handleClose }) => (
    <IconButton
        size="small"
        aria-label="close"
        color="inherit"
        onClick={() => handleClose()}
    >
        <MdClose fontSize='larger' />
    </IconButton>
)

const ErrorSnackContent = ({ message }) => (
    <>
        <Row>
            <Col xs={'auto'}>
                <FaExclamationCircle size={20} />
            </Col>
            <Col xs={'auto'}>
                {message}
            </Col>
        </Row>
    </>
)



/**
 * Apply style to the indicator to be black color
 */
export const StyledTabList = styled((props) => (
    <TabList
        // textColor='inherit'
        {...props}
    />
))(({ theme }) => ({
    '& 	.MuiTabs-indicator': {
        backgroundColor: 'black'
    }
}));

/**
 * Apply style to the tabs buttton in report component
 */
export const StyledTab = styled((props) => (
    <Tab
        {...props}
    />
))(({ theme }) => ({
    '&.MuiTab-root': {
        fontSize: '17px',
        color: 'black'
    },
    '&.Mui-selected': {
        fontWeight: 'bold'
    }
}));


/**
 * Create a rounded skeleton
 */
export const StyledRoundedSkeleton = styled((props) => (
    <Skeleton
        height={'100%'}
        animation='wave'
        variant='rounded'
    />
))(({ theme }) => ({

}));

/*******************Style Tooltip******************* */
export const StyledToolTip = styled((props) => (
    <Tooltip
        placement='top'
        disableFocusListener
        enterTouchDelay={0}
        TransitionComponent={Zoom}
        leaveTouchDelay={3000}
        arrow
        {...props}
    />
))(({ theme }) => ({
}))


/*******Style Table Cell Head************* */
export const StyledTableCell = styled((props) => (
    <TableCell
        align='center'
        {...props}
    />
))(({ theme }) => ({
    '&.MuiTableCell-root': {
        borderBottom: '1.5px solid black',
    },
    '&.MuiTableCell-head': {
        borderBottom: '2px solid black',
    }
}))

/**
 * Styled tabel rows, with border black
 */
export const StyledRowTabel = styled((props) => (
    <TableRow
        {...props}
    />
))(({ theme }) => ({
    '&.MuiTableRow-root': {
        backgroundColor: 'tranparent',
        borderBottom: '0px solid black',
    },
    // hide last border
    '&:last-child td, &:last-child th ': {
        border: '0px solid black',
    },
    '&.MuiTableRow-head': {
        backgroundColor: 'red',
        fontSize: '20px'
    }

}));

export const StyledTabelHead = styled((props) => (
    <TableHead
        {...props}
    />
))(({ theme }) => ({
    '& .MuiTableRow-head': {
        backgroundColor: '#B2B5E0',
        borderBottom: '0px solid black',
    }
}))

/**
 * render the header part of the tabel, with to sort button next to each cell label
 * @returns 
 */
const EnhancedTabelHead = ({ order, orderBy, numSelected, rowCount, onRequestSort, headCells }) => {

    const createSortHandler = (property) => (event) => {
        onRequestSort(event, property);
    }

    return (
        <StyledTabelHead
        >
            <TableRow>
                {
                    headCells.map(cell => (
                        <StyledTableCell
                            key={cell.id}
                            align={'center'}
                            padding={'checkbox'}
                            sortDirection={orderBy === cell.id ? order : false}
                        >
                            {cell.isSort ? (<TableSortLabel
                                active={orderBy === cell.id}
                                direction={orderBy === cell.id ? order : 'asc'}
                                onClick={createSortHandler(cell.id)}
                            >
                                {cell.label}
                            </TableSortLabel>)
                                :
                                (<>
                                    {cell.label}
                                </>)
                            }
                        </StyledTableCell>
                    ))
                }
            </TableRow>
        </StyledTabelHead>
    )
}

EnhancedTabelHead.propTypes = {
    numSelected: PropTypes.number,
    headCells: PropTypes.array.isRequired,
    onRequestSort: PropTypes.func.isRequired,
    order: PropTypes.oneOf(['asc', 'desc']).isRequired,
    orderBy: PropTypes.string.isRequired,
    rowCount: PropTypes.number,
}

export default EnhancedTabelHead;

/**************Style divider in the select list between choicess ***********/
export const ListDivider = styled((props) => (
    <Divider
        variant='middle'
        {...props}
    />
))(({ theme }) => ({
    '&.MuiDivider-root': {
        color: 'black',
        backgroundColor: 'black'
    }
}));


/**
 * Style for error alert, background red and black text
 */
export const StyledErrorAlert = styled((props) => (
    <Alert
        variant='filled'
        severity='error'
        {...props}
    />
))(({ theme }) => ({
    '&.MuiAlert-root': {
        boxShadow: '0px 0px 2px 2px black',
        color: 'black',
        textAlign: 'center'
    }
}));

export const StyledListItemButton = styled((props) => (
    <ListItemButton
        {...props}
    />
))(({ theme }) => ({
    '&.MuiListItemButton-root': {
        color: 'black',
        borderRadius: '10px'
    },
    '&.Mui-selected': {
        backgroundColor: '#B39DDB',
        boxShadow: '0px 0px 2px 2px',
        transitionDuration: '500ms'
    }
}))

//B39DDB
//9575CD


export const StyledFAB = styled((props) => (
    <Fab
        {...props}
    />
))(({ theme }) => ({
    '&.MuiFab-root': {
        position: 'absolute',
        bottom: '9%',
        right: '5%',
        color: 'black',
        backgroundColor: '#B39DDB',
        borderRadius: '15px'
    }
}))

/*****************Style the Auto Complete Component************* */
export const StyledAutoComplete = styled((props) => (
    <Autocomplete
        {...props}
    />
))(({ theme }) => ({
    '&.MuiAutocomplete-root': {
        '& .MuiAutocomplete-paper': {
            backgroundColor: blue,
            color: 'red'
        },
        '& .MuiAutocomplete-listbox': {
            backgroundColor: blue,
            color: 'red'
        }
    }
    ,
    '&.MuiAutocomplete-listbox': {
        backgroundColor: blue,
        color: 'red'
    }

}));

/*****************Style Date Picker Paper****************** */
export const mobilePaper = {
    variant: 'outlined',
    elevation: 0,
    sx: {
        boxShadow: '0px 0px 2px 2px black',
        backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
        color: 'black',
    }
}

export const layout = {
    sx: {
        [`.${pickersLayoutClasses.contentWrapper}`]: {
            backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
            color: 'black',
            "& .MuiPickersDay-root": {
                "&.Mui-selected": {
                    backgroundColor: '#B39DDB',
                    color: 'black',
                    boxShadow: '0px 0px 1px 1px'
                },
            },
        }
    }
}

export const StyledDatePicker = styled((props) => (
    <MobileDatePicker
        {...props}
        slotProps={{
            layout: {
                sx: {
                    [`.${pickersLayoutClasses.contentWrapper}`]: {
                        backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
                        color: 'black',
                        "& .MuiPickersDay-root": {
                            "&.Mui-selected": {
                                backgroundColor: '#B39DDB',
                                color: 'black',
                                boxShadow: '0px 0px 1px 1px'
                            },
                        },
                    }
                }
            },

            mobilePaper: {
                variant: 'outlined',
                elevation: 20,
                sx: {
                    boxShadow: '0px 0px 2px 2px black',
                    backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
                    color: 'black',
                }
            },

        }}
    />
))(({ theme }) => ({
    '&.MuiPaper-root': {
        backgroundImage: 'linear-gradient(to right, #C5ADC5, #B2B5E0)',
        color: 'black'
    }
}));

export const MyPaper = styled((props) => (
    <Paper
        {...props}
    />
))(({ theme }) => ({
    '&.MuiPaper-root': {
        height: 'auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: `0 2 0 2`,
        margin: '0 auto 7px auto'
    }
}));


/********************Styled Speed Dial *************/
export const mobileSpeedDial = {
    position: 'absolute',
    bottom: '9%',
    right: '5%'
}
export const StyledSpeedDial = styled((props) => (
    <SpeedDial
        ariaLabel="lessons actions"
        transitionDuration={0}
        FabProps={{
            color: 'secondary',
        }}
        {...props}
    />
))(({ theme }) => ({
    '& .MuiSpeedDial-fab': {
        borderRadius: '15px',
    }
}));

export const StyledSpeedDialAction = styled((props) => (
    <SpeedDialAction
        delay={200}
        {...props}
        />
))(({theme}) => ({
    '&.MuiSpeedDialAction-fab': {
        borderRadius: '15px',
    }
}));


/**********************Styled Search Bar************ */
export const Search = styled('div')(({ theme }) => ({
    position: 'relative',
    borderRadius: '15px',
    '&:focus-within':{
        backgroundColor: alpha(theme.palette.common.white, 0.2),
     },
    marginLeft: 0,
    width: '100%',
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
    },
  }));
  
  export const SearchIconWrapper = styled('div')(({ theme }) => ({
    padding: theme.spacing(0, 2),
    height: '100%',
    position: 'absolute',
    pointerEvents: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }));
  
  export const StyledInputBase = styled(InputBase)(({ theme }) => ({
    '& .MuiInputBase-input': {
      padding: theme.spacing(1, 1, 1, 0),
      // vertical padding + font size from searchIcon
      paddingLeft: `calc(1em + ${theme.spacing(4)})`,
      transition: theme.transitions.create('width'),
      width: '1ch',
        '&:focus': {
          width: '20ch',
        },
    },
  }));
import { Button } from "@mui/material";

const css = {
    /* manrope-regular - latin */
    h1: {
        color: 'white',
        fontFamily: 'manrope',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        // fontSize: 50,
    },
    body: {
        // color: 'red',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        textAlign: 'center',
        fontFamily: 'Manrope',

    },
    mainContent:{
        flex: 1,
        maxWidth:'80vw',
        color:'#d9eaff',
        // backgroundColor: '#FFFFFF',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        justify:'center',
        alignSelf:'center'

    },
    
    container: {
        // backgroundColor: '#00316e',
        // backgroundColor: "#2E2F2F",
        // backgroundColor: "#82A7A6",
        backgroundColor: '#000000',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '0',
        margin: '0',
    },
    contrastContent: {
        // backgroundColor: '#000000',
        backgroundColor: "#002c3d",
        // use all available space
        flex: 1,
        //dont use all available space
        // center content
        justifyContent: 'center',
        display: 'flex',
        padding: '1.5em',
        margin: '1em',
        borderRadius: '3em',
        color: 'white',
        // font
        // fontFamily: 'Times New Roman',
        fontFamily: 'Manrope',
        // color: '#001011'
    },
    button :{
        margin: '1em',
    }


}
export default css;
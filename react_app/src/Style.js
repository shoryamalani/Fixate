
const css = {
    h1: {
        color: 'white',
        fontFamily: 'Epilogue',
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
        fontFamily: 'Epilogue',

    },
    mainContent:{
        flex: 1,
        maxWidth:'80vw',
        color:'#d9eaff',
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
        padding: '2em',
        margin: '1em',
        borderRadius: '3em',
        color: 'white',
        // font
        // fontFamily: 'Times New Roman',
        fontFamily: 'Epilogue',
        // color: '#001011'
    }


}
export default css;
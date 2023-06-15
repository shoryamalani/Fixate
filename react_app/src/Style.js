
const css = {
    h1: {
        color: 'white',

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
        backgroundColor: '#00316e',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        padding: '0',
        margin: '0',
    },
    contrastContent: {
        backgroundColor: '#000000',
        // use all available space
        flex: 1,
        // center content
        justifyContent: 'center',
        display: 'flex',
        padding: '2em',
        margin: '1em',
        borderRadius: '3em',
        color: 'white'
    }


}
export default css;
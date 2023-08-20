import React, { useEffect } from "react";
import ContentDiv from "../ContentDiv";
import TextField from "@material-ui/core/TextField";
import {theme} from "antd"
import { Button } from "@mui/material";

const {useToken} = theme;
const MobileAppConnection = () => {
    const {token} = useToken();
    const [code,setCode] = React.useState(0);
    const [numberOfActivePhones,setNumberOfActivePhones] = React.useState(0);
    useEffect(()=>{
        const getNumberOfActivePhones = async () => {
            const response = await fetch('http://127.0.0.1:5005/activePhones');
            if (!response.ok) {
                return
            }
            const data = await response.json();
            console.log(data)
            if (data['activePhones']['phone_ids'] === undefined) {
                return
            }
            setNumberOfActivePhones(data['activePhones']['phone_ids'].length);
        }
        getNumberOfActivePhones();
    },[])

    const connectPhone = async () => {
        const response = await fetch('http://127.0.0.1:5005/add_active_phone',
        {
            method:'POST',
            headers:{
                'Content-Type':'application/json'
                },
                body:JSON.stringify({
                    'phone_id':code
                    })
        });
        if (!response.ok) {
            return
        }
        const data = await response.json();
        console.log(data)
        if (data['activePhones']['phone_ids'] === undefined) {
            return
        }
        setNumberOfActivePhones(data['activePhones']['phone_ids'].length);

    }

    return (
        <div style={{backgroundColor:token["blue-1"],padding:'1em',borderRadius:'2em'}}>

            <h1>Connect your phone</h1>
            {/* Make this textbox only accept numbers */}
            <p>Enter the code from the mobile app to connect</p>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'center',alignItems:'center',backgroundColor:'white'}}>
            <TextField id="outlined-basic" variant="outlined" type="number" value={code} onChange={(event)=>{
                setCode(event.target.value);
            }} />
            <Button variant="contained" style={{marginLeft:10}} onClick={connectPhone}>Connect</Button>
            
            
            </div>
            <p>{numberOfActivePhones} Phones Connected</p>


        </div>

    )
}
export default MobileAppConnection;
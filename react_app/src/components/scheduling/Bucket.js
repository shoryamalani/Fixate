import Grid2 from "@mui/material/Unstable_Grid2/Grid2";
import React from "react";
import ImageDisplay from "./ImageDisplay";
import { useDispatch } from "react-redux";
import { setActiveBucket, setBuckets } from "../../features/SchedulingSlice";
import { useSelector } from "react-redux";
import { Button, Divider, Radio, Slider, Switch, TextField, ToggleButton } from "@mui/material";


const Bucket = (props) => {
    
        const bucketData = [...props.bucketData];
        const bucketId = props.bucketData[0];
        const bucketName = props.bucketData[1];
        const dispatch = useDispatch();
        const activeBucket = useSelector(state => state.scheduling.activeBucket);
        const [bucketTimeout, setBucketTimeout] = React.useState(parseInt(bucketData[2]['block_time']/60));
        const [isActive, setIsActive] = React.useState(bucketData[3]);
        console.log(bucketTimeout)

        function removeApp(app,type) {
            console.log(app);
            const data = { ...bucketData[2] };
            if(type === 'app'){
                // data['apps'].remove(app)
                data['apps'] = data['apps'].filter((a) => {
                    return a !== app;
                })
            }
            else{
                // data['websites'].remove(app)
                data['websites'] = data['websites'].filter((website) => {
                    return website !== app;
                })
            }
            bucketData[2] = data;
            update_bucket(bucketData);
        }

        function update_bucket(data) {
            fetch('http://127.0.0.1:5005/update_scheduling_bucket', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    bucket_id:bucketId,
                    data:data,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    dispatch(setBuckets(data['buckets']));
                })
        }



        return (
            // start div at the top
            <div style={{display:'flex',placeItems:'flex-start',flexDirection:'column',alignItems:'center',background:activeBucket === bucketId ?'#0c61ab' : 'black',padding:'1em',marginTop:'1em',borderRadius:'1em'}} onClick={()=>{
                console.log(bucketData[0])
                dispatch(setActiveBucket(bucketData[0]))}}>
                <h2 >{bucketName}</h2>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',backgroundColor:'black',padding:'1em',borderRadius:'1em'}}>
                    { bucketData[2]['apps'].length > 0 &&
                    <p>Apps</p>
                    }
                    <Grid2 container spacing={3} style={{width:'100%'}}>
                        {bucketData[2]['apps'].map((app,index) => {
                            return (
                                <Grid2 style={{minWidth:"5em"}} item xs={3} onClick={() => {removeApp(app,'app');}
                                }>
                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',backgroundColor:'ActiveBorder',padding:'1em',borderRadius:'1em',}}>
                                        {/* if  http://127.0.0.1:5005/getIcon/"+app.toLowerCase() returns an image then use it otherwise show nothing */}
                                        <ImageDisplay  imageUrl={"http://127.0.0.1:5005/getIcon/"+app.toLowerCase()} alt="App logo"></ImageDisplay> 
                                        <p style={{verticalAlign:'top',textAlign:'center',flex:1}}>{app}</p>
                                        </div>
                                </Grid2>
                            )
                        })
                        }
                    </Grid2>
                </div>
                <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',backgroundColor:'black',padding:'1em',borderRadius:'1em'}}>
                    { bucketData[2]['websites'].length > 0 &&
                    <p>Websites</p>
                    }
                    <Grid2 container spacing={2} style={{width:'100%'}}>
                        {bucketData[2]['websites'].map((website,index) => {
                            return (
                                <Grid2 item xs={4} onClick={() => {removeApp(website,'website')}}>
                                    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',backgroundColor:'ActiveBorder',padding:'1em',borderRadius:'1em',midWidth:'1em'}}>
                                        {/* if  http://127.0.0.1:5005/getIcon/"+app.toLowerCase() returns an image then use it otherwise show nothing */}
                                        <ImageDisplay  imageUrl={"http://127.0.0.1:5005/getIcon/"+website.toLowerCase()} alt="App logo"></ImageDisplay>
                                        <p style={{verticalAlign:'top',textAlign:'center',flex:1}}>{website}</p>
                                    </div>
                                </Grid2>
                            )
                        })
                        }
                    </Grid2>
                    </div>
                    <Divider style={{width:'100%'}}></Divider>
                    <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'black',padding:'1em',borderRadius:'1em'}}>
                        <TextField type="number" label="Set Timeout" value={bucketTimeout} onChange={(e)=>{setBucketTimeout(parseInt(e.target.value))}}></TextField>
                        <Button onClick={() => {
                            const data = { ...bucketData[2] };
                            data['block_time'] = bucketTimeout*60;
                            bucketData[2] = data;
                            update_bucket(bucketData);
                        }}>Set Timeout</Button>
                    </div>
                    <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'black',padding:'1em',borderRadius:'1em'}}>
                        <p>Active</p>
                        <Switch checked={isActive == 1} onChange={(e)=>{
                            setIsActive(e.target.checked)
                            const data = [ ...bucketData ];
                            data[3] = e.target.checked;
                            update_bucket(data);
                            }}></Switch>
                        

                    </div>


            </div>
        )
    }

export default Bucket;
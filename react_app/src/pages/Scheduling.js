import React, { useEffect, useState } from 'react';
import { theme } from 'antd';
import { useToken } from 'antd/es/config-provider/context';
import css from '../Style';
import ContentDiv from '../components/ContentDiv';
import { useSelector } from 'react-redux';
import Bucket from '../components/scheduling/Bucket';
import AppList from '../components/scheduling/AppList';
import {  Button, CircularProgress, TextField } from '@mui/material';
import { useDispatch } from 'react-redux';
import { setActiveBucket, setBuckets } from '../features/SchedulingSlice';

function Schedule(props) {

    const dispatch = useDispatch();
    const buckets = useSelector(state => state.scheduling.buckets);
    const activeBucket = useSelector(state => state.scheduling.activeBucket);
    const currentWorkflow = useSelector(state => state.app.currentWorkflow);
    // add bucket
    function addBucket(name) {
        fetch('http://127.0.0.1:5005/add_scheduling_bucket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name:name,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                dispatch(setBuckets(data['buckets']));
            })
    }

    function addApp(app) {
        // go through buckets and add app to active bucket
        console.log(app)
        for (var i = 0; i < buckets.length; i++) {
            if (buckets[i][0] === activeBucket) {
                var data = [...buckets[i]];
                console.log(data)
                data = JSON.parse(JSON.stringify({...data[2]}));
                console.log(data)
                if(app['type'] === 'application'){
                    app['type'] = 'apps';
                }
                else{
                    app['type'] = 'websites';
                }
                console.log(app['type'])
                data[app['type']].push(app['name']);
                var final_bucket = [...buckets[i]];
                final_bucket[2] = data;
                break;
            }
        }
        fetch('http://127.0.0.1:5005/update_scheduling_bucket', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                bucket_id:activeBucket,
                data:final_bucket,
            }),
        })
            .then((res) => res.json())
            .then((data) => {
                console.log(data);
                dispatch(setBuckets(data['buckets']));
            }
            )

    }

    // get buckets at start
    useEffect(() => {
        function getBuckets() {
            fetch('http://127.0.0.1:5005/get_scheduling_buckets', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    dispatch(setBuckets(data['buckets']));
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        getBuckets();
    }, [])



    // get apps
    const [apps,setApps] = useState(null);
    useEffect(() => {
        function getApps() {
            fetch('http://127.0.0.1:5005/get_all_apps_in_workflow', {   
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    workflow_id:currentWorkflow,
                }),
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setApps(data);
                }
                )
        }
        getApps();
    }, [])




    return (
        <ContentDiv style={{'width':'100vw'}}>
            <h1 style={{textAlign:'center'}}>Schedule</h1>
            <div style={{display:'flex',flexDirection:'row',justifyContent:'space-around',alignItems:'flex-start'}}>
                <ContentDiv >
                    <h2 style={{textAlign:'center'}}>Buckets</h2>
                { buckets.length > 0 &&
                    // buckets.map((bucket,index)=>{
                    //     <Bucket id={index} bucketData={bucket}></Bucket>
                    // })
                    buckets.map((bucket) => {
                        return (
                            <Bucket id={"bucket_"+bucket[0]} bucketData={bucket}  style={{width:'100%'}} ></Bucket>
                        )
                    })

                }
                <div style={{display:'flex',flexDirection:'row',alignItems:'center',justifyContent:'center',backgroundColor:'black',padding:'1em',borderRadius:'1em'}}>
                    <p>Add Bucket: </p>
                    <TextField placeholder='Bucket Name' id="setBucketNameSearchField"></TextField>
                    <Button onClick={
                        () => {
                            var name = document.getElementById('setBucketNameSearchField').value;
                            if (name.length < 3){
                                alert("Bucket name must be at least 3 characters long");
                                return;
                            }
                            else if (name.length > 40){
                                alert("Bucket name must be less than 40 characters long");
                                return;
                            }

                            addBucket(name);
                        }
                    }>Add</Button>
                </div>
                </ContentDiv>
                {  apps ?
                <AppList addApp={
                    (app) => {
                        activeBucket ? addApp(app) : alert("Please select a bucket first");
                    }
                } apps={apps}></AppList>
                : <CircularProgress></CircularProgress>
                }

            </div>
        </ContentDiv>
    );
}


export default Schedule;
import React, { useEffect, useState } from 'react';
import { theme } from 'antd';
import { useToken } from 'antd/es/config-provider/context';
import css from '../Style';
import ContentDiv from '../components/ContentDiv';

function Schedule(props) {
    const [buckets,setBuckets] = useState([]);
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
                setBuckets(data);
            })
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
                    setBuckets(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        getBuckets();
    }, [])



    // get apps
    const [apps,setApps] = useState([]);
    useEffect(() => {
        function getApps() {
            fetch('http://127.0.0.1:5005/get_apps', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            })
                .then((res) => res.json())
                .then((data) => {
                    console.log(data);
                    setApps(data);
                })
                .catch((err) => {
                    console.log(err);
                });
        }
        getApps();
    }, [])



    return (
        <ContentDiv style={{'width':'100vw'}}>
            <h1 style={{textAlign:'center'}}>Schedule</h1>

        </ContentDiv>
    );
}


export default Schedule;
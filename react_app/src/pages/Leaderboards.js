// make a page that displays leaderboards of 3 different timings
import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Grid, Input, LinearProgress, duration } from '@mui/material';
import { UserProfileCard } from '../components/UserProfileCard';
import { Button, Container, Paper, Stack, Switch, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, private_createTypography } from '@mui/material';
import css from '../Style';
import { useDispatch } from 'react-redux';
import { CircularProgressWithLabel } from '../components/CircularProgressBar';
import { setUserData } from '../features/UserSlice';
import { useLocation } from 'react-router-dom';
import { Pie } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import { Colors } from 'chart.js/auto';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { setLeaderboardData } from '../features/UserSlice';
import {SingleLeaderboard}  from '../components/Leaderboard';
const Leaderboards = () => {
    let leaderboardData = useSelector(state => state.user.leaderboardData);
    let dispatch = useDispatch();
    useEffect(() => {
        if (leaderboardData == null) {
            fetch('http://localhost:5005/get_leaderboard_data').then(response => response.json()).then(data => {
                console.log(data['leaderboard'])
                console.log("setting leaderboard data")
                data = data['leaderboard']
                // this is a dictionary of users
                var final_data = {}
                for (var key in data) {
                    for (var key2 in data[key]) {
                        if(key2 === 'name'){

                        }else{
                            if (final_data[key2] == null) {
                                final_data[key2] = []
                            }
                            console.log(key2)
                            final_data[key2].push(
                                {
                                    'total_time_spent':(data[key][key2]['data']['total_time_spent']/60).toFixed(2),
                                    'time_between_distractions':((data[key][key2]['data']['total_time_spent']/60-data[key][key2]['data']['distractions_time_min'])/data[key][key2]['data']['distractions_number']).toFixed(2),
                                    'name':data[key]['name'],
                                    'longest_time_without_distraction':(data[key][key2]['data']['longest_time_without_distraction_min']).toFixed(2),
                                    'distractions_per_hour':(data[key][key2]['data']['distractions_number']/(data[key][key2]['data']['total_time_spent']/3600)).toFixed(2),
                                    'percent_time_focused':(100*((data[key][key2]['data']['total_time_spent']-(data[key][key2]['data']['distractions_time_min']*60))/data[key][key2]['data']['total_time_spent'])).toFixed(2),
                                    // 100*((friend['data']['live']['total_time_spent']-(friend['data']['live']['distractions_time_min']*60
                                })
                        }

                    }
                    

                }
                console.log(final_data)
                dispatch(setLeaderboardData(final_data));
            }).catch(error => { console.log(error) });
        }
    }   , [leaderboardData, dispatch])

    return (
        <>
            <div style={css.contrastContent}>
                { leaderboardData != null && leaderboardData['daily'] != null ?
                <SingleLeaderboard title='Daily' leaderboardData={leaderboardData['daily']} />
                : <h2>The Daily Leaderboard is not currently available </h2>
            }
            </div>
            <div style={css.contrastContent}>
                { leaderboardData != null && leaderboardData['weekly'] != null ?
                <SingleLeaderboard title='Weekly' leaderboardData={leaderboardData['weekly']} />
                : <h2>The Weekly Leaderboard is not currently available </h2>
            }
            </div>

            <div style={css.contrastContent}>
                { leaderboardData != null && leaderboardData['monthly'] != null ?
                <SingleLeaderboard title='Monthly' leaderboardData={leaderboardData['monthly']} />
                : <h2>The Monthly Leaderboard is not currently available </h2>
            }
            </div>


        </>
    )
}

export default Leaderboards;
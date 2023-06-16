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
import 'chartjs-plugin-labels';
import { Colors } from 'chart.js/auto';
import { createTheme } from '@mui/material/styles';
import { ThemeProvider } from 'styled-components';
import CssBaseline from '@mui/material/CssBaseline';
import { setLeaderboardData } from '../features/UserSlice';
const Leaderboards = () => {
    let leaderboardData = useSelector(state => state.user.leaderboardData);
    let dispatch = useDispatch();
    useEffect(() => {
        if (leaderboardData == null) {
            fetch('http://localhost:5005/get_leaderboard_data').then(response => response.json()).then(data => {
                console.log(data)
                dispatch(setLeaderboardData(data));
            }).catch(error => { console.log(error) });
        }
    }   , [leaderboardData, dispatch])

    return (
        <>
            <div style={css.contrastContent}>

            </div>

        </>
    )
}

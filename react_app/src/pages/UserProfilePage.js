// make a page that displays leaderboards of 3 different timings
import React, { useState, useEffect } from 'react';
import { UserProfileCard } from '../components/UserProfileCard';
import css from '../Style';
const UserProfilePage = () => {
    
    return (
        <div style={css.contrastContent}>
        <UserProfileCard></UserProfileCard>
        </div>
    )
}

export default UserProfilePage;
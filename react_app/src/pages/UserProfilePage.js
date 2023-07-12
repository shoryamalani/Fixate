// make a page that displays leaderboards of 3 different timings
import React, { useState, useEffect } from 'react';
import { UserProfileCard } from '../components/UserProfileCard';
import css from '../Style';
const UserProfilePage = () => {
    
    return (
        <div style={css.mainContent}>
            <div style={css.contrastContent}>
        <UserProfileCard></UserProfileCard>
        </div>
        </div>
    )
}

export default UserProfilePage;
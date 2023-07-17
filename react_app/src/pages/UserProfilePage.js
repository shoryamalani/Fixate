// make a page that displays leaderboards of 3 different timings
import React, { useState, useEffect } from 'react';
import { UserProfileCard } from '../components/UserProfileCard';
import css from '../Style';
import ContentDiv from '../components/ContentDiv';
import ContentDivUnstyled from '../components/ContentDivUnstyled';
const UserProfilePage = () => {
    
    return (

            // <ContentDivUnstyled style={{display:'flex',height:'100%',width:'100%',justifyContent:'center',color:'white',backgroundColor:'black'}}>
            // {/* <ContentDiv style={{justifyContent:'center',color:'white'}}> */}
        // {/* </ContentDiv> */}
        <div>
        <UserProfileCard></UserProfileCard>
        </div>

    )
}

export default UserProfilePage;
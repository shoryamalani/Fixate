import { ConfigProvider, Menu } from "antd";
import { useNavigate } from "react-router-dom";
import HomeIcon from '@mui/icons-material/Home';
// import BrowseGalleryIcon from '@mui/icons-material/BrowseGallery';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import TimelapseIcon from '@mui/icons-material/Timelapse';
import AppsIcon from '@mui/icons-material/Apps';
import LeaderboardIcon from '@mui/icons-material/Leaderboard';
import StreamIcon from '@mui/icons-material/Stream';
import PersonIcon from '@mui/icons-material/Person';
import SettingsIcon from '@mui/icons-material/Settings';
import {theme } from 'antd'
const {useToken} = theme;
function getItem(label, key, icon, children) {
	return {
	  key,
	  icon,
	  children,
	  label,
	};
  }
const pages = [
	getItem('Home', '/',<HomeIcon></HomeIcon> ),
	getItem('Time Spent', '/timeSpent',<DataThresholdingIcon/>),
    getItem('History', '/focusModes',<TimelapseIcon></TimelapseIcon>),
    getItem('App Status', '/appStatus',<AppsIcon></AppsIcon>),
    getItem('User Profile', '/userProfile',<PersonIcon></PersonIcon>),
    getItem('Leaderboards', '/leaderboards',<LeaderboardIcon></LeaderboardIcon>),
    getItem('Live Focus', '/liveFocusMode',<StreamIcon></StreamIcon>),
    getItem('Settings', '/settings',<SettingsIcon></SettingsIcon>),
]

const SideNavbar = () => {
    const {token} = useToken();
    const navigate = useNavigate();
    return (
        <Menu defaultSelectedKeys={['1']} mode="inline" onSelect={(item)=>{console.log(item);navigate(item['key'])}} items={pages}  style={{color:'white',width:'100%',height:'100%',outline:'none',backgroundColor:token.colorBgContainer}} />
    );
}
export default SideNavbar;
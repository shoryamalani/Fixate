# import socketio
import requests
import constants
import json
import database_worker
import get_time_spent as time_spent
import datetime
from analyze_improvement import analyze_improvements
API_URL = constants.API_URL

# here we make the back bones for live focus modes

# below this is non socket requests

def create_headers():
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'user_id': str(database_worker.get_current_user_data()['user_id']) if 'user_id' in database_worker.get_current_user_data() else "",
        'device_id': database_worker.get_current_user_data()['device_id'] if 'device_id' in database_worker.get_current_user_data() else "",
    }
    return headers

def create_devices():
    try:
        return requests.get(f"{API_URL}/api/createDeviceId").json()['device_id']
    except Exception as e:
        print(e)
        return None


def create_user(name,privacy_level,device_id):
    current_user = database_worker.get_current_user_data()
    if 'user_id' in current_user:
        return current_user['user_id']
    
    try:
        user_id =  requests.post(f"{API_URL}/api/createUser",json={"name":name,"privacy_level":privacy_level,"device_id":device_id}, headers={'Content-Type': 'application/json','Accept': 'application/json',}).json()
        print(user_id)
        user_id = user_id['user_id']
        current_user['user_id'] = user_id
        current_user['device_id'] = device_id
        current_user['name'] = name
        current_user['privacy_level'] = privacy_level
        database_worker.set_current_user_data(current_user)
        current_user['server_data'] = get_user_data_from_server()
        database_worker.set_current_user_data(current_user)
        return user_id
    except Exception as a:
        print(a)
        return None

def set_display_name(display_name):
    try:
        if requests.post(f"{API_URL}/api/setDisplayName",json={"display_name":display_name},headers=create_headers()).json()['success']:
            current_user = database_worker.get_current_user_data()
            current_user['name'] = display_name
            database_worker.set_current_user_data(current_user)
            return True
    except Exception as e:
        print(e)
        return None

def get_user_data_from_server():
    try:
        print(create_headers())
        data = requests.get(f"{API_URL}/api/getUser",headers=create_headers()).json()
        current_user = database_worker.get_current_user_data()
        current_user['server_data'] = data
        database_worker.set_current_user_data(current_user)
        return data
    except Exception as e:
        print(e)
        return None

def change_privacy(privacy_level):
    try:
        if requests.post(f"{API_URL}/api/changePrivacy",json={"privacy_level":privacy_level},headers=create_headers()).json()['success']:
            current_user = database_worker.get_current_user_data()
            current_user['privacy_level'] = privacy_level
            database_worker.set_current_user_data(current_user)
            return database_worker.get_current_user_data()
    except:
        return None
def add_friend(friend_name,friend_share_code):
    try:
        response_id = requests.post(f"{API_URL}/api/addFriend",json={"friend_name":friend_name,"friend_share_code":friend_share_code},headers=create_headers()).json()['success']
        print(response_id)
        current_user = database_worker.get_current_user_data()
        if 'friends' not in current_user:
            current_user['friends'] = [response_id]
        else:
            current_user['friends'].append(response_id)
        database_worker.set_current_user_data(current_user)
        print(get_friend_data_from_server_and_save())
        return database_worker.get_current_user_data()
    except Exception as e:
        print(e)
        return None

def get_friends():
    try:
        return database_worker.get_current_user_data()['friends']
    except:
        return None

def get_friend_data_from_server_and_save():
    try:
        data = requests.get(f"{API_URL}/api/getFriendData",headers=create_headers()).json()['friend_data']
        current_user = database_worker.get_current_user_data()
        current_user['server_data']['friends_data'] = data
        database_worker.set_current_user_data(current_user)
        return data
    except Exception as e:
        print(e)
        return None

def get_leaderboard_data():
    try:
        return requests.get(f"{API_URL}/api/getLeaderboardData",headers=create_headers()).json()['leaderboard_data']['data']
    except:
        return None

def getFriendData(update):
    if update:
        return get_friend_data_from_server_and_save()
    else:
        try:
            data =database_worker.get_current_user_data()
            if datetime.datetime.strptime(data['server_data']['friends_data']['last_updated'],"%Y-%m-%d %H:%M:%S") > datetime.datetime.now() - datetime.timedelta(minutes=5):
                return data['server_data']['friends_data']['data'] 
            else:
                return get_friend_data_from_server_and_save()
        except:
            return None
    
def update_server_data(to_update,focused):
    # format of to_update is [(id,name,next_update_time,duration,last_update_time)]
    for update in to_update:
        try:
            if update[1] == "every_5_minute_regular":
                time = time_spent.get_time("last_30_minutes")[1]
                response = requests.post(f"{API_URL}/api/saveLiveSharableData",json={"live_data":time},headers=create_headers())
                if response.status_code == 200:
                    database_worker.reset_database(update[0],update[3])
                    current_user = database_worker.get_current_user_data()
                    current_user['server_data'] = response.json()['user_data']
                else:
                    database_worker.reset_database(update[0],60) 
            if update[1] == "daily":
                time = time_spent.get_time("today")[1]
                response = requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'daily', 'expiry':24 * 3600},headers=create_headers())
                if response.status_code == 200:
                    database_worker.reset_database(update[0],update[3])
                else:
                    database_worker.reset_database(update[0],600) 
            if update[1] == "weekly":
                time = time_spent.get_time("week")[1]
                response = requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'weekly', "expiry":7*84600},headers=create_headers())
                if response.status_code == 200:
                    database_worker.reset_database(update[0],update[3])
                else:
                    database_worker.reset_database(update[0],600) 
            if update[1] == "monthly":
                time = time_spent.get_time("this_month")[1]
                response = requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'monthly', 'expiry':7*84600*4 },headers=create_headers())
                if response.status_code == 200:
                    database_worker.reset_database(update[0],update[3])
                else:
                    database_worker.reset_database(update[0],600) 
            if update[1] == "live_focus_mode":
                response = requests.post(f"{API_URL}/api/updateLiveFocusMode",json={"data":{
                    'focused':focused['focused'],
                    'seconds':focused['seconds'],
                }},headers=create_headers())
                if response.status_code == 200:
                    val = response.json()
                    if 'error' in val:
                        if val['error'] == "not active":
                            database_worker.reset_database(update[0],84600)
                    else:
                        database_worker.reset_database(update[0],update[3])
                        database_worker.set_live_focus_mode_data(val)
                else:
                    database_worker.reset_database(update[0],update[3])
            if update[1] == "improvements_daily":
                try:
                    data_1 = time_spent.get_time("today")
                    data_2 = time_spent.get_time("yesterday")
                    apps = get_current_workflow_data()
                    distractions = apps['data']['distractions']
                    focused_apps = apps['data']['focused_apps']
                    data = analyze_improvements(data_1,data_2,distractions,focused_apps)

                    database_worker.set_improvements_cache('daily',data)
                    database_worker.reset_database(update[0],update[3])
                except Exception as e:
                    print(e)
                    database_worker.reset_database(update[0],update[3])
            if update[1] == "improvements_weekly":
                try:
                    data_1 = time_spent.get_time("week")
                    data_2 = time_spent.get_time("last_week")
                    apps = get_current_workflow_data()
                    distractions = apps['data']['distractions']
                    focused_apps = apps['data']['focused_apps']
                    data = analyze_improvements(data_1,data_2,distractions,focused_apps)
                    database_worker.set_improvements_cache('weekly',data)
                    database_worker.reset_database(update[0],update[3])
                except Exception as e:
                    print(e)
                    database_worker.reset_database(update[0],update[3])
            if update[1] == "improvements_monthly":
                try:
                    data_1 = time_spent.get_time("this_month")
                    data_2 = time_spent.get_time("previous_month")
                    apps = get_current_workflow_data()
                    distractions = apps['data']['distractions']
                    focused_apps = apps['data']['focused_apps']
                    data = analyze_improvements(data_1,data_2,distractions,focused_apps)
                    database_worker.set_improvements_cache('monthly',data)
                    database_worker.reset_database(update[0],update[3])
                except Exception as e:
                    print(e)
                    database_worker.reset_database(update[0],update[3])
            if update[1] == 'scheduling':
                database_worker.reset_database(update[0],update[3])
        except Exception as e:
            print(e)
            return None
            
def get_current_workflow_data():
    data = database_worker.get_current_workflow_data()
    if 'data' not in data:
        workflow_data = database_worker.get_workflow_by_id(data['id'])
        data['data'] = json.loads(workflow_data[2])
        database_worker.set_current_workflow_data(data)
    return data

def add_mobile_device(device_id):
    try:
        data = requests.post(f"{API_URL}/api/addPhone",json={"phone_share_code":device_id},headers=create_headers()).json()
        if data['success']:
            current_user = database_worker.get_current_user_data()
            current_user['server_data'] = data['user_data']
            database_worker.set_current_user_data(current_user)

    except Exception as e:
        print(e)
        return None

def start_focus_mode_on_phone(duration,name,type,id):
    try:
        print("SENDING FOCUS MODE")
        try:
            duration = int(duration)
        except:
            duration = 20
        return requests.post(f"{API_URL}/api/startFocusModeOnPhone",json={
            "duration":duration,
            "name":name,
            "type":type,
            "id":id
        },headers=create_headers()).json()['success']
    except Exception as e:
        print(e)
        return None

def end_focus_mode_on_phone(id):
    try:
        return requests.post(f"{API_URL}/api/endFocusModeOnPhone",headers=create_headers(),json={
            "id":id
        }).json()['success']
    except Exception as e:
        print(e)
        return None
            
# live focus mode stuff

def get_live_focus_mode_data():
    try:
        data =  requests.get(f"{API_URL}/api/getLiveFocusModeData",headers=create_headers()).json()
        database_worker.set_live_focus_mode_data(data)
        return data
    except Exception as e:
        print(e)
        return None

def get_live_focus_mode_requests():
    try:
        return requests.get(f"{API_URL}/api/getLiveFocusModeRequests",headers=create_headers()).json()['live_focus_mode_requests']
    except Exception as e:
        print(e)
        return []

def create_live_focus_mode(name):
    try:
        data =  requests.post(f"{API_URL}/api/createLiveFocusMode",json={"name":name},headers=create_headers()).json()
        database_worker.start_updating_live_focus_mode()
        print("STARTED LIVE FOCUS MODE")
        return data
    except Exception as e:
        print(e)
        return None


def join_live_focus_mode(live_focus_mode_id):
    try:
        data = requests.post(f"{API_URL}/api/joinLiveFocusMode",json={"live_focus_mode_id":live_focus_mode_id},headers=create_headers()).json()['success']
        database_worker.start_updating_live_focus_mode()
        return data
    except Exception as e:
        print(e)
        return None

def leave_live_focus_mode():
    try:
        return requests.post(f"{API_URL}/api/leaveLiveFocusMode",headers=create_headers()).json()['success']
    except Exception as e:
        print(e)
        return None
    
def invite_to_live_focus_mode(user_id):
    try:
        return requests.post(f"{API_URL}/api/inviteToLiveFocusMode",json={'user_id':user_id},headers=create_headers()).json()
    except Exception as e:
        print(e)
        return None

def end_live_focus_mode():
    try:
        return requests.post(f"{API_URL}/api/endLiveFocusMode",headers=create_headers()).json()
    except Exception as e:
        print(e)
        return None

def get_cached_live_focus_mode_data():
    try:
        data = database_worker.get_live_focus_mode_data()
        if data:
            return data
        else:
            return get_live_focus_mode_data()
    except Exception as e:
        print(e)
        return None
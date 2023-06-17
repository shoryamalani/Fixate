import socketio
import requests
import constants
import database_worker
import get_time_spent as time_spent
import datetime
API_URL = constants.API_URL
sio = socketio.Client()

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
    
def update_server_data(to_update):
    # format of to_update is [(id,name,next_update_time,duration,last_update_time)]
    for update in to_update:
        if update[1] == "every_5_minute_regular":
            time = time_spent.get_time("last_30_minutes")[1]
            requests.post(f"{API_URL}/api/saveLiveSharableData",json={"live_data":time},headers=create_headers())
            database_worker.reset_database(update[0],update[3])
        if update[1] == "daily":
            time = time_spent.get_time("today")[1]
            requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'hourly'},headers=create_headers())
            database_worker.reset_database(update[0],update[3])
        if update[1] == "weekly":
            time = time_spent.get_time("this_week")[1]
            requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'daily'},headers=create_headers())
            database_worker.reset_database(update[0],update[3])
        if update[1] == "monthly":
            time = time_spent.get_time("this_month")[1]
            requests.post(f"{API_URL}/api/saveLeaderboardData",json={"leaderboard_data":time,'timing':'weekly'},headers=create_headers())
            database_worker.reset_database(update[0],update[3])
            

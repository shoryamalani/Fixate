import socketio
import requests
import constants
import database_worker
API_URL = constants.BETA_API_URL
sio = socketio.Client()

# below this is non socket requests

def create_headers():
    headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'user_id': str(database_worker.get_current_user_data()['user_id']),
        'device_id': database_worker.get_current_user_data()['device_id']
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
        user_id =  requests.post(f"{API_URL}/api/createUser",json={"name":name,"privacy_level":privacy_level,"device_id":device_id}).json()['user_id']
        current_user['user_id'] = user_id
        current_user['device_id'] = device_id
        current_user['name'] = name
        current_user['privacy_level'] = privacy_level
        database_worker.set_current_user_data(current_user)
        current_user['server_data'] = get_user_data_from_server()
        database_worker.set_current_user_data(current_user)
    except:
        return None

def set_display_name(display_name):
    try:
        if requests.post(f"{API_URL}/setDisplayName",json={"display_name":display_name},headers=create_headers()).json()['success']:
            current_user = database_worker.get_current_user_data()
            current_user['name'] = display_name
            database_worker.set_current_user_data(current_user)
            return True
    except:
        return None

def get_user_data_from_server():
    try:
        print(create_headers())
        return requests.get(f"{API_URL}/api/getUser",headers=create_headers()).json()
    except Exception as e:
        print(e)
        return None

def change_privacy(privacy_level):
    try:
        if requests.post(f"{API_URL}/api/changePrivacy",json={"privacy_level":privacy_level},headers=create_headers()).json()['success']:
            current_user = database_worker.get_current_user_data()
            current_user['privacy_level'] = privacy_level
            database_worker.set_current_user_data(current_user)
            return True
    except:
        return None
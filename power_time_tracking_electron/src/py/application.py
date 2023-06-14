import json
import constants
import os
from database_worker import check_if_database_created, create_time_database, set_new_time_in_mouse_moved
import multiprocessing
from time import sleep, time
import string
import sys
import database_worker
import datetime
import subprocess
from pebble import concurrent
from concurrent.futures import TimeoutError
from loguru import logger
import requests
import re
import math
import ppt_api_worker
if sys.platform == "darwin":
    from macos_data_grabber import macosOperatingSystemDataGrabber
    systemDataHandler = macosOperatingSystemDataGrabber()
elif sys.platform == "win32":
    from windows_data_grabber import windowsOperatingSystemDataGrabber
    systemDataHandler = windowsOperatingSystemDataGrabber()
# READ THIS LATER 
#https://www.autoitscript.com/forum/topic/115293-how-to-get-firefox-current-page-address/
#https://stackoverflow.com/questions/7814027/how-can-i-get-urls-of-open-pages-from-chrome-and-firefox
# windows mouse movement: https://stackoverflow.com/questions/49847756/detecting-physical-mouse-movement-with-python-and-windows-10-without-cursor-move


global FOCUS_MODE
FOCUS_MODE = False



# import web_app_stuff.app as web_app
# BROWSERS = ["Safari","Google Chrome","Firefox"]
INACTIVE_TIME = 300 # in seconds
# NONFOCUS_APPS = ["Messages","Discord","Slack","Music"]
# NONFOCUS_URLS = ["https://www.youtube.com/watch?v=","macrumors.","lichess.org","9to5mac.",".reddit."]
PROCESSES = {}
UNRECORDED_APPS = ["loginwindow"]

def get_distracting_apps():
    data = requests.get("http://localhost:5005/check_closing_apps").json()
    return data
def check_if_must_be_closed(app,tabname,closing_app):
    try:
        # closing_app = requests.get("http://localhost:5005/check_closing_apps").json()
        will_close = closing_app["closing_apps"]
        apps_to_close = closing_app["apps_to_close"]
    except:
        will_close = False

    if will_close == True:
        if tabname:
            for url in apps_to_close:
                if url in tabname:
                    systemDataHandler.hide_current_frontmost_app()
                    return True
        if app['app_name'] in apps_to_close:
            systemDataHandler.hide_current_frontmost_app()
            return True
        
        

def search_close_and_log_apps():
    # logger.add(f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log",backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
    last_app = ""
    apps = database_worker.get_all_applications()
    apps_in_name_form = [app[1] for app in apps]
    last_thirty_mins_distracting = 0
    whole_time = 0
    while True:
        
        # # logger.debug(front_app)
        # if front_app != None:
            
            #Getting data replaced by JXA and applescript for macos
        # try:
        app = systemDataHandler.get_current_frontmost_app()
        distracting_apps = get_distracting_apps()
        current_app_name = app['app_name']
        tabname = app['url'] if 'url' in app else None
        title = app['title'] if 'title' in app else "Unknown"
        active = True
        #Being replaced by JXA
        # if current_app_name in BROWSERS:
            
        #     try:
        #         future = browser_tab_name(current_app_name)
        #         tabname = future.result()
        #         logger.debug(type(tabname))
        #         logger.debug(tabname)
        #         # tabname = browser_tab_name(current_app_name)
        if tabname:
            short_tab = make_url_to_base(tabname)
            if short_tab not in apps_in_name_form:
                database_worker.add_application_to_db(short_tab,"website",0,0)
                apps_in_name_form.append(short_tab)
            if short_tab in distracting_apps['apps_to_close']:
                last_thirty_mins_distracting += 1
        #     except Exception as err:
        #         logger.debug(err)
        #         tabname = None
        #         logger.debug("not found")
        # else:
        if app["app_name"] not in apps_in_name_form:
            if app["app_name"] not in UNRECORDED_APPS:
                database_worker.add_application_to_db(app["app_name"],"app",0,0)
                apps_in_name_form.append(app["app_name"])
            if app["app_name"] in distracting_apps['apps_to_close']:
                    last_thirty_mins_distracting += 1
        whole_time +=1
        if whole_time == 60*30: # 30 mins
            whole_time = 0
            if last_thirty_mins_distracting > 60*20:
                requests.post("http://127.0.0.1:5005/add_current_notification",json={"notification":{"title":"Just know...","body":f"You have been distracted for more than {math.floor(last_thirty_mins_distracting/60)} minutes in the last 30 minutes. Its ok to be distracted but important to be aware of it."}})
            last_thirty_mins_distracting = 0
        check_if_must_be_closed(app,tabname,distracting_apps)
        
        last_mouse_movement = database_worker.get_time_of_last_mouse_movement()
        if datetime.datetime.now()- last_mouse_movement  > datetime.timedelta(seconds=INACTIVE_TIME):
            active = False
        database_worker.log_current_app(current_app_name,tabname,active,title)
        
        # logger.debug(current_app_name)
        sleep(1)
        # logger.debug(database_worker.get_time_of_last_mouse_movement())
        # except Exception as err:
        #     logger.error(err)


def make_url_to_base(full_url):
    return re.sub(r'(http(s)?:\/\/)|(\/.*){1}', '', full_url)

def stop_logger():
    for process in multiprocessing.active_children():
        process.terminate()
    return True

def get_all_apps_statuses():
    parsed_apps = {}
    all_apps = database_worker.get_all_apps_statuses()
    for app in all_apps:
        parsed_apps[app[0]] = {"name":app[1],"type":app[2],"distracting":app[4]}
    return parsed_apps

def get_all_distracting_apps():
    parsed_apps = []
    all_apps = database_worker.get_all_apps_statuses()
    for app in all_apps:
        if app[4] == 1:
            parsed_apps.append(app[1])
    # logger.debug(parsed_apps)
    return parsed_apps
def save_app_status(applications):
    # logger.debug(applications)
    for key,value in applications.items():
        database_worker.save_app_status(key,value)
    return True

def is_running_logger():
    if multiprocessing.active_children():
        return True
    return False

def add_daily_task(task_name,task_estimate_duration,task_repeating):
    info = {
        "estimate_duration":task_estimate_duration,
        "repeating":task_repeating,
        "ids_of_focus_modes":[],
        "complete":False,
        "time_completed":0,
    }
    info = json.dumps(info)
    id = database_worker.add_daily_task(task_name,info)
    return id

def get_daily_tasks():
    tasks = database_worker.get_all_active_daily_tasks()
    final_tasks = []
    for task in tasks:
        info = json.loads(task[2])
        final_tasks.append({
            "id":task[0],
            "name":task[1],
            "estimated_time":int(info['estimate_duration']),
            "ids_of_focus_modes":info['ids_of_focus_modes'],
            "time_completed":round(info['time_completed'],2),
            "complete":info['complete'],
            "date_created":task[3],
        })
    return final_tasks

def stop_showing_task(task_id):
    database_worker.set_task_to_inactive(task_id)
    return True

def complete_task(task_id):
    data = database_worker.get_task_by_id(task_id)
    info = json.loads(data[2])
    info['complete'] = True
    database_worker.update_daily_task_info(task_id,json.dumps(info))
    return True

def get_all_focus_sessions():
    focus_sessions = database_worker.get_all_focus_sessions()
    final_focus_sessions = []
    for focus_session in focus_sessions:
        final_focus_sessions.append({
            "id":focus_session[0],
            "name":focus_session[5],
            "stated_duration":focus_session[2],
            "start_time":focus_session[1],
            "time_completed":(database_worker.get_time_from_format(focus_session[3])- database_worker.get_time_from_format(focus_session[1])).total_seconds()/60 if focus_session[3] else None, # this takes the start and end times and finds out how many seconds are between them and then divides that by 60 to get minutes
        })
    return final_focus_sessions

def start_focus_mode(duration,name):
    global FOCUS_MODE
    FOCUS_MODE = True
    data = database_worker.start_focus_mode(name,duration,json.dumps(get_all_distracting_apps()))
    return data
def start_focus_mode_with_task(duration,name,task_id):
    global FOCUS_MODE
    FOCUS_MODE = True
    data = database_worker.start_focus_mode(name,duration,json.dumps(get_all_distracting_apps()),json.dumps({"task_id":task_id}))
    task_data = database_worker.get_task_by_id(task_id)
    task_info = json.loads(task_data[2])
    task_info['ids_of_focus_modes'].append(data)
    database_worker.update_daily_task_info(task_data[0],json.dumps(task_info))
    return data

def stop_focus_mode(id):
    global FOCUS_MODE
    FOCUS_MODE = False
    database_worker.stop_focus_mode(id)
    data = database_worker.get_focus_session_by_id(id)
    if data[6]:
        task_data = database_worker.get_task_by_id(json.loads(data[6])["task_id"])
        task_info = json.loads(task_data[2])
        task_info['time_completed'] += (database_worker.get_time_from_format(data[3])- database_worker.get_time_from_format(data[1])).total_seconds()/60
        database_worker.update_daily_task_info(task_data[0],json.dumps(task_info))
    return True


def boot_up_checker():
    logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
    try:
        if not os.path.exists(constants.DATABASE_LOCATION):
            os.mkdir(constants.DATABASE_LOCATION)
        elif not os.path.exists(constants.DATABASE_LOCATION + "/"+constants.DATABASE_NAME):   
            create_time_database()
        database_created = check_if_database_created()
        if not database_created:
            time_table = create_time_database() 
            
            if not time_table:
                logger.debug("database failed")
                sys.exit()
        else:
            logger.debug(database_created)
            database_created = list(database_created)
            if database_created[1] == "1.0":
                database_worker.update_to_database_version_1_1()
                database_created[1] = "1.1"
            if database_created[1] == "1.1":
                database_worker.update_to_database_version_1_2()
                database_created[1] = "1.2"
            if database_created[1] == "1.2":
                database_worker.update_to_database_version_1_3()
                database_created[1] = "1.3"
            if database_created[1] == "1.3":
                database_worker.update_to_database_version_1_4()
                database_created[1] = "1.4"
            if database_created[1] == "1.4":
                database_worker.update_to_database_version_1_5()
                database_created[1] = "1.5"
            if database_created[1] == "1.5":
                database_worker.update_to_database_version_1_6()
                database_created[1] = "1.6"
            if database_created[1] == "1.6":
                database_worker.update_to_database_version_1_7()
                database_created[1] = "1.7"
        print(database_worker.get_current_user_data())
        if  'device_id' not in database_worker.get_current_user_data():
            cur_data = json.loads(database_worker.get_current_user_data())
            val = ppt_api_worker.create_devices()
            print(val)
            if val:
                cur_data['device_id'] = ppt_api_worker.create_devices()
                database_worker.set_current_user_data(cur_data)
        # start_running_event_loop_in_ns_application()
        # start_mouse_movement_checker()
        logger.debug(multiprocessing.active_children())
        if len(multiprocessing.active_children()) < 2:
            systemDataHandler.check_interaction_periodic()
            # PROCESSES["mouse_movement"] = mouse_movement
            # PROCESSES["mouse_movement"].start()
            multiprocessing.Process(target=search_close_and_log_apps).start()
        global CLOSING_APPS
        CLOSING_APPS = False
        
        global CURRENT_APP
        CURRENT_APP="default value"
        # search_close_and_log_apps = multiprocessing.Process(target=search_close_and_log_apps).start()
        # PROCESSES["search_close_and_log_apps"] = search_close_and_log_apps
        # multiprocessing.Process(target=web_app.start_app).start()
        
    except Exception as e:
        logger.debug(e)
        return e
    return True
def get_focus_mode_status():
    global FOCUS_MODE
    try:
        if FOCUS_MODE:
            latest_focus_mode = database_worker.get_latest_focus_session()
            print(latest_focus_mode)
            if(latest_focus_mode):
                end_time = datetime.datetime.strptime(latest_focus_mode[1], '%Y-%m-%d %H:%M:%S') + datetime.timedelta(minutes=latest_focus_mode[2])
                start_time = datetime.datetime.strptime(latest_focus_mode[1], '%Y-%m-%d %H:%M:%S')
                time_elapsed = datetime.datetime.now() - start_time
                time_elapsed = f"{int(time_elapsed.total_seconds()/60)}:{  time_elapsed.seconds%60 if time_elapsed.seconds%60> 9 else '0'+str(time_elapsed.seconds%60)}"
                time_remaining = end_time - datetime.datetime.now()
                time_remaining = f"{int(time_remaining.total_seconds()/60)}:{  time_remaining.seconds%60 if time_remaining.seconds%60> 9 else '0'+str(time_remaining.seconds%60)}"
                if (end_time < datetime.datetime.now()):
                    stop_focus_mode(latest_focus_mode[0])
                    return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None}
                return {"status":True, "Name": latest_focus_mode[5], "Duration": latest_focus_mode[2], "Time Remaining": time_remaining, "Time Elapsed": time_elapsed, "Time Completed": latest_focus_mode[6], "Time Started": latest_focus_mode[1],'task_id':json.loads(latest_focus_mode[6])["task_id"] if latest_focus_mode[6] else None, 'id': latest_focus_mode[0]}
            else:
                return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None} 
        else:
            return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None}
    except Exception as e:
        print(e)
        return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None}

def get_current_user():
    device_id = database_worker.get_current_user_data()['device_id'] if'device_id' in database_worker.get_current_user_data() else None
    if device_id == None:
        return {"status":False}
    user_id = database_worker.get_current_user_data()['user_id'] if'user_id' in database_worker.get_current_user_data() else None
    if user_id == None:
        return {"status":True,'device_id':device_id, "user_id":None}
    return {"status":True, "user_id":user_id, 'device_id':device_id, "user_data":database_worker.get_current_user_data()}
    
if __name__ == "__main__":
    boot_up_checker()

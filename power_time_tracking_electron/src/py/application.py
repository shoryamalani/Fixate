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
# from pebble import concurrent
from concurrent.futures import TimeoutError
from loguru import logger
import requests
import shutil
import re
import math
import ppt_api_worker
import grab_and_save_icon
from PIL import Image
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

global SCHEDULING_DATA
SCHEDULING_DATA = {}


global LAST_FEW_SECONDS
LAST_FEW_SECONDS = []


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
        will_close = closing_app["closing_apps"]
        whitelist = closing_app["whitelist"]
        if whitelist:
            will_close = False
        apps_to_close = closing_app["apps_to_close"]
        apps_to_keep = closing_app["focused_apps"]
    except:
        will_close = False
        whitelist = False

    if will_close == True:
        if '' in apps_to_close:
            apps_to_close.remove('')
        if tabname:
            for url in apps_to_close:
                if url in tabname:
                    systemDataHandler.hide_current_frontmost_app()
                    return True
        if app['app_name'] in apps_to_close:
            systemDataHandler.hide_current_frontmost_app()
            return True
    if whitelist:
        if '' in apps_to_keep:
            apps_to_keep.remove('')
        if tabname:
            for url in apps_to_keep:
                if url in tabname:
                    return False
        if tabname:
            systemDataHandler.hide_current_frontmost_app()
            return True
        if app['app_name'] in apps_to_keep or app['app_name'] == "Fixate":
            return False
        else:
            systemDataHandler.hide_current_frontmost_app()
            return True
    return False
        
    

def update_scheduling_data():
    global SCHEDULING_DATA
    data = database_worker.get_scheduling_buckets()
    SCHEDULING_DATA['buckets'] = {}
    SCHEDULING_DATA['apps'] = {}
    SCHEDULING_DATA['websites'] = {}
    for bucket in data:
        if bucket[3] == 1:
            # print(bucket)
            bucket = list(bucket)
            bucket[2] = json.loads(bucket[2])
            
            SCHEDULING_DATA['buckets'][bucket[0]] = bucket
            for app in bucket[2]['apps']:
                if app not in SCHEDULING_DATA['apps']:
                    SCHEDULING_DATA['apps'][app] = []
                SCHEDULING_DATA['apps'][app].append(bucket[0])
            
            for url in bucket[2]['websites']:
                if url not in SCHEDULING_DATA['websites']:
                    SCHEDULING_DATA['websites'][make_url_to_base(url)] = []
                SCHEDULING_DATA['websites'][make_url_to_base(url)].append(bucket[0])

def update_scheduling_time(app,tabname,last_time):
    global SCHEDULING_DATA
    seconds_between_last_time = (datetime.datetime.now()-last_time).total_seconds()
    # logger.debug(seconds_between_last_time) 
    if tabname:
        tabname = make_url_to_base(tabname)
        if tabname in SCHEDULING_DATA['websites']:
            for bucket in SCHEDULING_DATA['websites'][tabname]:
                old_bucket_time = SCHEDULING_DATA['buckets'][bucket][6]
                bucket_end_time = SCHEDULING_DATA['buckets'][bucket][5]
                if database_worker.get_time_from_format(bucket_end_time) < datetime.datetime.now():
                    # start of day
                    start_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=0,minute=0,second=0))
                    # end of day
                    end_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=23,minute=59, second=59))
                    database_worker.set_schedule_bucket_timings(bucket,start_time,end_time)
                    # print("updated scheduling data")
                    update_scheduling_data()
                else:
                    SCHEDULING_DATA['buckets'][bucket][6] = old_bucket_time + seconds_between_last_time
                    database_worker.add_time_to_scheduling_bucket(bucket,SCHEDULING_DATA['buckets'][bucket][6])
    else:
        if app['app_name'] in SCHEDULING_DATA['apps']:
            for bucket in SCHEDULING_DATA['apps'][app['app_name']]:
                old_bucket_time = SCHEDULING_DATA['buckets'][bucket][6]
                bucket_end_time = SCHEDULING_DATA['buckets'][bucket][5]
                if database_worker.get_time_from_format(bucket_end_time) < datetime.datetime.now():
                    # start of day
                    start_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=0,minute=0,second=0))
                    # end of day
                    end_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=23,minute=59, second=59))
                    database_worker.set_schedule_bucket_timings(bucket,start_time,end_time)
                    # print("updated scheduling data")
                    update_scheduling_data()
                else:
                    SCHEDULING_DATA['buckets'][bucket][6] = old_bucket_time + seconds_between_last_time
                    database_worker.add_time_to_scheduling_bucket(bucket,SCHEDULING_DATA['buckets'][bucket][6])                

def check_if_closed_on_scheduling(app,tabname,time):
    global SCHEDULING_DATA
    relevant_buckets = []
    relevant_name = ""
    if tabname:
        tabname = make_url_to_base(tabname)
        relevant_name = tabname
        if tabname in SCHEDULING_DATA['websites']:
            relevant_buckets = SCHEDULING_DATA['websites'][tabname]
    else:
        relevant_name = app['app_name']
        if app['app_name'] in SCHEDULING_DATA['apps']:
            relevant_buckets = SCHEDULING_DATA['apps'][app['app_name']]
    # logger.debug('relevant buckets' + str(relevant_buckets))
    # logger.debug(time)
    if 'block_stamps' in SCHEDULING_DATA:
        if relevant_name in SCHEDULING_DATA['block_stamps']:
            if datetime.datetime.now() < datetime.datetime.strptime(SCHEDULING_DATA['block_stamps'][relevant_name],"%Y-%m-%d %H:%M:%S"):
                systemDataHandler.hide_current_frontmost_app()
                return True
    for bucket in relevant_buckets:
        logger.debug(SCHEDULING_DATA['buckets'][bucket][6])
        if int(SCHEDULING_DATA['buckets'][bucket][6]) > SCHEDULING_DATA['buckets'][bucket][2]['block_time']:
            logger.debug(time)
            logger.debug(int((SCHEDULING_DATA['buckets'][bucket][2]['post_block_time']))/math.pow(2,(int(SCHEDULING_DATA['buckets'][bucket][6]) - int(SCHEDULING_DATA['buckets'][bucket][2]['block_time']))/SCHEDULING_DATA['buckets'][bucket][2]['post_double_time']))
            if int(time) > int((SCHEDULING_DATA['buckets'][bucket][2]['post_block_time']))/math.pow(2,(int(SCHEDULING_DATA['buckets'][bucket][6]) - int(SCHEDULING_DATA['buckets'][bucket][2]['block_time']))/SCHEDULING_DATA['buckets'][bucket][2]['post_double_time']):
                systemDataHandler.hide_current_frontmost_app()
                if 'block_stamps' not in SCHEDULING_DATA['buckets'][bucket][2]:
                    SCHEDULING_DATA['block_stamps'] = {}
                SCHEDULING_DATA['block_stamps'][relevant_name] = (datetime.datetime.now()+datetime.timedelta(seconds=SCHEDULING_DATA['buckets'][bucket][2]['post_block_time'])).strftime("%Y-%m-%d %H:%M:%S")
                return True




def search_close_and_log_apps():
    if sys.platform == "win32":
        def pythonFolder(folder: str) -> str:
            return os.path.expandvars(r"%LocalAppData%\Fixate\app-1.11.3\resources\python") + "\\" + folder
        sys.path = ['', os.path.expandvars(r"%LocalAppData%\Fixate\app-1.11.3\resources\python"), pythonFolder(r"Lib\site-packages"), pythonFolder(r"python39.zip"), pythonFolder(r"DLLs"), pythonFolder(r"Lib"), pythonFolder(r"Lib\site-packages\win32"), pythonFolder(r"Lib\site-packages\win32\lib"), pythonFolder(r"Lib\site-packages\Pythonwin"), os.path.expandvars(r"%LocalAppData%\Fixate\app-1.11.3\resources\py")]
    last_app = ""
    current_app_time = 0
    apps = database_worker.get_all_applications()
    apps_and_websites_with_icons = [a[1] for a in database_worker.get_all_applications_and_websites_with_icons()]
    apps_in_name_form = [app[1] for app in apps]
    last_thirty_mins_distracting = 0
    whole_time = 0
    global LAST_FEW_SECONDS
    last_time = datetime.datetime.now()
    update_scheduling_data()
    while True:
        
    # # logger.debug(front_app)
    # if front_app != None:
        
        #Getting data replaced by JXA and applescript for macos
        try:
            app = systemDataHandler.get_current_frontmost_app()
            distracting_apps = get_distracting_apps()
            current_app_name = app['app_name']
            tabname = app['url'] if 'url' in app else None
            title = app['title'] if 'title' in app else "Unknown"
            active = True
            if tabname:
                short_tab = make_url_to_base(tabname)
                if short_tab not in apps_in_name_form:
                    database_worker.add_application_to_db(short_tab,"website",0,0)
                    apps_in_name_form.append(short_tab)
                if short_tab in distracting_apps['apps_to_close']:
                    last_thirty_mins_distracting += 1
                    LAST_FEW_SECONDS.append(False)
                else:
                    LAST_FEW_SECONDS.append(True)
                if len(LAST_FEW_SECONDS) > 10:
                    LAST_FEW_SECONDS = []

                if short_tab not in apps_and_websites_with_icons:
                    path:os.path = grab_and_save_icon.save_website_icon(short_tab)
                    if path:
                        database_worker.set_icon(short_tab,short_tab,"website",{"path":path,"type":"website"})
                        apps_and_websites_with_icons.append(short_tab)
            else:
                if current_app_name not in apps_and_websites_with_icons:
                    image:Image = systemDataHandler.get_icon_path()
                    if image:
                        path = grab_and_save_icon.save_app_icon(image,current_app_name)
                        if path:
                            database_worker.set_icon(current_app_name,current_app_name,"app",{"path":path,"type":"app"})
                            apps_and_websites_with_icons.append(current_app_name)

            if app["app_name"] not in apps_in_name_form:
                if app["app_name"] not in UNRECORDED_APPS:
                    database_worker.add_application_to_db(app["app_name"],"app",0,0)
                    apps_in_name_form.append(app["app_name"])
            if app["app_name"] in distracting_apps['apps_to_close']:
                last_thirty_mins_distracting += 1
                LAST_FEW_SECONDS.append(False)
            else:
                LAST_FEW_SECONDS.append(True)
            if len(LAST_FEW_SECONDS) > 10:
                LAST_FEW_SECONDS = []
            whole_time +=1
            if whole_time == 60*30: # 30 mins
                whole_time = 0
                if last_thirty_mins_distracting > 60*20:
                    requests.post("http://127.0.0.1:5005/add_current_notification",json={"notification":{"title":"Just know...","body":f"You have been distracted for more than {math.floor(last_thirty_mins_distracting/60)} minutes in the last 30 minutes. Its ok to be distracted but important to be aware of it."}})
                last_thirty_mins_distracting = 0
            update_scheduling_time(app,tabname,last_time)
            
            if not check_if_must_be_closed(app,tabname,distracting_apps):
                check_if_closed_on_scheduling(app,tabname,current_app_time)
            if tabname:
                if make_url_to_base(tabname) != last_app:
                    current_app_time = 0
                else:
                    current_app_time += (datetime.datetime.now()-last_time).total_seconds()
                last_app = make_url_to_base(tabname)
            else:
                if current_app_name != last_app:
                    current_app_time = 0
                else:
                    current_app_time += (datetime.datetime.now()-last_time).total_seconds()
                last_app = current_app_name
            last_time = datetime.datetime.now()
            last_mouse_movement = database_worker.get_time_of_last_mouse_movement()
            if datetime.datetime.now()- last_mouse_movement  > datetime.timedelta(seconds=INACTIVE_TIME):
                active = False
                LAST_FEW_SECONDS.pop()
            database_worker.log_current_app(current_app_name,tabname,active,title)
            # print(LAST_FEW_SECONDS)
            check_if_server_must_be_updated() 
            # logger.debug(current_app_name)
            # logger.debug(current_app_time)
            
            if sys.platform != "win32":
                sleep(1)
        # logger.debug(database_worker.get_time_of_last_mouse_movement())
        except Exception as err:
            logger.error(err)
            sleep(.3)
def check_if_server_must_be_updated():
    to_update = database_worker.server_update_required()
    global LAST_FEW_SECONDS
    vals = {}
    if to_update:
        for a in to_update:
            if a[1] == "live_focus_mode":
                vals['focused'] = all(LAST_FEW_SECONDS)
                vals['seconds'] = len(LAST_FEW_SECONDS)
                LAST_FEW_SECONDS = []
            elif a[1] == 'scheduling':
                update_scheduling_data()
        ppt_api_worker.update_server_data(to_update,vals)


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
        parsed_apps[app[0]] = {"name":app[1],"type":app[2],"distracting":False,"focused":False} # while technically there is data in the distracting and focused fields, it will no longer be used as of 1.11.3
    return parsed_apps

# def get_all_distracting_apps():
#     parsed_apps = []
#     all_apps = database_worker.get_all_apps_statuses()
#     for app in all_apps:
#         if app[4] == 1:
#             parsed_apps.append(app[1])
#     # logger.debug(parsed_apps)
#     return parsed_apps

def get_current_distracted_and_focused_apps():
    data = get_current_workflow_data()
    return data['data']['distractions'],data['data']['focused_apps']


def save_app_status(applications):
    # logger.debug(applications)
    for key,value in applications.items():
        database_worker.save_app_status(key,value)
    return True

def is_running_logger():
    if multiprocessing.active_children():
        return True
    return False

def set_current_workflow(workflow_id):
    data = database_worker.get_workflow_by_id(int(workflow_id))
    database_worker.set_current_workflow_data({"id":data[0],"data":json.loads(data[2])})
    logger.debug("Set current workflow to",data[1])
    return True

def add_daily_task(task_name,task_estimate_duration):
    info = {
        "estimate_duration":int(task_estimate_duration),
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
def uncomplete_task(task_id):
    data = database_worker.get_task_by_id(task_id)
    info = json.loads(data[2])
    info['complete'] = False
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

def start_focus_mode(duration,name,type):
    global FOCUS_MODE
    FOCUS_MODE = True
    distractions, focused_apps = get_current_distracted_and_focused_apps()
    data = database_worker.start_focus_mode(name,duration,json.dumps(distractions),json.dumps({"focused_apps":focused_apps,"type":type}))
    return data

def start_focus_mode_with_task(duration,name,type,task_id):
    global FOCUS_MODE
    FOCUS_MODE = True
    distractions, focused_apps = get_current_distracted_and_focused_apps()
    data = database_worker.start_focus_mode(name,duration,json.dumps(distractions),json.dumps({"task_id":task_id,"focused_apps":focused_apps,"distracting_apps":distractions,"type":type}))
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

def get_workflows():
    workflow_data =  database_worker.get_workflows()
    final_workflows = {}
    for workflow in workflow_data:
        final_workflows[workflow[0]] = {
            "name":workflow[1],
            "id":workflow[0],
            "data":json.loads(workflow[2]),
        }
    return final_workflows

def get_all_apps_in_workflow(workflow_id):
    if not workflow_id:
        workflow_id = database_worker.get_current_workflow_data()['id']
    # print(workflow_id)
    workflow_data = database_worker.get_workflow_by_id(workflow_id)[2]
    workflow_apps = json.loads(workflow_data)['applications']
    workflow_mods = json.loads(workflow_data)['modifications']
    all_apps = get_all_apps_statuses() # in proper dictionary format
    final_apps = {}
    # print(workflow_apps)
    for value in workflow_apps.values():
        # print(value)
        if value['name'] not in final_apps:
            final_apps[value['name']] = value # this is data based and nice in a json
    for value in workflow_mods.values():
        final_apps[value['name']] = value
    for value in all_apps.values():
        # print(value)
        if value['name'] not in final_apps:
            final_apps[value['name']] = value
    final_apps.pop("",None)
    icons = database_worker.get_all_icons_with_paths()

    for icon in icons:
        if icon[1] in final_apps:
            final_apps[icon[1]]['icon'] = json.loads(icon[5])['path']

    # print(final_apps)
    return final_apps

def add_workflow_modification(workflow_id,modification):
    workflow_data = database_worker.get_workflow_by_id(workflow_id)[2]
    data = json.loads(workflow_data)
    # print(type(data))
    # print(data['modifications'])
    # print(modification)
    data['modifications'][modification['name']] = modification
    database_worker.update_workflow(workflow_id,data)
    return True

def get_current_workflow_data():
    data = database_worker.get_current_workflow_data()
    if 'data' not in data:
        workflow_data = database_worker.get_workflow_by_id(data['id'])
        data['data'] = json.loads(workflow_data[2])
        database_worker.set_current_workflow_data(data)
    return data


def get_rings():
    # data = database_worker.get_rings()
    try:
        focus_sessions = database_worker.get_all_focus_sessions_for_today()
        tasks_for_today = database_worker.get_todays_tasks()
        total_wanted_time_spent = 0
        tasks_completed = 0
        for task in tasks_for_today:
            total_wanted_time_spent += int(json.loads(task[2])['estimate_duration'])
            if json.loads(task[2])['complete']:
                tasks_completed += 1
        total_time_spent = 0
        for session in focus_sessions:
            if session[3]:
                total_time_spent += (database_worker.get_time_from_format(session[3])- database_worker.get_time_from_format(session[1])).total_seconds()/60
        return {"total_time_spent":total_time_spent,"total_wanted_time_spent":total_wanted_time_spent,"tasks_completed":tasks_completed,"tasks_total":len(tasks_for_today)}
    except Exception as e:
        logger.error(e)
        return {"total_time_spent":0,"total_wanted_time_spent":0,"tasks_completed":0,"tasks_total":0}

def get_all_progress_orbits():
    focus_sessions = database_worker.get_all_focus_sessions()
    tasks = database_worker.get_all_active_daily_tasks()
    final_data = {}
    for task in tasks:
        day = datetime.datetime.strptime(task[3], database_worker.get_time_format())
        day = day.strftime("%Y-%m-%d")
        if day not in final_data:
            final_data[day] = {"tasks":[],"sessions":[],"complete":0,"desired_time":0,"time_completed":0}
        final_data[day]['tasks'].append(task[0])
        try:
            final_data[day]['complete'] += 1 if json.loads(task[2])['complete'] else 0
            final_data[day]['desired_time'] += int(json.loads(task[2])['estimate_duration'])
        except Exception as e:
            pass
    for session in focus_sessions:
        day = datetime.datetime.strptime(session[1], database_worker.get_time_format())
        day = day.strftime("%Y-%m-%d")
        if day not in final_data:
            final_data[day] = {"tasks":[],"sessions":[],"complete":0,"desired_time":0,"time_completed":0}
        final_data[day]['sessions'].append(session[0])
        if session[3]:
            final_data[day]['time_completed'] += (database_worker.get_time_from_format(session[3])- database_worker.get_time_from_format(session[1])).total_seconds()/60
    return final_data



def get_active_phones():
    ppt_api_worker.get_user_data_from_server()
    data = database_worker.get_current_user_data()
    return data['server_data']['mobile_devices']

def add_active_phone(phone_id):
    ppt_api_worker.add_mobile_device(phone_id)
    data = database_worker.get_current_user_data()
    return data['server_data']['mobile_devices']

    
def get_improvement_data():
    data = database_worker.get_improvement_data()
    return data

def check_chrome_extension_installed():
    if database_worker.get_latest_chrome_url() == "NOT A URL":
        return False
    return True

def get_scheduling_buckets():
    data = database_worker.get_scheduling_buckets()
    final_data = []
    for bucket in data:
        bucket = list(bucket)
        bucket[2] = json.loads(bucket[2])
        final_data.append(bucket)
    return final_data

def add_scheduling_bucket(name):
    # start of day
    start_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=0,minute=0,second=0))
    # end of day
    end_time = database_worker.get_time_in_format_from_datetime(datetime.datetime.now().replace(hour=23,minute=59, second=59))
    data = database_worker.add_scheduling_bucket(name,database_worker.create_scheduling_bucket_data([],[]),True,start_time,end_time,60*60*24)
    return data

def update_scheduling_bucket(id,data):
    # print(data)
    data = database_worker.update_scheduling_bucket(id,data[1],data[2],data[3],data[7])
    return data

def boot_up_checker():
    # check if still using PowerTimeTracking folder
    if os.path.exists(constants.OLD_DATABASE_LOCATION) and not os.path.exists(constants.DATABASE_LOCATION+"/time_database.db"):
        # try:
        # print("moving database")
        # shutil.move(constants.OLD_DATABASE_LOCATION, constants.DATABASE_LOCATION)
        # shutil.copytree(constants.OLD_DATABASE_LOCATION, constants.DATABASE_LOCATION)
        shutil.copyfile(constants.OLD_DATABASE_LOCATION+"/time_database.db", constants.DATABASE_LOCATION+"/time_database.db")

        # except Exception as e:
        #     logger.error("SDHFOISHDOF IHSODIH J")
        #     logger.debug(e)
    else:
        logger.debug(os.path.exists(constants.OLD_DATABASE_LOCATION) )
        logger.debug(os.path.exists(constants.DATABASE_LOCATION))
        logger.debug(constants.DATABASE_LOCATION)
        logger.debug("no need to move database")
    # check if too many items in logger folder
    try:
        path = os.path.dirname(constants.LOGGER_LOCATION)
        # get the folder of the file
        folder = path

        if not os.path.exists(folder):
            os.mkdir(folder)
        else:
            if len(os.listdir(folder)) > 5:
                for file in os.listdir(folder):
                    os.remove(folder+"/"+file)
    except Exception as e:
        logger.debug(e)
        return e
    logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {file} | {function} | {line} | {level} | {message}",rotation="5MB", retention=5)
    try:
        if not os.path.exists(constants.DATABASE_LOCATION):
            os.mkdir(constants.DATABASE_LOCATION)
        elif not os.path.exists(constants.DATABASE_LOCATION + "/"+constants.DATABASE_NAME):   
            create_time_database()
        if not os.path.exists(constants.ICON_LOCATION):
            os.mkdir(constants.ICON_LOCATION)
        
        database_created = check_if_database_created()
        if not database_created:
            time_table = create_time_database() 
            
            if not time_table:
                logger.debug("database failed")
                sys.exit()

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
        if database_created[1] == "1.7":
            database_worker.update_to_database_version_1_8()
            database_created[1] = "1.8"
        if database_created[1] == "1.8":
            database_worker.update_to_database_version_1_9()
            database_created[1] = "1.9"
        if database_created[1] == "1.9":
            database_worker.update_to_database_version_1_10()
            database_created[1] = "1.10"
        if database_created[1] == "1.10":
            database_worker.update_to_database_version_1_11()
            database_created[1] = "1.11"
        if database_created[1] == "1.11":
            database_worker.update_to_database_version_1_12()
            database_created[1] = "1.12"
        if database_created[1] == "1.12":
            database_worker.update_to_database_version_1_13()
            database_created[1] = "1.13"
        if database_created[1] == "1.13":
            database_worker.update_to_database_version_1_14()
            database_created[1] = "1.14"
        if database_created[1] == "1.14":
            database_worker.update_to_database_version_1_15()
            database_created[1] = "1.15"
        if database_created[1] == "1.15":
            database_worker.update_to_database_version_1_16()
            database_created[1] = "1.16"
        if database_created[1] == "1.16":
            database_worker.update_to_database_version_1_17()
            database_created[1] = "1.17"
        if database_created[1] == "1.17":
            database_worker.update_to_database_version_1_18()
            database_created[1] = "1.18"
        if database_created[1] == "1.18":
            database_worker.update_to_database_version_1_19()
            database_created[1] = "1.19"
        if database_created[1] == "1.19":
            database_worker.update_to_database_version_1_20()
            database_created[1] = "1.20"
        
        if ppt_api_worker.has_active_user() == False:
            database_worker.reset_user_data()
            logger.debug("no active user")
        else:
            logger.debug("has active user")



        if  'device_id' not in database_worker.get_current_user_data():
            cur_data = database_worker.get_current_user_data()
            val = ppt_api_worker.create_devices()
            print(val)
            if val:
                cur_data['device_id'] = val
                database_worker.set_current_user_data(cur_data)
        # start_running_event_loop_in_ns_application()
        # start_mouse_movement_checker()
        logger.debug(multiprocessing.active_children())
        if len(multiprocessing.active_children()) < 2:
            systemDataHandler.check_interaction_periodic()
            # PROCESSES["mouse_movement"] = mouse_movement
            # PROCESSES["mouse_movement"].start()
            log = multiprocessing.Process(target=search_close_and_log_apps).start()
            # log.daemon = True
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
            # print(latest_focus_mode)
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
                return {"status":True,"type":json.loads(latest_focus_mode[6])["type"] if latest_focus_mode[6] else None, "Name": latest_focus_mode[5], "Duration": latest_focus_mode[2], "Time Remaining": time_remaining, "Time Elapsed": time_elapsed, "Time Completed": latest_focus_mode[6], "Time Started": latest_focus_mode[1],'task_id':json.loads(latest_focus_mode[6])["task_id"] if latest_focus_mode[6] else None, 'id': latest_focus_mode[0], "focused_apps":json.loads(latest_focus_mode[6])["focused_apps"] if latest_focus_mode[6] else None, "distracting_apps": latest_focus_mode[3]}
            else:
                return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None} 
        else:
            return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None}
    except Exception as e:
        print(e)
        return {"status":False, "Name": 'none', "Duration": 0, "Time Remaining": 0, "Time Elapsed": 0, "Time Completed": 0, "Time Started": 0, "Time Ended": 0, "Distracting Apps": [],'task_id':None}
   
def save_chrome_url(url: str):
    database_worker.save_chrome_url(url)

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

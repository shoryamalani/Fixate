
from typing import Type
from dbs_scripts.write_and_read_to_database import make_write_to_db,make_read_from_db
from dbs_scripts.create_database import *
import sqlite3
import datetime
import constants
from loguru import logger
import os
import json
DATABASE_PATH = constants.DATABASE_LOCATION + "/" + constants.DATABASE_NAME
DATABASE_VERSION = "1.0"
def connect_to_db():
    """
    Connects to the database
    """
    conn = sqlite3.connect(DATABASE_PATH, check_same_thread=False,timeout=10)
    return conn
def check_if_database_created():
    """
    Checks if the database is already created
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT * FROM database_and_application_version WHERE id=1")
        data = c.fetchone()
        conn.close()
    except sqlite3.OperationalError:
        return False
    return data

def create_time_database():
    """
    Creates the database
    """
    if not check_if_database_created():
        conn = connect_to_db()
        c = conn.cursor()
        log_table_string = create_table_command("log",[["time","DATETIME"],["app","text"],["tabname","text"],["active","bool"]])
        time_table_string = create_table_command("mouse_moved",[["UUID","SERIAL PRIMARY KEY"],["time","DATETIME"]])
        applications_table_string = create_table_command("applications",[["id","INTEGER PRIMARY KEY"],["application_name","text"],["type","text"],["productivity","int(3)"],["distracting","bool"],["custom_time_out","int(7)"]])
        workflows_table_string = create_table_command("workflows",[["id","INTEGER PRIMARY KEY"],["applications","text"],["type","text"],["productivity","int(3)"],["blocked_apps","text"]])
        database_and_application_version_table_string = create_table_command("database_and_application_version",[["id","INTEGER PRIMARY KEY"],["database_version","text"]])
        conn.execute(log_table_string)
        conn.execute(time_table_string)
        conn.execute(workflows_table_string)
        conn.execute(database_and_application_version_table_string)
        conn.execute(applications_table_string)
        time_moved_set = make_write_to_db([(["0",get_time_in_format()])],"mouse_moved",["UUID","time"])
        write_database_version = make_write_to_db([([DATABASE_VERSION])],"database_and_application_version",["database_version"])
        conn.execute(time_moved_set)
        conn.execute(write_database_version)
        conn.commit()
        conn.close()
        update_to_database_version_1_1()
        return True
    else:
        return False

def update_to_database_version_1_1():
    """
    Updates the database to version 1.1
    """
    conn = connect_to_db()
    c = conn.cursor()
    applications_table_string = create_table_command("focus_sessions",[["id","INTEGER PRIMARY KEY"],["time","DATETIME"],["stated_duration","int"],["actual_duration","DATETIME"],["inactive_applications","text"]])
    c.execute(applications_table_string)
    c.execute("UPDATE database_and_application_version SET database_version = '1.1' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_2():
    """
    Updates the database to version 1.2
    """
    conn = connect_to_db()
    c = conn.cursor()
    # applications_table_string = create_table_command("focus_sessions",[["id","INTEGER PRIMARY KEY"],["time","DATETIME"],["stated_duration","int"],["actual_duration","DATETIME"],["inactive_applications","text"]])
    alter_log = "ALTER TABLE log ADD COLUMN window_title text"
    c.execute(alter_log)
    create_tasks_table = create_table_command("tasks",[["id","INTEGER PRIMARY KEY"],["task_name","text"],["info","text"]])
    c.execute(create_tasks_table)
    c.execute("UPDATE database_and_application_version SET database_version = '1.2' WHERE id=1")
    conn.commit()
    conn.close()

# def update_to_database_version_1_2():
#     """
#     Updates the database to version 1.2
#     """
#     conn = connect_to_db()
#     c = conn.cursor()

#     c.execute(applications_table_string)
#     c.execute("UPDATE database_and_application_version SET database_version = '1.2' WHERE id=1")
#     conn.commit()
#     conn.close()

def update_to_database_version_1_3():
    """
    Updates the database to version 1.3
    """
    conn = connect_to_db()
    c = conn.cursor()
    alter_log = "ALTER TABLE tasks ADD COLUMN day DATETIME"
    c.execute(alter_log)
    c.execute("UPDATE database_and_application_version SET database_version = '1.3' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_4():
    """
    Updates the database to version 1.4
    """
    conn = connect_to_db()
    c = conn.cursor()
    alter_log = "ALTER TABLE focus_sessions ADD COLUMN name text"
    c.execute(alter_log)
    alter_log = "ALTER TABLE focus_sessions ADD COLUMN info text"
    c.execute(alter_log)
    c.execute("UPDATE database_and_application_version SET database_version = '1.4' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_5():
    """
    Updates the database to version 1.5
    """
    conn = connect_to_db()
    c = conn.cursor()
    alter_log = "ALTER TABLE tasks ADD COLUMN active bool"
    c.execute(alter_log)
    c.execute("UPDATE database_and_application_version SET database_version = '1.5' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_6():
    """
    Updates the database to version 1.6
    """
    conn = connect_to_db()
    c = conn.cursor()
    current_url_table = create_table_command("current_url",[["id","INTEGER PRIMARY KEY"],["time","DATETIME"],["url","text"]])
    c.execute(current_url_table)
    conn.commit()
    insert_current_url = make_write_to_db([(["1",get_time_in_format(),"NOT A URL"])] ,"current_url",["id","time","url"])
    c.execute(insert_current_url)
    create_user_table = create_table_command("user",[["id","INTEGER PRIMARY KEY"],["name","text"],["data","json"]])
    c.execute(create_user_table)
    create_memoized_data_table = create_table_command("memoized_data",[["id","INTEGER PRIMARY KEY"],["start_time","DATETIME"],['end_time',"DATETIME"],['duration','int'],["data","json"]])
    c.execute(create_memoized_data_table)
    c.execute("UPDATE database_and_application_version SET database_version = '1.6' WHERE id=1")

    conn.commit()
    conn.close()

def update_to_database_version_1_7():
    """
    Updates the database to version 1.7
    """
    # add a user to user table
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("INSERT INTO user (id,name) VALUES (?,?)",(1,"default"))
    # c.execute("UPDATE user SET name = 'default',data = ? WHERE id=1",[json.dumps({})])
    c.execute("UPDATE database_and_application_version SET database_version = '1.7' WHERE id=1")
    conn.commit()
    conn.close()
    set_current_user_data({})

def update_to_database_version_1_8():
    """
    Updates the database to version 1.8
    """
    # add a user to user table
    conn = connect_to_db()
    c = conn.cursor()
    server_update_times = create_table_command("server_update_times",[["id","INTEGER PRIMARY KEY"],["name","text"],["next_time","DATETIME"],["seconds_between_updates","int"],["last_updated","DATETIME"]])
    c.execute(server_update_times)
    add_every_5_minute_current_upload_time = make_write_to_db([(["1","every_5_minute_regular",get_time_in_format(),300,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(add_every_5_minute_current_upload_time)
    c.execute("UPDATE database_and_application_version SET database_version = '1.8' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_9():
    """
    Updates the database to version 1.9
    """
    # version adds many more update times
    conn = connect_to_db()
    c = conn.cursor()
    add_daily_update_time = make_write_to_db([(["2","daily",get_time_in_format(),3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(add_daily_update_time)
    add_weekly_update_time = make_write_to_db([(["3","weekly",get_time_in_format(),24*3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(add_weekly_update_time)
    add_monthly_update_time = make_write_to_db([(["4","monthly",get_time_in_format(),7*24*3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(add_monthly_update_time)
    c.execute("UPDATE database_and_application_version SET database_version = '1.9' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_10():
    """
    Updates the database to version 1.10
    """
    # version adds many more update times
    conn = connect_to_db()
    c = conn.cursor()
    add_live_focus_mode_update_time = make_write_to_db([(["5","live_focus_mode",get_time_in_format(),2,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(add_live_focus_mode_update_time)
    c.execute("UPDATE database_and_application_version SET database_version = '1.10' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_11():
    """
    Updates the database to version 1.11
    """
    # add a user to user table
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("INSERT INTO user (id,name) VALUES (?,?)",(2,"live_focus_mode"))
    # c.execute("UPDATE user SET name = 'default',data = ? WHERE id=1",[json.dumps({})])
    c.execute("UPDATE database_and_application_version SET database_version = '1.11' WHERE id=1")
    conn.commit()
    conn.close()
    set_live_focus_mode_data({})

def update_to_database_version_1_12():
    """
    Updates the database to version 1.12
    """
    # add a table for all the workflows while deleting the old workflows table
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("DROP TABLE workflows")

    workflows_table_string = create_table_command("workflows",[["id","INTEGER PRIMARY KEY"],["name","text"],["data","json"]])
    c.execute(workflows_table_string)
    c.execute("INSERT INTO user (id,name,data) VALUES (?,?,?)",(3,"current_workflow",json.dumps({
        "id":1,
    })))
    distractions_and_focus = make_data_from_default_distraction_list()
    distractions_and_focus = add_focus_data_to_list(distractions_and_focus)
    print(distractions_and_focus)
    conn.commit()
    conn.close()
    add_workflow("work",make_workflow_data("work",distractions_and_focus))
    add_workflow("custom",make_workflow_data("custom",{}))
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE database_and_application_version SET database_version = '1.12' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_13():
    """
    Updates the database to version 1.13
    """
    # add a table for all icons
    conn = connect_to_db()
    c = conn.cursor()
    icons_table_string = create_table_command("icons",[["id","INTEGER PRIMARY KEY"],["name","text"],["bundleId","text"],['type','text'],['has_icon','boolean'],["data","json"]])
    c.execute(icons_table_string)
    c.execute("UPDATE database_and_application_version SET database_version = '1.13' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_14():
    """
    Updates the database to version 1.14
    """
    # delete everything in memoized_data
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("DELETE FROM memoized_data")
    c.execute("UPDATE database_and_application_version SET database_version = '1.14' WHERE id=1")
    conn.commit()
    conn.close()

def update_to_database_version_1_15():
    """
    Updates the database to version 1.15
    """
    # add a table for all icons
    conn = connect_to_db()
    c = conn.cursor()
    improvements_table = create_table_command("improvements",[["id","INTEGER PRIMARY KEY"],["name","text"],["data","json"]])
    c.execute(improvements_table)
    insert_improvements_daily = make_write_to_db([(["1","daily",json.dumps({})])],"improvements",["id","name","data"])
    insert_improvements_weekly = make_write_to_db([(["2","weekly",json.dumps({})])],"improvements",["id","name","data"])
    insert_improvements_monthly = make_write_to_db([(["3","monthly",json.dumps({})])],"improvements",["id","name","data"])
    c.execute(insert_improvements_daily)
    c.execute(insert_improvements_weekly)
    c.execute(insert_improvements_monthly)
    insert_server_update_times = make_write_to_db([(["6","improvements_daily",get_time_in_format(),3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(insert_server_update_times)
    insert_server_update_times = make_write_to_db([(["7","improvements_weekly",get_time_in_format(),24*3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(insert_server_update_times)
    insert_server_update_times = make_write_to_db([(["8","improvements_monthly",get_time_in_format(),7*24*3600,get_time_in_format()])],"server_update_times",["id","name","next_time","seconds_between_updates","last_updated"])
    c.execute(insert_server_update_times)
    c.execute("UPDATE database_and_application_version SET database_version = '1.15' WHERE id=1")
    conn.commit()
    conn.close()





def make_data_from_default_distraction_list(current_distractions={}):
    import distracting_apps
    distractions_data = current_distractions
    for app in distracting_apps.distracting_apps.split("\n"):
        distractions_data[app] = {"name":app,"type":'application',"distracting":True,'focused':False,"custom_time_out":0}
    for website in distracting_apps.distracting_sites.split("\n"):
        distractions_data[website] = {"name":website,"type":'website',"distracting":True,'focused':False,"custom_time_out":0}
    return distractions_data

def add_focus_data_to_list(current_application_statuses):
    import focus_sites_and_apps
    app_data = current_application_statuses
    for app in focus_sites_and_apps.General_focus_apps.split("\n"):
        app_data[app] = {"name":app,"type":'app',"distracting":False,'focused':True,"custom_time_out":0}
    for website in focus_sites_and_apps.General_focus_sites.split("\n"):
        app_data[website] = {"name":website,"type":'website',"distracting":False,'focused':True,"custom_time_out":0}
    return app_data



def make_workflow_data(name,distractions_data):
    data = {
        "name":name,
        "applications":distractions_data,
        "modifications":{},
        "distractions":[],
        "focused_apps":[],
    }
    return data

def get_time_in_format():
    return datetime.datetime.now().strftime(get_time_format())

def get_time_in_format_from_datetime(time:datetime.datetime):
    return time.strftime(get_time_format())

def get_time_from_format(time):
    return datetime.datetime.strptime(time,get_time_format())
def get_time_format():
    return "%Y-%m-%d %H:%M:%S"

def get_all_time_logs():
    logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB",retention=5)
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log")
    logger.debug(type(c))
    logger.debug(c)
    data = c.fetchall()
    c.close()
    return data

def get_first_time_log():
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log ORDER BY time ASC LIMIT 1")
    data = c.fetchone()
    c.close()
    return data

def get_all_applications():
    """
    Returns all the applications
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM applications")
    data = c.fetchall()
    conn.close()
    return data


def get_time_logs_from_today_and_yesterday():
    """
    Returns the time logs from today and yesterday
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log WHERE time >= date('now', '-1 days') AND time <  date('now')")
    data = c.fetchall()
    conn.close()
    return data
def get_logs_between_times(start_time,end_time):
    """
    Returns the logs between two times
    """
    # logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB", retention=5)
    conn = connect_to_db()
    c = conn.cursor()
    # c.execute(f"SELECT * FROM log WHERE time BETWEEN convert({full_time_format},{start_time}) AND convert({full_time_format},{end_time})")
    c.execute(f"SELECT * FROM log WHERE time >= '{start_time}' AND time < '{end_time}'")
    # logger.debug(c)
    # logger.debug(type(c))
    data = c.fetchall()
    conn.close()
    return data

def get_time_logs_from_yesterday():
    """
    Returns the time logs from yesterday
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log WHERE time >= date('now', '-1 days') AND time <  date('-0 days')")
    data = c.fetchall()
    conn.close()
    return data
def get_time_logs_from_this_week():
    """
    Returns the time logs from this week
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log WHERE time >= date('now', '-7 days') AND time <  date('now')")
    data = c.fetchall()
    conn.close()
    return data

def get_time_logs_from_last_five_hours():
    """
    Returns the time logs from last five hours
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log WHERE time >= date('now', '-5 hours') AND time <  date('now')")
    data = c.fetchall()
    conn.close()
    return data

def get_time_of_last_mouse_movement():
    """
    Returns the time of the last mouse movement
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT time FROM mouse_moved WHERE UUID=0")
        time_of_last_movement = c.fetchone()
        conn.close()
        return datetime.datetime.strptime(time_of_last_movement[0],get_time_format())
    except Exception as e:
        logger.error(e)
        return datetime.datetime.strptime(datetime.datetime.now()-datetime.timedelta(hours=5),get_time_format())


def set_new_time_in_mouse_moved():
    """
    Sets the time of the last mouse move
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("UPDATE mouse_moved SET time = ? WHERE UUID=0",[get_time_in_format()])
        conn.commit()
        conn.close()
    except Exception as e:
        logger.error(e)
        return None
    
def add_daily_task(name,info):
    """
    Adds a daily task
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        new_daily_task = make_write_to_db([([name,info,get_time_in_format(),True])],"tasks",["task_name","info","day","active"])
        c.execute(new_daily_task)
        id = c.lastrowid
        conn.commit()
        conn.close()
        logger.debug(f"Added daily task with id {id}")
        return id
    except Exception as e:
        logger.error(e)
        return None

def get_all_daily_tasks():
    """
    Returns all the daily tasks
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT * FROM tasks")
        data = c.fetchall()
        conn.close()
        return data
    except Exception as e:
        logger.error(e)
        return None

def get_all_active_daily_tasks():
    """
    Returns all the active daily tasks
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT * FROM tasks WHERE active = 1")
        data = c.fetchall()
        conn.close()
        return data
    except Exception as e:
        logger.error(e)
        return None

def get_all_focus_sessions():
    """
    Returns all the focus sessions
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT * FROM focus_sessions")
        data = c.fetchall()
        conn.close()
        return data
    except Exception as e:
        logger.error(e)
        return None

def get_focus_session_by_id(id):
    """
    Returns a focus session by id
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute("SELECT * FROM focus_sessions WHERE id=?", [id])
        data = c.fetchone()
        conn.close()
        return data
    except Exception as e:
        logger.error(e)
        return None

def log_current_app(app_name,tabname,active,title):
    """
    Logs the current app
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        new_app_log = make_write_to_db([([get_time_in_format(),str(app_name),tabname,active,title])], "log",["time","app","tabname","active","window_title"])
        c.execute(new_app_log)
        conn.commit()
        conn.close()
        return new_app_log
    except Exception as e:
        logger.error(e)
        return None

def add_application_to_db(application_name,type,productivity,custom_time_out,distracting=False,):
    """
    Adds an application to the database
    """
    conn = connect_to_db()
    c = conn.cursor()
    apps = get_all_applications()
    if application_name in [app[1] for app in apps]:
        return False
    new_app_log = make_write_to_db([([str(application_name),type,productivity,distracting,custom_time_out])],"applications",["application_name","type","productivity","distracting","custom_time_out"])
    c.execute(new_app_log)
    conn.commit()
    conn.close()
    return new_app_log

def get_all_apps_statuses():
    """
    Returns all the applications and their statuses
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM applications")
    data = c.fetchall()
    conn.close()
    return data

def save_app_status(application_id,distracting):
    """
    Saves the status of an application
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE applications SET distracting = ? WHERE id = ?",[distracting,application_id])
    conn.commit()
    conn.close()

def start_focus_mode(name,duration,inactive_apps:str,info=""):
    """
    Starts the focus mode
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute(make_write_to_db([([get_time_in_format(),duration,inactive_apps,name,info])],"focus_sessions",["time","stated_duration","inactive_applications","name","info"]))
    conn.commit()
    conn.close()
    return c.lastrowid

def set_task_to_inactive(id):
    """
    Sets a task to inactive
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE tasks SET active = ? WHERE id = ?",[0,id])
    conn.commit()
    conn.close()

def get_task_by_id(task_id):
    """
    Get a task by id
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM tasks WHERE id=?", [task_id])
    data = c.fetchone()
    if data is None:
        return False
    else:
        conn.commit()
        conn.close()
        return data
def update_daily_task_info(task_id,info):
    """
    Updates the daily task data
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE tasks SET info = ? WHERE id = ?",[info,task_id])
    conn.commit()
    conn.close()
def stop_focus_mode(focus_session_id):
    """
    Stops the focus mode
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE focus_sessions SET actual_duration = ? WHERE id = ?",[get_time_in_format(),focus_session_id])
    conn.commit()
    conn.close()

def get_latest_focus_session():
    """
    Gets the latest focus session
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM focus_sessions ORDER BY id DESC LIMIT 1")
    data = c.fetchone()
    conn.close()
    return data

def save_chrome_url(url: str):
    """
    Saves the chrome url
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE current_url SET time = ?, url = ? WHERE id = ?",(get_time_in_format(),url,1))
    conn.commit()
    conn.close()

def get_latest_chrome_url():
    """
    Gets the latest chrome url
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM current_url ORDER BY id DESC LIMIT 1")
    data = c.fetchone()
    conn.close()
    return data

def get_current_user_data():
    """
    Gets the current device id
    """
    conn = connect_to_db()
    c = conn.cursor()
    # just get id 1 in users table
    c.execute("SELECT * FROM user WHERE id=1")
    data = c.fetchone()
    conn.close()
    if data is None:
        return None
    if type(data[2]) == str:
        return json.loads(data[2])
    else:
        return data[2]

def set_current_user_data(data):
    """
    Sets the current device id
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE user SET data = ? WHERE id=1",[json.dumps(data)])
    conn.commit()
    conn.close()

def server_update_required():
    """
    Checks if a server update is required
    """
    conn = connect_to_db()
    c = conn.cursor()
    # select everything where next_time is less than current time
    c.execute("SELECT * FROM server_update_times WHERE next_time <= ?",[get_time_in_format()])
    data = c.fetchall()
    conn.close()
    if data is None:
        return None
    return data

def reset_database(update_id,update_time):
    """
    Resets the database
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE server_update_times SET next_time = ?, last_updated = ? WHERE id = ?",[datetime.datetime.strftime(datetime.datetime.now() + datetime.timedelta(seconds=update_time),get_time_format()),get_time_in_format(),update_id])
    conn.commit()
    conn.close()

def start_updating_live_focus_mode():
    """
    Starts updating the live focus mode
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE server_update_times SET next_time = ?, last_updated = ? WHERE name = ?",[datetime.datetime.strftime(datetime.datetime.now(),get_time_format()),get_time_in_format(),"live_focus_mode"])
    conn.commit()
    conn.close()

def set_live_focus_mode_data(data):
    """
    Sets the live focus mode data
    """
    conn = connect_to_db()
    c = conn.cursor()
    final_data = {"time":get_time_in_format(),"data":data}
    c.execute("UPDATE user SET data = ? WHERE id=2",[json.dumps(final_data)])
    conn.commit()
    conn.close()

def get_live_focus_mode_data():
    """
    Gets the live focus mode data
    """
    conn = connect_to_db()
    c = conn.cursor()
    # just get id 1 in users table
    c.execute("SELECT * FROM user WHERE id=2")
    data = c.fetchone()
    conn.close()
    if data is None:
        return None
    final_data = {}
    if type(data[2]) == str:
        final_data =  json.loads(data[2])
    else:
        final_data =  data[2]
    if get_time_from_format(final_data['time']) < datetime.datetime.now() - datetime.timedelta(seconds=10):
        return None
    return final_data['data']

# Workflow functions
def get_workflows():
    """
    Gets the workflows
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM workflows")
    data = c.fetchall()
    conn.close()
    return data

def get_current_workflow_data():
    """
    Gets the current workflow
    """
    conn = connect_to_db()
    c = conn.cursor()
    # just get id 1 in users table
    c.execute("SELECT * FROM user WHERE id=3")
    data = c.fetchone()
    conn.close()
    if data is None:
        return None
    if type(data[2]) == str:
        return json.loads(data[2]) # this should be in the format of {"id":workflow_id,"last_data":workflow_data}
    else:
        return data[2]

def get_workflow_by_id(id):
    """
    Gets a workflow by id
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM workflows WHERE id = ?",[id])
    data = c.fetchone()
    conn.close()
    return data

def add_workflow(name,data):
    """
    Adds a workflow
    """
    conn = connect_to_db()
    c = conn.cursor()
    data = reload_workflow_data(data)
    c.execute("INSERT INTO workflows (name,data) VALUES (?,?)",(name,json.dumps(data)))
    conn.commit()
    conn.close()

def set_current_workflow_data(data):
    """
    Sets the current workflow
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE user SET data = ? WHERE id=3",[json.dumps(data)])
    conn.commit()
    conn.close()


def reload_workflow_data(data):
    """
    takes the data and creates the distractions and focused apps lists
    """
    distractions = []
    focused_apps = []
    for name,app in data['applications'].items():
        if app['distracting']:
            distractions.append(app['name'])
        if app['focused']:
            focused_apps.append(app['name'])
    for name,app in data['modifications'].items():
        if app['distracting']:
            distractions.append(app['name'])
            if app['name'] in focused_apps:
                focused_apps.remove(app['name'])
        if app['focused']:
            focused_apps.append(app['name'])
            if app['name'] in distractions:
                distractions.remove(app['name'])
    data['distractions'] = distractions
    data['focused_apps'] = focused_apps
    return data

def update_workflow(id,data):
    """
    Updates a workflow
    """
    conn = connect_to_db()
    c = conn.cursor()
    data = reload_workflow_data(data)
    c.execute("UPDATE workflows SET data = ? WHERE id = ?",(json.dumps(data),id))
    conn.commit()
    conn.close()
    if get_current_workflow_data()['id'] == id:
        set_current_workflow_data({"id":id,"data":data})


def check_icon_by_name(name,type):
    """
    Checks if an icon exists by name
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT has_icon FROM icons WHERE name = ? AND type = ?",[name,type])
    data = c.fetchone()
    conn.close()
    if data is None:
        return False
    else:
        return data[0]

def set_icon(name,bundleId,type,icon_data):
    """
    Sets an icon
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("INSERT INTO icons (name,bundleId,type,data,has_icon) VALUES (?,?,?,?,?)",(name,bundleId,type,json.dumps(icon_data),True))
    conn.commit()
    conn.close()

def check_if_website_icon_in_database(website_name):
    """
    Checks if a website icon is in the database
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM icons WHERE name = ? AND type = ?",[website_name,"website"])
    data = c.fetchone()
    conn.close()
    if data is None:
        return False
    else:
        return True

def get_all_applications_and_websites_with_icons():
    """
    Gets all the applications with icons
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM icons WHERE has_icon = ?",[True])
    data = c.fetchall()
    conn.close()
    return data

def get_all_icons_with_paths():
    """
    Gets all the icons with paths
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM icons WHERE has_icon = ?",[True])
    data = c.fetchall()
    conn.close()
    return data

def add_memoized_hour(start_time,end_time,data):
    """
    Adds a memoized hour
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("INSERT INTO memoized_data (start_time,end_time,duration,data) VALUES (?,?,?,?)",(start_time,end_time,60,json.dumps(data)))
    conn.commit()
    conn.close()

def get_memoized_hours_between_times(start_time,end_time):
    """
    Gets the memoized hours between times
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM memoized_data WHERE start_time >= ? AND end_time <= ? AND duration = ?",(start_time,end_time,60))
    data = c.fetchall()
    conn.close()
    return data

def get_all_focus_sessions_for_today():
    """
    Gets all the focus sessions for today
    """
    conn = connect_to_db()
    c = conn.cursor()
    time = datetime.datetime.now()
    time = time.replace(hour=4,minute=0,second=0)
    if datetime.datetime.now() < time:
        time = time - datetime.timedelta(days=1)
    c.execute(f"SELECT * FROM focus_sessions WHERE time >= '{time.strftime(get_time_format())}'")
    # c.execute(f"SELECT * FROM focus_sessions WHERE time  >= strftime('%Y-%m-%d 04:00:00','now')")
    data = c.fetchall()
    conn.close()
    return data

def get_todays_tasks():
    """
    Gets todays tasks
    """
    conn = connect_to_db()
    c = conn.cursor()
    time = datetime.datetime.now()
    time = time.replace(hour=4,minute=0,second=0)
    if datetime.datetime.now() < time:
        time = time - datetime.timedelta(days=1)
    c.execute(f"SELECT * FROM tasks WHERE day >= '{time.strftime(get_time_format())}' AND active = 1")
    data = c.fetchall()
    conn.close()
    return data

def set_improvements_cache(time,data):
    """
    Sets the improvements cache
    """
    conn = connect_to_db()
    c = conn.cursor()
    print(data)
    c.execute("UPDATE improvements SET data = ? WHERE name = ?",[json.dumps(data),time])
    conn.commit()
    conn.close()

def get_improvement_data():
    """
    Gets the improvements cache
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM improvements")
    data = c.fetchall()
    conn.close()
    if data is None:
        return None
    else:
        return [json.loads(d[2]) for d in data]
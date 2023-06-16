
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
    insert_current_url = make_write_to_db([(["1",get_time_in_format(),""])] ,"current_url",["id","time","url"])
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
    c.execute("INSERT INTO user (id,name,data) VALUES (?,?,?)",(1,"default",json.dumps({})))
    # c.execute("UPDATE user SET name = 'default',data = ? WHERE id=1",[json.dumps({})])
    c.execute("UPDATE database_and_application_version SET database_version = '1.7' WHERE id=1")
    conn.commit()
    conn.close()

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

def get_time_in_format():
    return datetime.datetime.now().strftime(get_time_format())

def get_time_from_format(time):
    return datetime.datetime.strptime(time,get_time_format())
def get_time_format():
    return "%Y-%m-%d %H:%M:%S"

def get_all_time_logs():
    logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log")
    logger.debug(type(c))
    logger.debug(c)
    data = c.fetchall()
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
    logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
    conn = connect_to_db()
    c = conn.cursor()
    # c.execute(f"SELECT * FROM log WHERE time BETWEEN convert({full_time_format},{start_time}) AND convert({full_time_format},{end_time})")
    c.execute(f"SELECT * FROM log WHERE time >= '{start_time}' AND time < '{end_time}'")
    logger.debug(c)
    logger.debug(type(c))
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
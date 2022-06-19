
from typing import Type
from dbs_scripts.write_and_read_to_database import make_write_to_db
from dbs_scripts.create_database import *
import sqlite3
import datetime
import constants
from loguru import logger
full_time_format = '%m/%d/%y:%H:%M:%S'
DATABASE_PATH = constants.DATABASE_LOCATION + "/" + constants.DATABASE_NAME
DATABASE_VERSION = "1.0"
def connect_to_db():
    """
    Connects to the database
    """
    conn = sqlite3.connect(DATABASE_PATH)
    return conn
def check_if_database_created():
    """
    Checks if the database is already created
    """
    try:
        conn = connect_to_db()
        c = conn.cursor()
        c.execute('SELECT * FROM log')
    except sqlite3.OperationalError:
        return False
    return True

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
        logger.debug(conn.commit())
        conn.close()
        return True
    else:
        return False

def get_time_in_format():
    return datetime.datetime.now().strftime(get_time_format())

def get_time_format():
    return "%Y-%m-%d %H:%M:%S"

def get_all_time_logs():
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT * FROM log")
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
    conn = connect_to_db()
    c = conn.cursor()
    print(f"SELECT * FROM log WHERE time >= '{start_time}' AND time < '{end_time}'")
    # c.execute(f"SELECT * FROM log WHERE time BETWEEN convert({full_time_format},{start_time}) AND convert({full_time_format},{end_time})")
    c.execute(f"SELECT * FROM log WHERE time >= '{start_time}' AND time < '{end_time}'")
    data = c.fetchall()
    print(data)
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
def get_time_of_last_mouse_movement():
    """
    Returns the time of the last mouse movement
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("SELECT time FROM mouse_moved WHERE UUID=0")
    time_of_last_movement = c.fetchone()
    conn.close()
    return datetime.datetime.strptime(time_of_last_movement[0],get_time_format())

def set_new_time_in_mouse_moved():
    """
    Sets the time of the last mouse move
    """
    conn = connect_to_db()
    c = conn.cursor()
    c.execute("UPDATE mouse_moved SET time = ? WHERE UUID=0",[get_time_in_format()])
    conn.commit()
    conn.close()



def log_current_app(app_name,tabname,active):
    """
    Logs the current app
    """
    conn = connect_to_db()
    c = conn.cursor()
    new_app_log = make_write_to_db([([get_time_in_format(),str(app_name),tabname,active])], "log",["time","app","tabname","active"])
    c.execute(new_app_log)
    conn.commit()
    conn.close()
    return new_app_log

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

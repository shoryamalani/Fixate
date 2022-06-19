import turtle
import constants
import os
from database_worker import check_if_database_created, create_time_database, set_new_time_in_mouse_moved
import multiprocessing
from time import sleep
from AppKit import *
from Cocoa import *
from Foundation import *
from PyObjCTools import AppHelper
import string
import sys
from Foundation import NSObject, NSLog
from AppKit import NSApplication, NSApp, NSWorkspace
from Cocoa import *
from Quartz import CGWindowListCopyWindowInfo, kCGWindowListOptionOnScreenOnly, kCGNullWindowID
from PyObjCTools import AppHelper
import database_worker
import datetime
import subprocess
from pebble import concurrent
from concurrent.futures import TimeoutError
from loguru import logger
import requests
import re



# import web_app_stuff.app as web_app
BROWSERS = ["Safari","Google Chrome","Firefox"]
INACTIVE_TIME = 300 # in seconds
# NONFOCUS_APPS = ["Messages","Discord","Slack","Music"]
# NONFOCUS_URLS = ["https://www.youtube.com/watch?v=","macrumors.","lichess.org","9to5mac.",".reddit."]
PROCESSES = {}

def get_all_apps():
    return NSWorkspace.sharedWorkspace().runningApplications() 
def get_frontmost_app():
    return NSWorkspace.sharedWorkspace().activeApplication()

def get_app_in_one_second():
    sleep(1)
    return get_frontmost_app()

def close_app_with_bundle_id(bundle_id):
    ws = NSWorkspace.sharedWorkspace()
    runningApps = ws.runningApplications()    
    for i in runningApps:
        if i.bundleIdentifier() == bundle_id:
            logger.debug("Closing app")
            logger.debug(i)
            i.hide()

def getKMVar(k):
    return subprocess.check_output(
        "osascript -l JavaScript -e '{0}'".format(
            """Application("Keyboard Maestro Engine")
               .getvariable("{0}")""".format(
                k
            )
        ),
        shell=True,
    ).decode("utf-8")
def make_url_to_base(full_url):
    return re.sub(r'(http(s)?:\/\/)|(\/.*){1}', '', full_url)
def check_if_must_be_closed(frontmost_app,tabname):
    try:
        closing_app = requests.get("http://localhost:5005/check_closing_apps").json()
        will_close = closing_app["closing_apps"]
        apps_to_close = closing_app["apps_to_close"]
        logger.debug(closing_app)
    except:
        will_close = False

    if will_close == True:
        logger.debug(frontmost_app["NSApplicationName"])
        if frontmost_app["NSApplicationName"] in apps_to_close:
            close_app_with_bundle_id(frontmost_app["NSApplicationBundleIdentifier"])
        if tabname != None:
            for url in apps_to_close:
                if url in tabname:
                    close_app_with_bundle_id(frontmost_app["NSApplicationBundleIdentifier"])
        
        

def search_close_and_log_apps():
    logger.add(f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log",backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="300MB")
    last_app = ""
    apps = database_worker.get_all_applications()
    apps_in_name_form = [app[1] for app in apps]
    while True:
        front_app = get_frontmost_app()
        # logger.debug(front_app)
        if front_app != None:
            
            current_app_name = front_app["NSApplicationName"]
            tabname = None
            active = True
            if current_app_name in BROWSERS:
                
                try:
                    future = browser_tab_name(current_app_name)
                    tabname = future.result()
                    # tabname = browser_tab_name(current_app_name)
                    logger.debug(tabname)
                    short_tab = make_url_to_base(tabname)
                    if short_tab not in apps_in_name_form:
                        logger.debug(database_worker.add_application_to_db(short_tab,"website",0,0))
                        apps_in_name_form.append(short_tab)
                except Exception as err:
                    logger.debug(err)
                    tabname = None
                    logger.debug("not found")
            else:
                if current_app_name not in apps_in_name_form:
                    logger.debug(database_worker.add_application_to_db(current_app_name,"app",0,0))
                    apps_in_name_form.append(current_app_name)

            check_if_must_be_closed(front_app,tabname)
            last_mouse_movement = database_worker.get_time_of_last_mouse_movement()
            if datetime.datetime.now()- last_mouse_movement  > datetime.timedelta(seconds=INACTIVE_TIME):
                active = False
            database_worker.log_current_app(current_app_name,tabname,active)
            # logger.debug(current_app_name)
            sleep(1)
            # logger.debug(database_worker.get_time_of_last_mouse_movement())
@concurrent.process(timeout=5)
def browser_tab_name(browser_name):
    data = None
    if browser_name == "Google Chrome":
        browser_tab_name = NSAppleScript.alloc().initWithSource_(
        str(f"""
        tell application "{browser_name}"
            get URL of active tab of first window
        end tell
        """))
        data = browser_tab_name.executeAndReturnError_(None)[0]
    if browser_name == "Safari":
        browser_tab_name = NSAppleScript.alloc().initWithSource_(
        str(f"""
        tell application "{browser_name}"
            get URL of current tab of window 1
        end tell
        """))
        data = browser_tab_name.executeAndReturnError_(None)[0]
    if browser_name == "Firefox":
        browser_tab_name = NSAppleScript.alloc().initWithSource_(
        str(f"""
        tell application "{browser_name}"
	        get the name of first window
        end tell
        """))
        data = browser_tab_name.executeAndReturnError_(None)[0]
    if data != None:
        return str(data.stringValue())
    else:
        return None
def start_running_event_loop_in_ns_application():
    # if NSWorkspace.sharedWorkspace().isRunning():
    #     return
    # else:
    #    return 
    # NSWorkspace.sharedWorkspace().run()
    pass

last_mouse_move_set = datetime.datetime.now()

class AppDelegate(NSObject):

    def applicationDidFinishLaunching_(self, aNotification):
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSKeyDown, AppDelegate.handler)
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSMouseMovedMask, AppDelegate.handler)
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSKeyUp, AppDelegate.handler)
        NSEvent.addLocalMonitorForEventsMatchingMask_handler_(NSKeyDown, AppDelegate.handler)

        logger.debug("HERE")
    def cancel(self):
        AppHelper.stopEventLoop()
    
    def handler(event):
        try:
            global last_mouse_move_set
            # logger.debug(event.type())
            # logger.debug("last_mouse_move:",last_mouse_move_set.strftime("%D:%H:%M:%S"))
            
            if event.type() == 1 or event.type() == 3 or event.type() == 5:
                if datetime.datetime.now() - last_mouse_move_set > datetime.timedelta(seconds=30):
                    database_worker.set_new_time_in_mouse_moved()
                    last_mouse_move_set = datetime.datetime.now()
        except ( KeyboardInterrupt ) as e:
            print ('handler', e)
            AppHelper.stopEventLoop()
def start_mouse_movement_checker():
    
        app = NSApplication.sharedApplication()
        delegate = AppDelegate.alloc().init()
        NSApp().setDelegate_(delegate)
        AppHelper.runEventLoop()

def boot_up_checker():
    logger.add(f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log",backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="300MB")
    try:
        if not os.path.exists(constants.DATABASE_LOCATION):
            os.mkdir(constants.DATABASE_LOCATION)
        elif not os.path.exists(constants.DATABASE_LOCATION + "/"+constants.DATABASE_NAME):   
            create_time_database()

        if not check_if_database_created():
            time_table = create_time_database() 
            if not time_table:
                logger.debug("database failed")
                sys.exit()
        # start_running_event_loop_in_ns_application()
        # start_mouse_movement_checker()
        mouse_movement = multiprocessing.Process(target=start_mouse_movement_checker).start()
        # PROCESSES["mouse_movement"] = mouse_movement
        # PROCESSES["mouse_movement"].start()
        multiprocessing.Process(target=search_close_and_log_apps).start()
        global CLOSING_APPS
        CLOSING_APPS = True
        # search_close_and_log_apps = multiprocessing.Process(target=search_close_and_log_apps).start()
        # PROCESSES["search_close_and_log_apps"] = search_close_and_log_apps
        # multiprocessing.Process(target=web_app.start_app).start()
        
    except Exception as e:
        return e
    return True
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
    logger.debug(parsed_apps)
    return parsed_apps
def save_app_status(applications):
    logger.debug(applications)
    for key,value in applications.items():
        database_worker.save_app_status(key,value)
    return True
if __name__ == "__main__":
    boot_up_checker()
    
    
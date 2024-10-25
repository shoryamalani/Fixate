from mimetypes import init
import macos_get_window_and_tab_name
from time import sleep
import subprocess
from AppKit import NSApplication,NSApp,NSWorkspace,NSRunningApplication
from loguru import logger
from PyObjCTools import AppHelper
import os
import multiprocessing
from AppKit import NSAlert, NSAlertFirstButtonReturn, NSWorkspace, NSURL,NSEvent, NSMouseMovedMask, NSKeyDownMask
from Foundation import NSObject

import datetime
import database_worker
import constants
from PIL import Image
from io import BytesIO
import io
import base64

logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {file} | {function} | {line} | {level} | {message}",rotation="5MB", retention=5)

last_mouse_move_set = datetime.datetime.now()


class AppDelegate(NSObject):

    def applicationDidFinishLaunching_(self, aNotification):
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSKeyDownMask, AppDelegate.handler)
        NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSMouseMovedMask, AppDelegate.handler)
        # NSEvent.addGlobalMonitorForEventsMatchingMask_handler_(NSKeyUp, AppDelegate.handler)
        # NSEvent.addLocalMonitorForEventsMatchingMask_handler_(NSKeyDown, AppDelegate.handler)

        logger.debug("Started the app delegate")
    def cancel(self):
        AppHelper.stopEventLoop()
    
    def handler(event):
        try:
            global last_mouse_move_set
            # logger.debug(event.type())
            # logger.debug("last_mouse_move:",last_mouse_move_set.strftime("%D:%H:%M:%S"))
            # print(event.type())
            if event.type() == 1 or event.type() == 3 or event.type() == 5 or event.type() == 10:
                if datetime.datetime.now() - last_mouse_move_set > datetime.timedelta(seconds=30):
                    database_worker.set_new_time_in_mouse_moved()
                    last_mouse_move_set = datetime.datetime.now()
        except ( KeyboardInterrupt ) as e:
            print ('handler', e)
            AppHelper.stopEventLoop()

class macosOperatingSystemDataGrabber:
    
    def __init__(self):
        self.current_app = get_frontmost_app()
    
    def check_interaction_periodic(self):
        start_process_to_deal_with_permissions()
        keyboard_checker = multiprocessing.Process(target=start_mouse_and_keyboard_checker).start()
        # keyboard_checker.daemon = True

    def get_current_frontmost_app(self):
        self.current_app = get_frontmost_app()
        # get app icon
        # self.icon_path = self.get_icon_path(self.current_app["NSApplicationBundleIdentifier"])
        print(self.current_app)
        more_data = macos_get_window_and_tab_name.getInfo()
        if more_data:
            if 'url' in more_data:
                return {"app_name":more_data["app"],"app_title":more_data['title'] if 'title' in more_data else "Unknown","url":more_data['url']}
            return {"app_name":more_data["app"],"app_title":more_data['title'] if 'title' in more_data else "Unknown"}
        return {"app_name":self.current_app["NSApplicationName"],"app_title":"Unknown"}
    def get_icon_path(self)->Image:
        # get app icon
        app = NSWorkspace.sharedWorkspace().runningApplications()
        file = None
        for i in app:
            if i.bundleIdentifier() == self.current_app["NSApplicationBundleIdentifier"]:
                file = i.icon().TIFFRepresentation().base64EncodedStringWithOptions_(0)
        if file:
            # compressed image
            image_ = Image.open(io.BytesIO(base64.decodebytes(bytes(file,'utf-8'))))
            # use image_.save(path) to save the image
            return image_
        return None

            
        
    def hide_current_frontmost_app(self):
        return close_app_with_bundle_id(self.current_app["NSApplicationBundleIdentifier"])

        
def start_mouse_and_keyboard_checker():
    app = NSApplication.sharedApplication()
    delegate = AppDelegate.alloc().init()
    NSApp().setDelegate_(delegate)
    AppHelper.runEventLoop()
    
    def get_current_window():
        get_frontmost_app()
# these are functions that may no longer be needed
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
            return True



# Macos permissions stuff


## MACOS PERMISSIONS
def start_process_to_deal_with_permissions():
    get_permission = multiprocessing.Process(target=get_permission_to_accessibility)
    get_permission.start()
    return 

def get_permission_to_accessibility():
    ## THIS IS USING THE SAME PERMISSION GRABBER AS ACTIVITY WATCH
    # no point recreating it
    #https://github.com/ActivityWatch/aw-watcher-window/tree/235ebea7d9e6cd9ec96e943b0d2cdb17e7c2e398
    
    from ApplicationServices import AXIsProcessTrusted
    sleep(5)
    accessibility_permissions = AXIsProcessTrusted()
    if not accessibility_permissions:
        title = "Missing accessibility permissions"
        info = "For Fixate to get the name of windows and tabs we need accessibility permissions. \n If you've already given permission before and yet you are still seeing this try removing and re-adding Fixate in System Preferences"

        alert = NSAlert.new()
        alert.setMessageText_(title)
        alert.setInformativeText_(info)

        ok_button = alert.addButtonWithTitle_("Open accessibility settings")

        alert.addButtonWithTitle_("Close")
        choice = alert.runModal()
        if choice == NSAlertFirstButtonReturn:
            NSWorkspace.sharedWorkspace().openURL_(
                NSURL.URLWithString_(
                    "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility"
                )
            )
    

# old code to grab tabs that is no longer used
        
# @concurrent.process(timeout=5)
# def browser_tab_name(browser_name):
#     logger.add(f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log",backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
#     data = None
#     if browser_name == "Google Chrome":
#         browser_tab_name = NSAppleScript.alloc().initWithSource_(
#         str(f"""
#         tell application "{browser_name}"
#             get URL of active tab of first window
#         end tell
#         """))
#         data = browser_tab_name.executeAndReturnError_(None)
#     if browser_name == "Safari":
#         browser_tab_name = NSAppleScript.alloc().initWithSource_(
#         str(f"""
#         tell application "{browser_name}"
#             get URL of current tab of window 1
#         end tell
#         """))
#         data = browser_tab_name.executeAndReturnError_(None)
#     if browser_name == "Firefox":
#         browser_tab_name = NSAppleScript.alloc().initWithSource_(
#         str(f"""
#         tell application "{browser_name}"
# 	        get the name of first window
#         end tell
#         """))
#         data = browser_tab_name.executeAndReturnError_(None)
#     if not data[0]:
#         logger.debug(data[1]['NSAppleScriptErrorMessage'])
#         logger.debug(data[1])
#     logger.debug(data)
#     if data[0] != None:
#         # logger.debug(data)
#         return str(data[0].stringValue())
#     else:
#         return None

# def start_running_event_loop_in_ns_application():
#     # if NSWorkspace.sharedWorkspace().isRunning():
#     #     return
#     # else:
#     #    return 
#     # NSWorkspace.sharedWorkspace().run()
#     pass
# def getKMVar(k):
#     return subprocess.check_output(
#         "osascript -l JavaScript -e '{0}'".format(
#             """Application("Keyboard Maestro Engine")
#                .getvariable("{0}")""".format(
#                 k
#             )
#         ),
#         shell=True,
#     ).decode("utf-8")

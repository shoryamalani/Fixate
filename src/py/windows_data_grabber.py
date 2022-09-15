import win32gui
import win32con
import win32api
import win32process
import multiprocessing
from time import sleep
import database_worker
import psutil
#https://stackoverflow.com/questions/25466795/how-to-minimize-a-specific-window-in-python
#https://stackoverflow.com/questions/10266281/obtain-active-window-using-python

class windowsOperatingSystemDataGrabber:
    def __init__(self):
        self.current_app = win32gui.GetForegroundWindow()
        
    
    def check_interaction_periodic(self):
        
        multiprocessing.Process(target=start_mouse_and_keyboard_checker).start()

    def get_current_frontmost_app(self):
        self.current_app = win32gui.GetForegroundWindow()
        self.title = win32gui.GetWindowText(self.current_app)
        pid = win32process.GetWindowThreadProcessId(self.current_app) 
        self.app_name = psutil.Process(pid[-1]).name()
        # more_data = macos_get_window_and_tab_name.getInfo()
        #FIGURE OUT HOW TO GET TAB DATA
        # if more_data:
        #     if 'url' in more_data:
        #         return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown","url":more_data['url']}
        #     return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown"}
        return {"app_name":self.app_name,"app_title":self.title}
    
    def hide_current_frontmost_app(self):
        return win32gui.ShowWindow(self.current_app,win32con.SW_MINIMIZE)

def start_mouse_and_keyboard_checker():
    multiprocessing.Process(target=check_periodic).start()

def check_periodic():
    saved_curpos = win32gui.GetCursorPos()
    while True:
        curpos = win32gui.GetCursorPos()
        if curpos != saved_curpos:
            saved_curpos = curpos
            database_worker.set_new_time_in_mouse_moved()
        sleep(30)
import win32gui
import win32con
import win32api
import win32process
import multiprocessing
from time import sleep
import database_worker
import psutil
import uiautomation as auto
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
        if 'Chrome' in self.app_name:
            browser = BrowserWindow('Google Chrome')
            self.url = browser.current_tab_url
        # more_data = macos_get_window_and_tab_name.getInfo()
        #FIGURE OUT HOW TO GET TAB DATA
        # if more_data:
        #     if 'url' in more_data:
        #         return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown","url":more_data['url']}
        #     return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown"}
        return {"app_name":self.app_name,"app_title":self.title,"url":self.url}
    
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




class BrowserWindow:
    def __init__(self, browser_name, window_index=1):
        """
        A Browser Window support UIAutomation.

        :param browser_name: Browser name, support 'Google Chrome', 'Firefox', 'Edge', 'Opera', etc.
        :param window_index: Count from back to front, default value 1 represents the most recently created window.
        """
        if browser_name == 'Firefox':
            addr_bar = auto.Control(Depth=1, ClassName='MozillaWindowClass', foundIndex=window_index) \
                .ToolBarControl(AutomationId='nav-bar').ComboBoxControl(Depth=1, foundIndex=1) \
                .EditControl(Depth=1, foundIndex=1)
        else:
            win = auto.Control(Depth=1, ClassName='Chrome_WidgetWin_1', SubName=browser_name, foundIndex=window_index)
            win_pane = win.PaneControl(Depth=1, Compare=lambda control, _depth: control.Name != '')
            if browser_name == 'Edge':
                addr_pane = win_pane.PaneControl(Depth=1, foundIndex=1).PaneControl(Depth=1, foundIndex=2) \
                    .PaneControl(Depth=1, foundIndex=1).ToolBarControl(Depth=1, foundIndex=1)
            elif browser_name == 'Opera':
                addr_pane = win_pane.GroupControl(Depth=1, foundIndex=1).PaneControl(Depth=1, foundIndex=1) \
                    .PaneControl(Depth=1, foundIndex=2).GroupControl(Depth=1, foundIndex=1) \
                    .GroupControl(Depth=1, foundIndex=1).ToolBarControl(Depth=1, foundIndex=1) \
                    .EditControl(Depth=1, foundIndex=1)
            else:
                addr_pane = win_pane.PaneControl(Depth=1, foundIndex=2).PaneControl(Depth=1, foundIndex=1) \
                    .PaneControl(Depth=1, Compare=lambda control, _depth:
                control.GetFirstChildControl() and control.GetFirstChildControl().ControlTypeName == 'ButtonControl')
            addr_bar = addr_pane.GroupControl(Depth=1, foundIndex=1).EditControl(Depth=1)
        assert addr_bar is not None
        self.addr_bar = addr_bar

    @property
    def current_tab_url(self):
        """Get current tab url."""
        return self.addr_bar.GetValuePattern().Value

    @current_tab_url.setter
    def current_tab_url(self, value: str):
        """Set current tab url."""
        self.addr_bar.GetValuePattern().SetValue(value)




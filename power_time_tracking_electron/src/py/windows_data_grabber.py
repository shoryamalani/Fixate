import sys
import os
import win32gui
import win32con
import win32api
import win32ui
import win32process
import multiprocessing
from time import sleep
import database_worker
import psutil
import uiautomation as auto
import datetime
import re
from PIL import Image
import constants

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
        self.app_name = self.getFileDescription(psutil.Process(pid[-1]).exe())
        print(psutil.Process(pid[-1]).exe().split("\\")[-1])
        if self.title.lower() == "c:\windows\system32\cmd.exe":
            self.app_name = "Command Prompt"
        if self.app_name == "unknown":
            windows_exe = psutil.Process(pid[-1]).exe().split("\\")[-1][:-4]
            if windows_exe != windows_exe.lower():
                self.app_name = " ".join(re.findall("([A-Z][^A-Z]*)", windows_exe))
            else:
                self.app_name = windows_exe.capitalize()
            
        self.url = ""
        
        print("Current app:", self.current_app, "Title:", self.title, "PID:", pid, "App name:", self.app_name, "URL:", self.url)
        if self.app_name is None:
            return {"app_name":"Unknown","app_title":"","url":""} 
        if 'Chrome' in self.app_name or 'Edge' in self.app_name or 'Opera' in self.app_name or 'Brave' in self.app_name:
            data = database_worker.get_latest_chrome_url()
            if data:
                if datetime.datetime.now() - database_worker.get_time_from_format(data[1]) < datetime.timedelta(seconds=3):
                    self.url = data[2]
        # more_data = macos_get_window_and_tab_name.getInfo()
        #FIGURE OUT HOW TO GET TAB DATA
        # if more_data:
        #     if 'url' in more_data:
        #         return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown","url":more_data['url']}
        #     return {"app_name":self.current_app["NSApplicationName"],"app_title":more_data['title'] if more_data else "Unknown"}
        return {"app_name":self.app_name,"app_title":self.title,"url":self.url} 
    
    def hide_current_frontmost_app(self):
        return win32gui.ShowWindow(self.current_app,win32con.SW_MINIMIZE)
    
    def getFileDescription(self, windows_exe):
        try:
            language, codepage = win32api.GetFileVersionInfo(windows_exe, '\\VarFileInfo\\Translation')[0]
            print(language, codepage)
            stringFileInfo = u'\\StringFileInfo\\%04X%04X\\%s' % (language, codepage, "FileDescription")
            description = win32api.GetFileVersionInfo(windows_exe, stringFileInfo)
        except Exception as e:
            print("This is the big bad error mate:", e)
            description = "unknown"
            
        return description
    
    def get_icon_path(self)->Image:
        pid = win32process.GetWindowThreadProcessId(self.current_app)
        app_path = psutil.Process(pid[-1]).exe()
        print("icon",app_path)

        ico_x = win32api.GetSystemMetrics(win32con.SM_CXICON)

        large, small = win32gui.ExtractIconEx(app_path,0)
        win32gui.DestroyIcon(small[0])

        hdc = win32ui.CreateDCFromHandle( win32gui.GetDC(0) )
        hbmp = win32ui.CreateBitmap()
        hbmp.CreateCompatibleBitmap(hdc, ico_x, ico_x)
        hdc = hdc.CreateCompatibleDC()

        hdc.SelectObject( hbmp )
        hdc.DrawIcon( (0,0), large[0] )
        win32gui.DestroyIcon(large[0])

        
        hbmp.SaveBitmapFile( hdc, constants.ICON_LOCATION + "\Icontemp.bmp")

        im = Image.open(constants.ICON_LOCATION + "\Icontemp.bmp")

        return im
        

def start_mouse_and_keyboard_checker():
    multiprocessing.Process(target=check_periodic).start()

def check_periodic():
    def pythonFolder(folder: str) -> str:
        return os.path.expandvars(r"%LocalAppData%\Fixate\app-0.9.11\resources\python") + "\\" + folder
    sys.path = ['', os.path.expandvars(r"%LocalAppData%\Fixate\app-0.9.11\resources\python"), pythonFolder(r"Lib\site-packages"), pythonFolder(r"python39.zip"), pythonFolder(r"DLLs"), pythonFolder(r"Lib"), pythonFolder(r"Lib\site-packages\win32"), pythonFolder(r"Lib\site-packages\win32\lib"), pythonFolder(r"Lib\site-packages\Pythonwin"), os.path.expandvars(r"%LocalAppData%\Fixate\app-0.9.11\resources\py")]
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




import win32api
win32api.OutputDebugString("This is a debug message.")
try:
    import win32serviceutil
    import win32service
    import win32event
    import servicemanager
    import socket
    import os
    import sys
    from flask import Flask,jsonify,request
    from flask_cors import CORS, cross_origin
    import application as logger_application
    import get_time_spent
    import time
    import signal
    import json
    # from loguru import logger
    from datetime import datetime
    import ppt_api_worker
    import constants
    import ppt_api_worker
    from waitress import serve

    app = Flask(__name__)
    CORS(app)
    app.config['CORS_HEADERS'] = 'Content-Type'
    closing_apps = False
    logger_application.boot_up_checker()
    current_notifications = []
    VERSION = "0.9.6"
    # logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")

    @app.route("/start_logger")
    def start_logger():
        if logger_application.boot_up_checker():
            return jsonify(success=True)

    @app.route("/stop_logger")
    def stop_logger():    
        if logger_application.stop_logger() == True:
            return jsonify(success=True)
    @app.route("/toggle_closing_apps")
    def toggle_closing_apps():
        global closing_apps
        closing_apps = not closing_apps
        return jsonify(success=True)
    @app.route("/check_closing_apps")
    def check_closing_apps():
        if logger_application.is_running_logger() == True:
            
            return jsonify({"closing_apps":closing_apps or logger_application.FOCUS_MODE,"apps_to_close":logger_application.get_all_distracting_apps()})
        else:
            return jsonify({"closing_apps":False,"apps_to_close":[]})

    @app.route("/logger_status")
    def logger_status():
        # resp = Flask.make_response({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger()})
        # resp.headers["Access-Control-Allow-Origin"] = "*"
        # return resp
        in_focus_mode = logger_application.get_focus_mode_status()

        return jsonify({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger(),"in_focus_mode":in_focus_mode})
    @app.route("/is_running")
    def is_running():
        return jsonify({"success":True})

    @app.route("/add_current_notification",methods=["POST"])
    def add_current_notification():
        notification = request.json["notification"]
        current_notifications.append(notification)
        return jsonify(success=True)

    @app.route("/remove_current_notification",methods=["POST"])
    def remove_current_notification():
        notification = request.json["notification"]
        current_notifications.pop(0)
        return jsonify(success=True)
    @app.route("/notification_check")
    def notification_check():
        return jsonify({"notifications":current_notifications})
    @app.route("/get_all_time")
    def get_all_time():
        return jsonify({"all_time":get_time_spent.get_all_time()})

    @app.route('/get_specific_time_log',methods=["GET","POST"])
    def get_specific_time_log():
        start_time = request.json["start_time"]
        print(start_time)
        # Wed May 10 2023 00:00:00

        # &a %b %d %Y %H:%M:%S
        start_time = datetime.strptime(start_time, '%a %b %d %Y %H:%M:%S') # 
        end_time = request.json["end_time"]
        print(end_time)
        end_time = datetime.strptime(end_time, '%a %b %d %Y %H:%M:%S')
        times,distractions = get_time_spent.get_specific_time(start_time,end_time)
        return jsonify({"time":times,"distractions":distractions})

    @app.route("/get_time_log",methods=["GET","POST"])
    def get_time():
        if request.json["time"]:
            times,distractions,name = get_time_spent.get_time(request.json["time"])
            return jsonify({"time":times,"distractions":distractions,"name":name, "relevant_distractions":get_time_spent.get_all_distracting_apps()})
        else:
            times,distractions,name,distractions_status = get_time_spent.get_time_from_focus_session_id(request.json["id"])
            return jsonify({"time":times,"distractions":distractions_status,"name":name,"relevant_distractions":json.loads(distractions)})

    @app.route("/get_app_status")
    def get_app_status():
        return jsonify({"applications":logger_application.get_all_apps_statuses()})

    @app.route("/save_app_status",methods=["GET","POST"])
    def save_app_status():
        return jsonify({"success":logger_application.save_app_status(request.json["applications"])})

    @app.route("/get_version")
    def get_version():
        return jsonify({"version":VERSION})

    @app.route('/kill_server', methods=['GET'])
    def kill_server():
        logger_application.stop_logger()
        os.kill(os.getpid(), signal.SIGTERM)

    @app.route('/stop_showing_task', methods=['POST'])
    def stop_showing_task():
        return jsonify({"success":logger_application.stop_showing_task(request.json["id"])})
    @app.route('/complete_task', methods=['POST'])
    def complete_task():
        return jsonify({"success":logger_application.complete_task(request.json["id"])})
        
    @app.route('/start_focus_mode', methods=['GET','POST'])
    def start_focus_mode():
        if closing_apps == False:
            toggle_closing_apps()
        if request.json["task_id"]!=None:
            return jsonify({"id":logger_application.start_focus_mode_with_task(request.json["duration"],request.json["name"],request.json["task_id"])}),200
        return jsonify({"id":logger_application.start_focus_mode(request.json["duration"],request.json["name"])})

    @app.route("/stop_focus_mode",methods=["GET","POST"])
    def stop_focus_mode():
        return jsonify({"success":logger_application.stop_focus_mode(request.json["id"])})

    @app.route("/add_daily_task",methods=["POST"])
    def add_daily_task():
        return jsonify({"success":logger_application.add_daily_task(request.json["name"],request.json["task_estimate_time"],request.json["task_repeating"])})

    @app.route("/get_daily_tasks",methods=["GET"])
    def get_daily_tasks():
        return jsonify({"tasks":logger_application.get_daily_tasks()})

    @app.route("/get_all_focus_sessions",methods=["GET"])
    def get_all_focus_modes():
        return jsonify({"focus_sessions":logger_application.get_all_focus_sessions()})

    @app.route("/get_current_user",methods=["GET"])
    def get_current_user():
        return jsonify({"user":logger_application.get_current_user()})

    @app.route('/set_display_name', methods=['POST'])
    def set_display_name():
        print(request.json["display_name"])
        return jsonify({"success":ppt_api_worker.set_display_name(request.json["display_name"])})

    @app.route('/create_user', methods=['POST'])
    def create_user():
        print(logger_application.get_current_user())
        ppt_api_worker.create_user(request.json["name"],request.json["privacy_level"],logger_application.get_current_user()['device_id'])
        print(request.json["name"],request.json["privacy_level"],logger_application.get_current_user()['device_id'])
        return jsonify({"user":logger_application.get_current_user()})

    @app.route('/set_privacy', methods=['POST'])
    def change_privacy():
        try:
            
            return jsonify({"user":ppt_api_worker.change_privacy(request.json["privacy_level"])})
        except:
            return "error",500

    @app.route('/add_friend', methods=['POST'])
    def add_friend():
        try:
        
            return jsonify({"user": ppt_api_worker.add_friend(request.json["friend_name"],request.json['friend_share_code'])})
        except Exception as e:
            print(e)
            return "error",500

    @app.route('/get_friends', methods=['GET'])
    def get_friends():
        try:
            return jsonify({"friends":ppt_api_worker.get_friends()})
        except:
            return "error",500

    @app.route('/get_friend_data_now', methods=['GET'])
    def get_friend_data_now():
        try:
            ppt_api_worker.getFriendData(True)
            return jsonify({"user":logger_application.get_current_user()})
        except:
            return "error",500

    @app.route("/dump_chrome_data",methods=["POST"])
    @cross_origin()
    def dump_chrome_url():
        print(request.json)
        logger_application.save_chrome_url(request.json["url"])
        return "Success", 200

    @app.route("/get_leaderboard_data",methods=["GET"])
    def get_leaderboard_data():
        return jsonify({"leaderboard":ppt_api_worker.get_leaderboard_data()})

    class FlaskAppSvc (win32serviceutil.ServiceFramework):
        _svc_name_ = 'FlaskAppService'
        _svc_display_name_ = 'Flask App Service'

        def __init__(self,args):
            win32serviceutil.ServiceFramework.__init__(self,args)
            self.hWaitStop = win32event.CreateEvent(None,0,0,None)
            socket.setdefaulttimeout(60)
            self.is_alive = True

        def SvcStop(self):
            self.ReportServiceStatus(win32service.SERVICE_STOP_PENDING)
            win32event.SetEvent(self.hWaitStop)
            self.is_alive = False

        def SvcDoRun(self):
            servicemanager.LogMsg(servicemanager.EVENTLOG_INFORMATION_TYPE,
                                servicemanager.PYS_SERVICE_STARTED,
                                (self._svc_name_,''))
            self.main()

        def main(self):
            serve(app, host="127.0.0.1", port=5005)

    if __name__ == '__main__':
        if len(sys.argv) == 1:
            servicemanager.Initialize()
            servicemanager.PrepareToHostSingle(FlaskAppSvc)
            try:
                servicemanager.StartServiceCtrlDispatcher()
            except win32service.error as details:
                if details[0] == winerror.ERROR_FAILED_SERVICE_CONTROLLER_CONNECT:
                    win32serviceutil.usage()
        else:
            win32serviceutil.HandleCommandLine(FlaskAppSvc)
except Exception as e:
    win32api.OutputDebugString(str(e))
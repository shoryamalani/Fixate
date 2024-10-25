#!/Applications/Fixate.app/Contents/Resources/python/bin/FixateLogger
VERSION = "1.9.20"
import sys
import os
if sys.platform == "win32":
    def pythonFolder(folder: str) -> str:
        return os.path.expandvars(r"%LocalAppData%\Fixate\app-1.9.20\resources\python") + "\\" + folder
    sys.path = ['', os.path.expandvars(r"%LocalAppData%\Fixate\app-1.9.20\resources\python"), pythonFolder(r"Lib\site-packages"), pythonFolder(r"python39.zip"), pythonFolder(r"DLLs"), pythonFolder(r"Lib"), pythonFolder(r"Lib\site-packages\win32"), pythonFolder(r"Lib\site-packages\win32\lib"), pythonFolder(r"Lib\site-packages\Pythonwin"), os.path.expandvars(r"%LocalAppData%\Fixate\app-1.9.20\resources\py")]

from flask import Flask,jsonify,request, send_from_directory
from flask_cors import CORS, cross_origin
import application as logger_application
import get_time_spent
import time
import signal
import json
from loguru import logger
from datetime import datetime
from werkzeug.middleware.profiler import ProfilerMiddleware
import ppt_api_worker
import constants


app = Flask(__name__)
# add logging with cProfile
CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
debug = False
if debug:
    from werkzeug.middleware.profiler import ProfilerMiddleware


    app.wsgi_app = ProfilerMiddleware(
        app.wsgi_app,
        restrictions=[30],
        profile_dir="profiling/input",
        filename_format="{method}-{path}-{time:.0f}-{elapsed:.0f}ms.prof",
    )
closing_apps = False
whitelist = False

current_notifications = []
logger.add(constants.LOGGER_LOCATION,backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {file} | {function} | {line} | {level} | {message}",rotation="5MB", retention=5)

def create_app():
    return app

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

@app.route("/toggle_white_list")
def toggle_white_list():
    global whitelist
    whitelist = not whitelist
    return jsonify(success=True)
@app.route("/check_closing_apps")
def check_closing_apps():
    if logger_application.is_running_logger() == True:
        distractions,focused_apps = logger_application.get_current_distracted_and_focused_apps()
        return jsonify({"closing_apps":closing_apps or logger_application.FOCUS_MODE,"whitelist":whitelist,"apps_to_close":distractions, "focused_apps":focused_apps})
    else:
        return jsonify({"closing_apps":False,"apps_to_close":[]})

@app.route("/logger_status")
def logger_status():
    # resp = Flask.make_response({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger()})
    # resp.headers["Access-Control-Allow-Origin"] = "*"
    # return resp
    in_focus_mode = logger_application.get_focus_mode_status()
    workflow = logger_application.get_current_workflow_data()
    return jsonify({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger(),"in_focus_mode":in_focus_mode, "whitelist":whitelist, "workflow":workflow,"rings":logger_application.get_rings()})
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
    start_time = datetime.strptime(request.json["start_time"], '%a %b %d %Y %H:%M:%S') # 
    end_time = datetime.strptime(request.json["end_time"], '%a %b %d %Y %H:%M:%S')
    
    times,distractions,name = get_time_spent.get_time('custom',start_time,end_time,"custom")
    distractions_apps,focused_apps = logger_application.get_current_distracted_and_focused_apps()
    return jsonify({"time":times,"distractions":distractions,"name":name, "relevant_distractions":distractions_apps, "focused_apps":focused_apps})
    # start_time = request.json["start_time"]
    # print(start_time)
    # # Wed May 10 2023 00:00:00

    # # &a %b %d %Y %H:%M:%S
    # end_time = request.json["end_time"]
    # print(end_time)
    # times,distractions = get_time_spent.get_specific_time(start_time,end_time)
    # return jsonify({"time":times,"distractions":distractions})

@app.route("/get_time_log",methods=["GET","POST"])
def get_time():
    if request.json["time"]:
        times,distractions,name = get_time_spent.get_time(request.json["time"])
        distractions_apps,focused_apps = logger_application.get_current_distracted_and_focused_apps()
        return jsonify({"time":times,"distractions":distractions,"name":name, "relevant_distractions":distractions_apps, "focused_apps":focused_apps})
    else:
        times,distractions,name,distractions_status,focused_apps = get_time_spent.get_time_from_focus_session_id(request.json["id"])
        return jsonify({"time":times,"distractions":distractions_status,"name":name,"relevant_distractions":json.loads(distractions),"focused_apps":focused_apps})

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
    # if "darwin" in sys.platform:
    os.kill(os.getpid(), signal.SIGTERM)
    # logger_application.stop_logger()
    # logger_application.boot_up_checker()


@app.route('/restart_server_macos', methods=['GET'])
def restart_server_macos():
    logger_application.stop_logger()
    os.kill(os.getpid(), signal.SIGTERM)
    return jsonify({"success":True})
@app.route('/stop_showing_task', methods=['POST'])
def stop_showing_task():
    return jsonify({"success":logger_application.stop_showing_task(request.json["id"])})
@app.route('/complete_task', methods=['POST'])
def complete_task():
    return jsonify({"success":logger_application.complete_task(request.json["id"])})

@app.route('/uncomplete_task', methods=['POST'])
def uncomplete_task():
    return jsonify({"success":logger_application.uncomplete_task(request.json["id"])})

@app.route('/start_focus_mode', methods=['GET','POST'])
def start_focus_mode():
    if request.json["type"] == "distracting":
        global closing_apps
        closing_apps = True
    if request.json["type"] == "focused":
        global whitelist
        whitelist = True
    active_phones = get_active_phones()
    
    if "task_id" in request.json:
        id = logger_application.start_focus_mode_with_task(request.json["duration"],request.json["name"],request.json['type'],request.json["task_id"])
    else:
        id = logger_application.start_focus_mode(request.json["duration"],request.json["name"],request.json['type'])
    if active_phones != {} and active_phones != None:
        try:
            ppt_api_worker.start_focus_mode_on_phone(request.json["duration"],request.json["name"],request.json['type'],id)
        except:
            pass
    return jsonify({"id":id})

@app.route("/stop_focus_mode",methods=["GET","POST"])
def stop_focus_mode():
    try:
        ppt_api_worker.end_focus_mode_on_phone(logger_application.get_focus_mode_status()['id'])
    except:
        print("FAILED TO END FOCUS MODE ON PHONE")
    return jsonify({"success":logger_application.stop_focus_mode(logger_application.get_focus_mode_status()['id'])})

@app.route("/add_daily_task",methods=["POST"])
def add_daily_task():
    return jsonify({"success":logger_application.add_daily_task(request.json["name"],request.json["task_estimate_time"])})

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
    # print(request.json)
    logger_application.save_chrome_url(request.json["url"])
    return "Success", 200

@app.route("/get_leaderboard_data",methods=["GET"])
def get_leaderboard_data():
    return jsonify({"leaderboard":ppt_api_worker.get_leaderboard_data()})

@app.route("/invite_friend_to_live_focus",methods=["POST"])
def invite_friend_to_live_focus():
    val = ppt_api_worker.invite_to_live_focus_mode(request.json["friend_id"])
    return jsonify({"status":"success" if val else "error", "data":val})

@app.route("/get_live_focus_mode_data",methods=["GET"])
def get_live_focus_data():
    return jsonify({"live_focus_data":ppt_api_worker.get_live_focus_mode_data()})

@app.route("/create_live_focus_mode",methods=["POST"])
def create_live_focus_mode():
    return jsonify(ppt_api_worker.create_live_focus_mode(request.json["name"]))

@app.route('/join_live_focus_mode', methods=['POST'])
def join_live_focus_mode():
    return jsonify({"status":ppt_api_worker.join_live_focus_mode(request.json["id"])})

@app.route('/end_live_focus_mode', methods=['POST'])
def end_live_focus_mode():
    return jsonify({"status":ppt_api_worker.end_live_focus_mode()})

@app.route('/leave_live_focus_mode', methods=['POST'])
def leave_live_focus_mode():
    return jsonify({"status":ppt_api_worker.leave_live_focus_mode()})

@app.route('/get_cached_live_focus_mode_data', methods=['GET'])
def get_cached_live_focus_mode_data():
    return jsonify({"data":ppt_api_worker.get_cached_live_focus_mode_data(), 'status': 'success'})

# workflows
@app.route('/get_workflows', methods=['GET'])
def get_workflows():
    workflow_data = logger_application.get_current_workflow_data()
    return jsonify({"workflows":logger_application.get_workflows(),"current_workflow":workflow_data['id']})

@app.route('/get_all_apps_in_workflow',methods=["POST"])
def get_all_apps_in_workflow():
    return jsonify({"apps":logger_application.get_all_apps_in_workflow(request.json["workflow_id"]),"time":get_time_spent.get_time("this_week")})

@app.route('/add_workflow_modification',methods=["POST"])
def add_workflow_modification():
    print(request.json['modification'])
    print(type(request.json['modification']))
    return jsonify({"success":logger_application.add_workflow_modification(request.json["workflow_id"],request.json["modification"])})

@app.route('/set_workflow',methods=["POST"])
def set_workflow():
    logger.debug(request.json)
    return jsonify({"success":logger_application.set_current_workflow(request.json["workflow_id"])})


@app.route("/get_ring_data",methods=["GET"])
def get_rings():
    return jsonify({"rings":logger_application.get_rings()})

@app.route("/get_all_progress_orbits",methods=["GET"])
def get_all_progress_orbits():
    return jsonify({"progress_orbits":logger_application.get_all_progress_orbits()})


@app.route("/check_chrome_extension_installed",methods=["GET"])
def check_chrome_extension_installed():
    if sys.platform == "win32":
        return jsonify({"status":logger_application.check_chrome_extension_installed()})
    return jsonify({"status":True})

@app.route("/get_improvements_data",methods=["GET"])
def get_improvement_data():
    return jsonify({"improvement_data":logger_application.get_improvement_data()})

@app.route('/images')
def send_images():
    path = request.args.get('path')
    return send_from_directory(os.path.dirname(path), os.path.basename(path))

@app.route('/getIcon/<name>',methods=["GET"])
def get_image(name):
    return send_from_directory(constants.ICON_LOCATION, name+".png")

@app.route("/add_active_phone",methods=["POST"])
def add_active_phone():
    return jsonify({"activePhones":logger_application.add_active_phone(request.json["phone_id"]),'success':True})

@app.route("/activePhones",methods=["GET"])
def get_active_phones():
    return jsonify({"activePhones":logger_application.get_active_phones()})
def start_server():
    logger.debug("Starting server")
    try:
        if sys.platform == "win32":
            from waitress import serve
            serve(app, host='127.0.0.1', port=5005, threads=2)
        else:
            app.run(host='127.0.0.1', port=5005)
    except Exception as e:
        logger.error(e)

@app.route('/get_scheduling_buckets', methods=['GET'])
def get_scheduling_buckets(): 
    return jsonify({"buckets":logger_application.get_scheduling_buckets()})

@app.route("/add_scheduling_bucket",methods=["POST"])
def add_scheduling_bucket():
    logger_application.add_scheduling_bucket(request.json["name"])
    return jsonify({"buckets":logger_application.get_scheduling_buckets()})
@app.route('/update_scheduling_bucket', methods=['POST'])
def update_scheduling_bucket():
    logger_application.update_scheduling_bucket(request.json["bucket_id"],request.json['data'])
    return jsonify({"buckets":logger_application.get_scheduling_buckets()})
if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()
    logger_application.boot_up_checker()
    start_server()
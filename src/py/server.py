#!/Applications/PowerTimeTracking.app/Contents/Resources/app/src/python/bin/python3
import sys
from flask import Flask,jsonify,request
from flask_cors import cross_origin
import application as logger_application
import get_time_spent
import time
import signal
import os
import json
from loguru import logger
app = Flask(__name__)
closing_apps = False
VERSION = "0.7.1"
logger.add(f"{os.getenv('HOME')}/.PowerTimeTracking/logs/log.log",backtrace=True,diagnose=True, format="{time:YYYY-MM-DD at HH:mm:ss} | {level} | {message}",rotation="5MB")
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
    return jsonify({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger()})
@app.route("/is_running")
def is_running():
    return jsonify(success=True)

@app.route("/get_all_time")
def get_all_time():
    return jsonify({"all_time":get_time_spent.get_all_time()})

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
if __name__ == "__main__":
    logger.debug("Starting server")
    app.run(host='127.0.0.1', port=5005)

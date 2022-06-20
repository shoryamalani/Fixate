import sys
from flask import Flask,jsonify,request
from flask_cors import cross_origin
import application as logger_application
import get_time_spent
import time
import signal
import os
app = Flask(__name__)
closing_apps = False
VERSION = "0.1.1"
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
    return jsonify({"closing_apps":closing_apps,"apps_to_close":logger_application.get_all_distracting_apps()})

@app.route("/logger_status")
def logger_status():
    return jsonify({"closing_apps":closing_apps,"logger_running_status":logger_application.is_running_logger()})
@app.route("/is_running")
def is_running():
    return jsonify(success=True)

@app.route("/get_all_time")
def get_all_time():
    return jsonify({"all_time":get_time_spent.get_all_time()})

@app.route("/get_time",methods=["GET","POST"])
def get_time():
    return jsonify({"time":get_time_spent.get_time(request.json["time"])})
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

@app.route('/start_focus_mode', methods=['GET','POST'])
def start_focus_mode():
    return jsonify({"id":logger_application.start_focus_mode(request.json["duration"])})

@app.route("/stop_focus_mode",methods=["GET","POST"])
def stop_focus_mode():
    return jsonify({"success":logger_application.stop_focus_mode(request.json["id"])})
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5005)

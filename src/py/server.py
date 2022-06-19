import sys
from flask import Flask,jsonify,request
from flask_cors import cross_origin
import application as logger_application
import get_time_spent
app = Flask(__name__)
closing_apps = False
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
if __name__ == "__main__":
    app.run(host='127.0.0.1', port=5005)
from functools import total_ordering
import database_worker
import datetime
import re
from database_worker import get_all_time_logs, get_time_logs_from_today_and_yesterday
import json
full_time_format = "%Y-%m-%d %H:%M:%S"
def parse_time(time):
    return datetime.datetime.strptime(time,database_worker.get_time_format())

def encode_time(time):
    return datetime.datetime.strftime(time,database_worker.get_time_format())

def split_into_x_seconds(data,x):
    time_chunks = []
    start_time = 0
    time_chuck_started = False
    this_time_chunk = []

    for log in data:
        log_time = parse_time(log[0])
        if time_chuck_started == False:
            start_time = log_time
            time_chuck_started = True
            this_time_chunk = []
        if log_time - start_time < datetime.timedelta(seconds=x):
            this_time_chunk.append(log)
        else:
            time_chuck_started = False
            time_chunks.append(this_time_chunk)
    return time_chunks
        
        
def get_email_stuff():
    email_body = parse_data(get_time_logs_from_today_and_yesterday())
    subject = email_body.split('\n')[1],email_body.split('\n')[2]
    return [subject,email_body]


def parse_data(data):
    applications = {}
    for log in data:
        if log[3] != 0:
            if log[2] != None:
                website = log[2]
                split_web = website.split('/')
                if len(split_web) > 2:
                    website = split_web[2]
                if website in applications:

                   applications[website] += 1
                else:
                    applications[website] = 1
            else:
                if log[1] not in applications:
                    applications[log[1]] = 1
                else:
                    applications[log[1]] += 1
    # split_into_thirty_seconds = split_into_x_seconds(data,30)
    applications = sorted(applications.items(), key=lambda x: x[1], reverse=True)
    text_with_times = "Times are added in minutes\n"
    total_time = 0
    for app in applications:
        text_with_times += f"{app[0]}: {round((app[1]/60))}\n"
        total_time += app[1]
    text_with_times = f"Total time: {round((total_time/60))}\n" + text_with_times
        

    return text_with_times
def make_url_to_base(full_url):
    return re.sub(r'(http(s)?:\/\/)|(\/.*){1}', '', full_url)

def get_timeout():
    return 180

def compress_to_time_chunks(data):
    time_chunks = []
    old_app_or_url_time = 0
    old_app_or_url = None
    old_time = None
    for log in data:
        current_app_or_url = make_url_to_base(log[2]) if log[2] else log[1] # if it is a website use the website otherwise use the app
        # however we want to ignore all the inactive time
        if log[3] == 0:
            if old_app_or_url != None:
                time_chunks.append([old_app_or_url,old_app_or_url_time])
            old_app_or_url_time = 1
            old_app_or_url = None
            old_time = None
            continue
        if current_app_or_url == old_app_or_url:
            delta_time = (parse_time(log[0]) - old_time).seconds
            if delta_time < get_timeout():
                old_app_or_url_time += delta_time
            else:
                old_app_or_url_time += 1
        else:
            if old_app_or_url != None:
                time_chunks.append([old_app_or_url,old_app_or_url_time])
            old_app_or_url_time = 0
        old_app_or_url = current_app_or_url
        old_time = parse_time(log[0])
    return time_chunks



def proper_time_parse(data,distractions=[],focused_apps=[]): # this should now be converted to a two step process where it first memoizes then does analysis so that later on we can do analysis on memoized data
    # preprocess all uncompressed data and compress it
    all_stitched_data = []
    for hour,h_data in data['data'].items():
        if not h_data['compressed']:
            h_data['data'] = compress_to_time_chunks(h_data['data'])
            h_data['compressed'] = True
            if parse_time(hour) + datetime.timedelta(minutes=60) < parse_time(data['metadata']['end_time']) and parse_time(hour) + datetime.timedelta(minutes=60) < datetime.datetime.now():
                end_time = parse_time(hour) + datetime.timedelta(hours=1)
                database_worker.add_memoized_hour(hour,encode_time(end_time),h_data['data'])
        all_stitched_data.append({"hour":hour, "data":h_data['data']})

    if len(all_stitched_data) == 0:
        return {},{'total_time_spent':0,"distractions_number":0,"distractions_time_min":0/60}
    
    time = 0
    all_times = {}
    distracted_percentage_over_time = {}
    distractions_total = 0
    longest_time_without_distraction = 0
    distractions_time = 0
    for hour in all_stitched_data:
        for datum in hour['data']:
            url_or_app = datum[0]
            if url_or_app in all_times:
                all_times[url_or_app] += datum[1]
            else:
                all_times[url_or_app] =  datum[1]
            entry = parse_time(hour['hour']).strftime('%m/%d %H:%M')
            if entry not in distracted_percentage_over_time: # month day hour %M %S %f
                distracted_percentage_over_time[entry] = {
                    "distracted": 0,
                    "neutral_time": 0,
                    "distractions": 0,
                    "focused": 0
                }

            if url_or_app in distractions:
                if datum[1] > longest_time_without_distraction:
                    longest_time_without_distraction = datum[1]
                distractions_total += 1
                distractions_time += datum[1]
                distracted_percentage_over_time[entry]["distractions"] += 1
                distracted_percentage_over_time[entry]["distracted"] += datum[1]
            elif url_or_app not in distractions and url_or_app not in focused_apps:
                distracted_percentage_over_time[entry]["neutral_time"] += datum[1]
            elif url_or_app in focused_apps:
                distracted_percentage_over_time[entry]["focused"] += datum[1]
            time += datum[1]
    return all_times,{"total_time_spent":time,"distractions_number":distractions_total,"distractions_per_minute":(time/distractions_total if distractions_total > 0 else 0)/60,"longest_time_without_distraction_min":longest_time_without_distraction/60,"distractions_time_total":distractions_time/60,"distracted_percentage_over_time":distracted_percentage_over_time}
                
def get_all_time():
    data = database_worker.get_all_time_logs()
    times = proper_time_parse(data)
    return times

def parse_for_display(times):
    """
    takes a dictionary of times and orders them by time spent
    """
    all_times_list = [[key,value] for key,value in times.items()]
    total_time = 0
    for time in all_times_list:
        total_time += time[1]
    all_times_list.append(['Total',total_time])
    all_times_list.sort(key=lambda x: x[1], reverse=True)
    return all_times_list

def get_time_from_focus_session_id(id):
    data = database_worker.get_focus_session_by_id(id)
    start_time = database_worker.get_time_from_format(data[1])
    end_time = database_worker.get_time_from_format(data[3]) if data[3] else database_worker.get_time_from_format(data[1]) + datetime.timedelta(minutes=data[2])
    times,distractions,name = get_time('custom',start_time,end_time)
    return times,data[4],data[5] if data[5] else f"Focus Session {id}",distractions
    # logs = smart_get_time(start_time,end_time)
    # times,distractions= proper_time_parse(logs,data[4])
    # return times,data[4], data[5] if data[5] else f"Focus Session {id}",distractions
    # return parse_for_display(times),data[4], data[5] if data[5] else f"Focus Session {id}",distractions

def get_time(time_period,start_time=None,end_time=None,name=None):
    if time_period == "all":
        start_time = database_worker.get_first_time_log()[0]
        data = smart_get_time(start_time,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "All Time"
    elif time_period == "today":
        morning = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0),full_time_format)
        data = smart_get_time(morning,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Today"
    elif time_period == "yesterday":
        end_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=23,minute=59,second=59)-datetime.timedelta(days=1),full_time_format)
        start_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=1),full_time_format)
        data = smart_get_time(start_of_yesterday,end_of_yesterday)
        name = "Yesterday"
    elif time_period == "week":
        start_of_week = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=7),full_time_format)
        data = smart_get_time(start_of_week,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "This Week"
    elif time_period == "last_five_hours":
        start_of_last_five_hours = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(hours=5),full_time_format)
        data = smart_get_time(start_of_last_five_hours,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last 5 Hours"
    elif time_period == "last_hour":
        start_of_last_hour = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(hours=1),full_time_format)
        data = smart_get_time(start_of_last_hour,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last Hour"
    elif time_period == "last_30_minutes":
        start_of_last_30_minutes = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(minutes=30),full_time_format)
        data = smart_get_time(start_of_last_30_minutes,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last 30 Minutes"
    elif time_period == "last_month":
        start_of_last_month = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=30),full_time_format)
        data = smart_get_time(start_of_last_month,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last Month"
    elif time_period == "this_month":
        start_of_this_month = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=30),full_time_format)
        data = smart_get_time(start_of_this_month,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "This Month"
    elif time_period == "custom":
        if type(start_time) == datetime.datetime:
            start_time = datetime.datetime.strftime(start_time,full_time_format)
        if type(end_time) == datetime.datetime:
            end_time = datetime.datetime.strftime(end_time,full_time_format)
        data = smart_get_time(start_time,end_time)
        name = "Custom"
    else:
        start_time = database_worker.get_first_time_log()[0]
        data = smart_get_time(start_time,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "All Time"
    if data['data'] == {}:
        return {"Total":0},{'total_time_spent':0,"distractions_number":0,"distractions_time_min":0/60},"No Data"
    distractions, focused_apps = get_current_distracted_and_focused_apps()
    times,distractions = proper_time_parse(data,distractions,focused_apps)
    return times,distractions,name


def smart_get_time(start_time,end_time):
    # first get memoized hours and then fill in the gaps with the database
    # then do the analysis
    memoized_data = database_worker.get_memoized_hours_between_times(start_time,end_time)
    final_memoized_data = {
        "metadata":{
            "start_time":start_time,
            "end_time":end_time
        },
        "data":{}
    }
    for data in memoized_data:
        final_memoized_data['data'][data[1]] = {}
        final_memoized_data['data'][data[1]]['data'] = json.loads(data[4])
        final_memoized_data['data'][data[1]]['compressed'] = True
    temp_time = start_time
    all_memoized_times = final_memoized_data['data'].keys()
    # sort the memoized times
    all_memoized_times = sorted(all_memoized_times,key=lambda x: parse_time(x))
    while parse_time(temp_time) < parse_time(end_time):
        if temp_time not in final_memoized_data['data']:
            # get the next memoized time
            temp_end_time = None
            for memoized_time in all_memoized_times:
                if parse_time(memoized_time) > parse_time(temp_time):
                    temp_end_time = memoized_time
                    break
            if temp_end_time == None:
                temp_end_time = end_time

            # temp_end_time = parse_time(temp_time) + datetime.timedelta(hours=1)
            # temp_end_time = temp_end_time.replace(minute=0,second=0,microsecond=0)
            # if temp_end_time > parse_time(end_time):
            #     temp_end_time = end_time
            # else:
            #     temp_end_time = encode_time(temp_end_time)
            start_log_time = parse_time(temp_time)
            end_log_time = parse_time(temp_end_time)
            while start_log_time < end_log_time:
                if start_log_time.strftime("%Y-%m-%d %H:00:00") not in final_memoized_data['data']:
                    final_memoized_data['data'][start_log_time.strftime("%Y-%m-%d %H:00:00")] = {
                        "compressed":False,
                        "data":[]
                    }
                start_log_time += datetime.timedelta(hours=1)
            print(temp_time,temp_end_time)
            for log in database_worker.get_logs_between_times(temp_time,temp_end_time):
                hour = parse_time(log[0]).strftime("%Y-%m-%d %H:00:00")
                if hour not in final_memoized_data['data']:
                    final_memoized_data['data'][hour] = {
                        "compressed":False,
                    }
                    final_memoized_data['data'][hour]['data'] = []
                final_memoized_data['data'][hour]['data'].append(log)
            temp_time = temp_end_time
        else:
            temp_time = parse_time(temp_time) + datetime.timedelta(hours=1)
            temp_time = encode_time(temp_time.replace(minute=0,second=0,microsecond=0))
    return final_memoized_data






def get_distractions_time_in_minutes(times,distractions):
    total_time = 0
    for time in times:
        if time[0] in distractions:
            total_time += time[1]
    return total_time/60

def get_specific_time(start_time,end_time):
    print(datetime.datetime.strftime(start_time,full_time_format)) 
    print(datetime.datetime.strftime(end_time,full_time_format))
    data = smart_get_time(datetime.datetime.strftime(start_time,full_time_format),datetime.datetime.strftime(end_time,full_time_format))
    # end_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=23,minute=59,second=59)-datetime.timedelta(days=1),full_time_format)
    # start_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=1),full_time_format)
    # data = database_worker.get_logs_between_times(end_of_yesterday,start_of_yesterday)
    print(data)
    if data == []:
        return {"Total":0},{'total_time_spent':0,"distractions_number":0,"distractions_time_min":0/60}
    distractions, focused_apps = get_current_distracted_and_focused_apps()
    times,distractions = proper_time_parse(data,distractions,focused_apps)
    # times = parse_for_display(times)
    # distractions['total_time_spent'] = times[0][1]
    # distractions['distractions_time_min'] = get_distractions_time_in_minutes(times,get_all_distracting_apps())
    return times,distractions
    
def get_time_from_focus_session(focus_session_id):
    data = database_worker.get_logs_from_focus_session(focus_session_id)
    distractions, focused_apps = get_current_distracted_and_focused_apps()
    times,distractions = proper_time_parse(data,distractions,focused_apps)
    times = parse_for_display(times)
    return times,distractions

def get_current_distracted_and_focused_apps():
    data = database_worker.get_current_workflow_data()
    return data['data']['distractions'],data['data']['focused_apps']
# deprecated
# def get_all_distracting_apps(): 
#     parsed_apps = []
#     all_apps = database_worker.get_all_apps_statuses()
#     for app in all_apps:
#         if app[4] == 1:
#             parsed_apps.append(app[1])
#     # logger.debug(parsed_apps)
#     return parsed_apps

def main():
    # data = database_worker.get_all_time_logs()
    # # print('inactive time:')
    # # for log in data:
    # #     if log[3] == 0:
    # #         print(log)
    # return parse_data(data)
    print(get_time("all_time"))

if __name__ == "__main__":
    print(main())
from functools import total_ordering
import database_worker
import datetime
import re
from database_worker import get_all_time_logs, get_time_logs_from_today_and_yesterday
full_time_format = "%Y-%m-%d %H:%M:%S"
def parse_time(time):
    return datetime.datetime.strptime(time,database_worker.get_time_format())

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
def proper_time_parse(data,distractions=[]):
    # times = {} THIS IS OLD CODE
    # last_item = None
    # last_time = None
    # times_between_distractions = []
    # time_between_distractions_seconds = 0
    # for log in data:
    #     log = list(log)
    #     if log != None:
    #         if log[3] == 1:
    #             if log[2] != None:
    #                 log[1] = make_url_to_base(log[2])
    #             if log[1] in times:
    #                 if last_time != None:
    #                     delta_seconds =  datetime.datetime.strptime(log[0],full_time_format) - datetime.datetime.strptime(last_time,full_time_format)
    #                 if last_time == None:
    #                     last_time = log[0]
    #                     times[log[1]] += 1
    #                     if log[1] in distractions:
    #                         times_between_distractions.append(time_between_distractions_seconds)
    #                         time_between_distractions_seconds = 0
    #                     else:
    #                         time_between_distractions_seconds += 1
    #                 # elif delta_seconds < datetime.timedelta(seconds=10) and last_item == log[1]:
    #                 #     times[log[1]] += delta_seconds.seconds
    #                 #     last_time = log[0]
    #                 elif delta_seconds < datetime.timedelta(seconds=10):
    #                     times[log[1]] += delta_seconds.seconds
    #                     last_time = log[0]
    #                     last_item = log[1]
    #                     if log[1] in distractions:
    #                         times_between_distractions.append(time_between_distractions_seconds)
    #                         time_between_distractions_seconds = 0
    #                     else:
    #                         time_between_distractions_seconds += delta_seconds.seconds
    #                 else:
    #                     times[log[1]] += 1
    #                     last_time = log[0]
    #                     last_item = log[1]
    #                     if log[1] in distractions:
    #                         times_between_distractions.append(time_between_distractions_seconds)
    #                         time_between_distractions_seconds = 0
    #                     else:
    #                         time_between_distractions_seconds += 1
    #             else:
    #                 times[log[1]] = 1
    #                 if log[1] in distractions:
    #                     times_between_distractions.append(time_between_distractions_seconds)
    #                     time_between_distractions_seconds = 0
    #                 else:
    #                     time_between_distractions_seconds += 1
    # data = database_worker.get_all_time_logs()
    # print(len(data))
    i = 0
    final_data = []
    while i < len(data):
        if data[i][3] != 0:
            final_data.append(data[i])
        i += 1
    # print(len(final_data))
    previous_time = datetime.datetime.strptime(final_data[0][0],full_time_format)
    time = 0
    all_times = {}
    for data in final_data:
        if datetime.datetime.strptime(data[0],full_time_format) - previous_time > datetime.timedelta(seconds=180):
            time += 1
            url_or_app = make_url_to_base(data[2]) if data[2] else data[1]
            if url_or_app in all_times:
                all_times[url_or_app] += 1
            else:
                all_times[url_or_app] = 1
        else:
            current_time = (datetime.datetime.strptime(data[0],full_time_format) - previous_time).seconds
            time += current_time
            url_or_app = make_url_to_base(data[2]) if data[2] else data[1]
            if url_or_app in all_times:
                all_times[url_or_app] += current_time
            else:
                all_times[url_or_app] = current_time
        previous_time = datetime.datetime.strptime(data[0],full_time_format)
    # distractions = get_all_distracting_apps()
    distractions_total = 0
    previous = final_data[0][2]
    cur_time_without_distraction = 0
    longest_time_without_distraction = 0
    for data in final_data:
        if data[2]:
            url = make_url_to_base(data[2])
            if url in distractions and url != previous:
                if cur_time_without_distraction > longest_time_without_distraction:
                    longest_time_without_distraction = cur_time_without_distraction
                cur_time_without_distraction = 0
                distractions_total +=1
            elif url not in distractions:
                cur_time_without_distraction += 1
            previous = url
        else:
            if data[1] in distractions and data[1] != previous:
                distractions_total +=1
                if cur_time_without_distraction > longest_time_without_distraction:
                    longest_time_without_distraction = cur_time_without_distraction
                cur_time_without_distraction = 0
            elif data[1] not in distractions:
                cur_time_without_distraction += 1
            previous = data[1]
    # print(distractions_total)
    # previous = data
    # print(time)
    # final_times = [[a,b] for a,b in all_times.items()]
    # final_times.append(["Total Time",time])
    # final_times.sort(key=lambda x: x[1],reverse=True)
    # for key in final_times:
    #     print(key)
    # distractions = {"distractions_number":len(times_between_distractions)}
    # final_distractions_num = len([x for x in times_between_distractions if x > 0])
    # if len(times_between_distractions) == 0:
    #     distractions["distractions_time_min"] = 0
    # else:
    #     distractions["distractions_time_min"] = (sum(times_between_distractions)/final_distractions_num)/60
    return all_times,{"distractions_number":distractions_total,"distractions_time_min":(time/distractions_total if distractions_total > 0 else 0)/60,"longest_time_without_distraction_min":longest_time_without_distraction/60}
                
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
    logs = database_worker.get_logs_between_times(start_time,end_time)
    times,distractions= proper_time_parse(logs,data[4])
    
    return parse_for_display(times),data[4], data[5] if data[5] else f"Focus Session {id}",distractions

def get_time(time_period):
    if time_period == "all":
        data = database_worker.get_all_time_logs()
        name = "All Time"
    elif time_period == "today":
        morning = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0),full_time_format)
        data = database_worker.get_logs_between_times(morning,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Today"
    elif time_period == "yesterday":
        end_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=23,minute=59,second=59)-datetime.timedelta(days=1),full_time_format)
        start_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=1),full_time_format)
        data = database_worker.get_logs_between_times(start_of_yesterday,end_of_yesterday)
        name = "Yesterday"
    elif time_period == "week":
        start_of_week = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=7),full_time_format)
        data = database_worker.get_logs_between_times(start_of_week,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "This Week"
    elif time_period == "last_five_hours":
        start_of_last_five_hours = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(hours=5),full_time_format)
        data = database_worker.get_logs_between_times(start_of_last_five_hours,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last 5 Hours"
    elif time_period == "last_hour":
        start_of_last_hour = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(hours=1),full_time_format)
        data = database_worker.get_logs_between_times(start_of_last_hour,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last Hour"
    elif time_period == "last_30_minutes":
        start_of_last_30_minutes = datetime.datetime.strftime(datetime.datetime.now()-datetime.timedelta(minutes=30),full_time_format)
        data = database_worker.get_logs_between_times(start_of_last_30_minutes,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
        name = "Last 30 Minutes"
    else:
        data = database_worker.get_all_time_logs()
        name = "All Time"
    if data == []:
        return {"Total":0},{"distractions_number":0,"distractions_time_min":0/60},"No Data"
    times,distractions = proper_time_parse(data,get_all_distracting_apps())
    times = parse_for_display(times)
    distractions['total_time_spent'] = times[0][1]
    return times,distractions,name

def get_specific_time(start_time,end_time):
    print(datetime.datetime.strftime(start_time,full_time_format)) 
    print(datetime.datetime.strftime(end_time,full_time_format))
    data = database_worker.get_logs_between_times(datetime.datetime.strftime(start_time,full_time_format),datetime.datetime.strftime(end_time,full_time_format))
    # end_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=23,minute=59,second=59)-datetime.timedelta(days=1),full_time_format)
    # start_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=1),full_time_format)
    # data = database_worker.get_logs_between_times(end_of_yesterday,start_of_yesterday)
    print(data)
    if data == []:
        return {"Total":0},{"distractions_number":0,"distractions_time_min":0/60}
    times,distractions = proper_time_parse(data,get_all_distracting_apps())
    times = parse_for_display(times)
    return times,distractions
    
def get_time_from_focus_session(focus_session_id):
    data = database_worker.get_logs_from_focus_session(focus_session_id)
    times,distractions = proper_time_parse(data,get_all_distracting_apps())
    times = parse_for_display(times)
    return times,distractions
def get_all_distracting_apps():
    parsed_apps = []
    all_apps = database_worker.get_all_apps_statuses()
    for app in all_apps:
        if app[4] == 1:
            parsed_apps.append(app[1])
    # logger.debug(parsed_apps)
    return parsed_apps

def main():
    # data = database_worker.get_all_time_logs()
    # # print('inactive time:')
    # # for log in data:
    # #     if log[3] == 0:
    # #         print(log)
    # return parse_data(data)
    print(get_time("week"))

if __name__ == "__main__":
    print(main())
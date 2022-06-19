import database_worker
import datetime

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

def proper_time_parse(data):
    times = {}
    last_item = None
    last_time = None
    for log in data:
        if log != None:
            if log[3] == 1:
                if log[1] in times:
                    if last_time != None:
                        delta_seconds =  datetime.datetime.strptime(log[0],full_time_format) - datetime.datetime.strptime(last_time,full_time_format)
                    if last_time == None:
                        last_time = log[0]
                        times[log[1]] += 1
                    elif delta_seconds < datetime.timedelta(seconds=10) and last_item == log[1]:
                        times[log[1]] += delta_seconds.seconds
                        last_time = log[0]
                    elif delta_seconds < datetime.timedelta(seconds=10):
                        times[log[1]] += delta_seconds.seconds
                        last_time = log[0]
                        last_item = log[1]
                    else:
                        times[log[1]] += 1
                        last_time = log[0]
                        last_item = log[1]
                else:
                    times[log[1]] = 1
    return times
                
def get_all_time():
    data = database_worker.get_all_time_logs()
    times = proper_time_parse(data)
    return times
def get_time(time_period):
    if time_period == "all":
        data = database_worker.get_all_time_logs()
    elif time_period == "today":
        morning = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0),full_time_format)
        data = database_worker.get_logs_between_times(morning,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
    elif time_period == "yesterday":
        end_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=23,minute=59,second=59)-datetime.timedelta(days=1),full_time_format)
        start_of_yesterday = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=1),full_time_format)
        data = database_worker.get_logs_between_times(start_of_yesterday,end_of_yesterday)
    elif time_period == "week":
        start_of_week = datetime.datetime.strftime(datetime.datetime.now().replace(hour=0,minute=0,second=0,microsecond=0)-datetime.timedelta(days=7),full_time_format)
        
        data = database_worker.get_logs_between_times(start_of_week,datetime.datetime.strftime(datetime.datetime.now(),full_time_format))
    else:
        data = database_worker.get_all_time_logs()
    times = proper_time_parse(data)
    return times
    
def main():
    # data = database_worker.get_all_time_logs()
    # # print('inactive time:')
    # # for log in data:
    # #     if log[3] == 0:
    # #         print(log)
    # return parse_data(data)
    print(get_time("today"))
if __name__ == "__main__":
    print(main())
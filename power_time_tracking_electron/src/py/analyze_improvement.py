import get_time_spent
def analyze_improvements(time_period_1,time_period_2,distractions=[],focused_apps=[]):
    period_1_apps, period_1_distractions_data,period_1_name = time_period_1
    period_2_apps, period_2_distractions_data,period_2_name = time_period_2
    period_1_time = period_1_distractions_data['total_time_spent']
    period_2_time = period_2_distractions_data['total_time_spent']
    if period_1_time == 0 or period_2_time == 0:
        return {}
    distractions_per_hour_1 = period_1_distractions_data['distractions_number']/(period_1_time/3600)
    distractions_per_hour_2 = period_2_distractions_data['distractions_number']/(period_2_time/3600)
    lookaway_deltas = {}
    for app in period_1_distractions_data['lookaway_apps']:
        if app in period_2_distractions_data['lookaway_apps']:
            if period_1_distractions_data['lookaway_apps'][app] == 0 or period_2_distractions_data['lookaway_apps'][app] == 0:
                continue
            lookaway_deltas[app] = {
                "app_name":app,
                "period_1":period_1_distractions_data['lookaway_apps'][app]/(period_1_time/3600),
                "period_2":period_2_distractions_data['lookaway_apps'][app]/(period_2_time/3600),
                "delta":period_2_distractions_data['lookaway_apps'][app]/(period_2_time/3600) - period_1_distractions_data['lookaway_apps'][app]/(period_1_time/3600),
                "delta_percent": 100*(period_2_distractions_data['lookaway_apps'][app]/(period_2_time/3600) - period_1_distractions_data['lookaway_apps'][app]/(period_1_time/3600))/(period_1_distractions_data['lookaway_apps'][app]/(period_1_time/3600) + period_2_distractions_data['lookaway_apps'][app]/(period_2_time/3600)),
                "percent_of_total":((period_1_distractions_data['lookaway_apps'][app]/(period_1_time/3600)+period_2_distractions_data['lookaway_apps'][app]/(period_2_time/3600))*100)/(distractions_per_hour_1+distractions_per_hour_2)
            }
    lookaway_deltas_list = []
    for app in lookaway_deltas:
        lookaway_deltas_list.append(lookaway_deltas[app])
    lookaway_deltas_list = sorted(lookaway_deltas_list, key=lambda k: k['percent_of_total'],reverse=True)

    lookaway_delta = period_2_distractions_data['lookaways'] - period_1_distractions_data['lookaways']
    if period_1_distractions_data['lookaways'] != 0:
        lookaway_delta_percent = 100*(period_2_distractions_data['lookaways'] - period_1_distractions_data['lookaways'])/period_1_distractions_data['lookaways']
    else:
        lookaway_delta_percent = 0
    usage_deltas = {}
    for app in period_1_apps:
        if app in period_2_apps:
            if period_1_apps[app] == 0 or period_2_apps[app] == 0:
                continue
            elif app not in distractions and app not in focused_apps:
                print(app)
                continue
            else:
                usage_deltas[app] = {
                    "app_name":app,
                    "period_1":period_1_apps[app]*100/(period_1_time),
                    "period_1_time":period_1_apps[app],
                    "period_2":period_2_apps[app]*100/(period_2_time),
                    "period_2_time":period_2_apps[app],
                    "delta":period_2_apps[app]/(period_2_time/3600) - period_1_apps[app]/(period_1_time/3600),
                    "delta_percent": (period_2_apps[app]/(period_2_time) - period_1_apps[app]/(period_1_time))*100,
                    "percent_of_total":((period_1_apps[app]+period_2_apps[app])*100)/(period_1_time+period_2_time) 
                }
                if (app in usage_deltas):
                    if (usage_deltas[app]['delta_percent'] < 0 and app in focused_apps):
                        usage_deltas.pop(app)
                    elif (usage_deltas[app]['delta_percent'] > 0 and app in distractions):
                        usage_deltas.pop(app)

    usage_deltas_list = []
    for app in usage_deltas:
        usage_deltas_list.append(usage_deltas[app])
    usage_deltas_list = sorted(usage_deltas_list, key=lambda k: k['percent_of_total'],reverse=True)
    all_deltas = {
        "distractions_delta":distractions_per_hour_2 - distractions_per_hour_1,
        "lookaway_delta":lookaway_delta,
        "lookaway_delta_percent":lookaway_delta_percent,
        "lookaway_deltas":lookaway_deltas_list,
        "usage_deltas": usage_deltas_list
    }
    return {"all_deltas":all_deltas,"period_1_name":period_1_name,"period_2_name":period_2_name,"period_1_time":period_1_time,"period_2_time":period_2_time}

if __name__ == "__main__":
    time_period_1 = get_time_spent.get_time("this_month")
    time_period_2 = get_time_spent.get_time("previous_month")
    print(analyze_improvements(time_period_1,time_period_2,["Discord", "Music", "Messages", "System Preferences", "Slack", "News", "www.youtube.com", "www.macrumors.com", "www.wsj.com", "drive.google.com", "Thunderbird", "WhatsApp", "Mail", "monkeytype.com", "www.politico.com"],["", "wikipedia.org", "Google Chrome", "Safari", "Firefox", "Brave Browser", "Microsoft Edge", "Opera Browser", "Reminders", "Notes", "google.com", "quizlet.com", "Brave Browser", "Terminal", "Code", "Adobe Lightroom", "github.com", "docs.google.com", "Electron", "Xcode", "zoom.us", "DBeaver"]))
    
import Foundation
import FamilyControls
import DeviceActivity
// The Device Activity name is how I can reference the activity from within my extension


// I want to remove the application shield restriction when the child accumulates enough usage for a set of guardian-selected encouraged apps
extension DeviceActivityEvent.Name {
    // Set the name of the event to "encouraged"
    static let encouraged = Self("encouraged")
}

// The Device Activity schedule represents the time bounds in which my extension will monitor for activity
let center = DeviceActivityCenter()
class MySchedule {
    
    static public func setSchedule() {
        print("Setting schedule...")
        print("Hour is: ", Calendar.current.dateComponents([.hour, .minute], from: Date()).hour!)
    }
    
    static public func scheduleWeeklyFocus() {
        print("Scheduling weekly focus...")
        print("Hour is: ", Calendar.current.dateComponents([.hour, .minute], from: Date()).hour!)
        
        // start at 00:00:00
        let startTime = DateComponents(hour: 0, minute: 0, second: 0)
        // end at 23:59:59
        let endTime = DateComponents(hour: 23, minute: 59, second: 59)
        
        // create a schedule that repeats every day
        let weeklySchedule = DeviceActivitySchedule(intervalStart: startTime, intervalEnd: endTime, repeats: true)
        let threshold = DateComponents(minute:ObjectPersistanceManager().getUserData()?.currentFocusSettings.threshold ?? 0)
        
        ObjectPersistanceManager().startFocusModeStreak()
        let blockedApps = ObjectPersistanceManager().getUserData()?.alwaysDistractingApps ?? FamilyActivitySelection()
        do {
            center.stopMonitoring([.daily])
            try center.startMonitoring(.daily, during: weeklySchedule,events: [.timeSpent:DeviceActivityEvent(applications: blockedApps.applicationTokens,categories:blockedApps.categoryTokens,webDomains: blockedApps.webDomainTokens, threshold: threshold)])
            print("Started logging")
            return ;
        } catch {
            print(error)
        }
    }
    
    static public func scheduleCompetitionFocus(){
        // start at 00:00:00
        let startTime = DateComponents(hour: 0, minute: 0, second: 0)
        // end at 23:59:59
        let endTime = DateComponents(hour: 23, minute: 59, second: 59)
        
        // create a schedule that repeats every day
        let weeklySchedule = DeviceActivitySchedule(intervalStart: startTime, intervalEnd: endTime, repeats: true)
        
        // now we will create many activities with no blocked apps and currently only two categories - gaming and social media
        let blockedApps = ObjectPersistanceManager().getUserData()?.competitionCategories ?? FamilyActivitySelection()
        
        do {
            center.stopMonitoring([.weeklyCompetition])
            
            if #available(iOS 17.4, *) {
                ObjectPersistanceManager().clearTodaysCompetitionData()
                try center.startMonitoring(.weeklyCompetition, during: weeklySchedule,events:
                                            [
                                                .weeklyCompetitionHour1:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 60),includesPastActivity: true),
                                                .weeklyCompetitionHour2:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 120),includesPastActivity: true),
                                                .weeklyCompetitionHour3:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 180),includesPastActivity: true),
                                                .weeklyCompetitionHour4:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 240),includesPastActivity: true),
                                                .weeklyCompetitionHour5:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 300),includesPastActivity: true),
                                                .weeklyCompetitionHour6:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 360),includesPastActivity: true),
                                                .weeklyCompetitionHour7:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 420),includesPastActivity: true),
                                                
                                                
                                                
                                            ])
                
                
            } else {
                try center.startMonitoring(.weeklyCompetition, during: weeklySchedule,events:
                                            [
                                                .weeklyCompetitionHour1:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute:60)),.weeklyCompetitionHour2:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 120)),
                                                .weeklyCompetitionHour3:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute:180)), .weeklyCompetitionHour4:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute:240)), .weeklyCompetitionHour5:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute:300)), .weeklyCompetitionHour6:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute:360)), .weeklyCompetitionHour7:DeviceActivityEvent(applications: [],categories:blockedApps.categoryTokens ,webDomains: [], threshold: DateComponents(minute: 420)),
                                                
                                                ])
            }
        } catch{
            print(error)
        }
        
        
    }
    
    
    static public func startTimedFocusMode(num:Double,focusMode:FocusModeResponse? = nil){
        print("Start Focus Mode")

        let currentTime = Date.now;
        var endTime = Date.now
        endTime.addTimeInterval(TimeInterval(num*60))
        print(endTime)
        print(currentTime)
        
        let lateTimeDateComponents = Calendar.current.dateComponents([.hour,.minute,.second],from:endTime);
        let currentTimeDateComponents = Calendar.current.dateComponents([.hour,.minute,.second],from: currentTime)
        let currentFocusMode = DeviceActivitySchedule(intervalStart:currentTimeDateComponents , intervalEnd: lateTimeDateComponents, repeats: false)
        
//        ObjectPersistanceManager().saveCurrentFocusMode()
//        print("SETTING THE FOCUS MODE WITH THE ID \(focusMode)")
        print(endTime)
        print(currentTime)
        
        do{
//            try await center.stopMonitoring([.focusedTime])
//            center.stopMonitoring()
            ObjectPersistanceManager().setCurrentFocusMode(FocusMode(focusModeId: UUID(), startTime: currentTime, ExpectedEndTime: endTime, isBlocking: true, isConnectedToFocusMode: focusMode != nil,focusMode: focusMode,focusModeType: FocusModeType.basic, pauseCount: 0,pausesAllowed: false))
            try center.startMonitoring(.focusedTime, during: currentFocusMode)
            print("Started logging")
            return ;
        } catch  {
            print(error)
                
        }
        
        
    }
}

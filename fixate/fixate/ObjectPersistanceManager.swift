//
//  ObjectPersistanceManager.swift
//  fixate
//
//  Created by Shorya Malani on 7/29/23.
//

import Foundation
import FamilyControls
import Combine
import DeviceActivity
import ManagedSettings


extension DeviceActivityName {
    // Set the name of the activity to "daily"
    static let daily = Self("daily")
    static let focusedTime = Self("focusedTime")
    static let weeklyCompetition = Self("weeklyCompetition")
}
extension DeviceActivityEvent.Name{
    static let timeSpent = Self("timeSpent")
    static let weeklyCompetitionHour1 = Self("weeklyCompetitionHour1")
    static let weeklyCompetitionHour2 = Self("weeklyCompetitionHour2")
    static let weeklyCompetitionHour3 = Self("weeklyCompetitionHour3")
    static let weeklyCompetitionHour4 = Self("weeklyCompetitionHour4")
    static let weeklyCompetitionHour5 = Self("weeklyCompetitionHour5")
    static let weeklyCompetitionHour6 = Self("weeklyCompetitionHour6")
    static let weeklyCompetitionHour7 = Self("weeklyCompetitionHour7")
    
}
extension ManagedSettingsStore.Name {
    static let focused = Self("focused")
    static let daily = Self("daily")
    static let weeklyCompetition = Self("weeklyCompetition")
}


struct FocusMode : Codable {
    var focusModeId:UUID
    var focusModeName:String?
    var startTime: Date
    var ExpectedEndTime: Date
    var ActualEndTime: Date?
    var isBlocking: Bool
    var isConnectedToFocusMode:Bool
    var focusMode: FocusModeResponse?
    var focusModeType: FocusModeType?
    var pauseCount:Int
    var pausesAllowed:Bool
}
struct FocusModeResponse : Codable {
    var status:String;
    var focus_mode_name:String
    var focus_mode_duration:Int
    var focus_mode_type:String
    var focus_mode_start_time:String
    var focus_mode_id:Int
    var focus_mode_active:Bool

}

struct UserGoals : Codable {
    var version: Int
    var numberOfFocusModesPerDay: Int
    var focusTimePerDay: Int
    var daysPerWeek: Int
}

struct FocusModeSettings: Codable {
    var lastFocusModeToIgnore: Int
    var focusMode: FocusMode?
    var weekdays: [String: Bool]?
    var threshold: Int?
    var lastReachedThreshold: Int?
    var lastReachedThresholdDay: String?
    var streakSince: String?
    var pointsPerDay: Int?
    
}

enum FocusModeType: String, Codable {
    case basic = "basic"
    case lockdown = "lockdown"
}


struct competitionLossData: Codable {
    var infraction:String
    var time:Date
    var selection:FamilyActivitySelection
    
}

struct SavedUserData : Codable {
    var userGoals: UserGoals
    var focusModes:[FocusMode]
    var currentFocusSettings: FocusModeSettings
    var distractingApps: FamilyActivitySelection
    var alwaysDistractingApps: FamilyActivitySelection
    var competitionCategories:FamilyActivitySelection
    var competitionData: [String:[competitionLossData]]
}

struct Badge : Codable {
    var dateAchieved: Date?
    var displayId: Int
}


struct BadgeDisplayData {
    var displayId: Int
    var name: String
    var type: String
    var description: String
    var thresholds: [Double]
    var pointValue: Int
    var image: String
}



class ObjectPersistanceManager {
    struct HoursPerDay {
        var hours: Int
        var day:String
    }
    var sharedContainerIdentifier:String;
    var updateUserData: (Result<SavedUserData,Error>) -> Void;
    init(updateFunc: @escaping (Result<SavedUserData,Error>) -> Void = {_ in }) {
        updateUserData = updateFunc
        sharedContainerIdentifier = "group.fixate.shoryamalani"
    }
    func saveDistractingAppsToPersistence(_ object: FamilyActivitySelection) {
        var userData = getUserData()
        userData?.distractingApps = object
        saveUserData(userData!)
    }
    func saveSelectionForCompetitionToPersistance( _ object:FamilyActivitySelection){
        var userData = getUserData()
        userData?.competitionCategories = object
        saveUserData(userData!)
    }
    

//    func retrieveDistractingAppsFromPersistence() -> FamilyActivitySelection? {
//        do {
//            let sharedContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sharedContainerIdentifier)
//                let url = sharedContainerURL?.appendingPathComponent("distracingApps.json")
//                let data = try Data(contentsOf: url!)
//                let decoder = JSONDecoder()
//                let object = try decoder.decode(FamilyActivitySelection.self, from: data)
//                return object
//        } catch {
//            print("Error retrieving object: \(error)")
//            return nil
//        }
//    }
    func keyExists(key: String) -> Bool {
        guard let _ = UserDefaults.standard.object(forKey: key) else {
         return false;
        }
        return true;

       
    }
    func retrieveAccount() -> FixateAccount? {
        if (keyExists(key: "userAccount") == true){
            let encoded:FixateAccount = UserDefaults.standard.object(forKey: "userAccount") as! FixateAccount
            return encoded
        }
        return nil;
    }
    func encodeAccount(_ acc: FixateAccount){
        UserDefaults.standard.set(acc, forKey: "userAccount")
    }
    func getUserData() -> SavedUserData? {
        do {
            let sharedContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sharedContainerIdentifier)
                let url = sharedContainerURL?.appendingPathComponent("userData.json")
                let data = try Data(contentsOf: url!)
                let decoder = JSONDecoder()
                let object = try decoder.decode(SavedUserData.self, from: data)
                return object
        } catch {
            print("Error retrieving object: \(error)")
            return nil
        }
    
    }
    

    func getDistractionsPerDay() -> [HoursPerDay]{
        // take the last 7 days and get their date values with the format dd-mm-yyyy
        // Get the current date
        var userData = getUserData();
        let currentDate = Date()

        // Create a DateFormatter
        let dateFormatter = DateFormatter()

        // Set the date format to include only the year, month, and day
        dateFormatter.dateFormat = "yyyy-MM-dd"
    
        var dateString = dateFormatter.string(from: currentDate)
        // for loop getting the date one day back each time
        var finalData:[HoursPerDay] = []
        for i in 0..<7{
                // subtract one day
//            check if the date is in currtCompetitionDate
            print(userData!.competitionData)
            if(userData!.competitionData.keys.contains(dateString)){
                // check how many unique events there are
                var events = 0
                var previousInfractions:[String] = []
                userData!.competitionData[dateString]?.forEach{
                    if(previousInfractions.contains($0.infraction)) != true{
                        events += 1
                        previousInfractions.append($0.infraction)
                        
                    }
                }
                let curDate = dateFormatter.date(from: dateString)
                // get day of week
                let dayOfWeek = Calendar.current.component(.weekday, from: curDate!)
                let weekdays = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"]
                
                
                finalData.append(HoursPerDay(hours:events , day: weekdays[dayOfWeek-1]))
            }
            let newDate = Calendar.current.date(byAdding: .day, value: -1, to: dateFormatter.date(from: dateString)!)
            dateString = dateFormatter.string(from: newDate!)
            
            
            
        }
        print(finalData)
    
        
        return finalData;
        
        
        
        
    }
    
    func clearTodaysCompetitionData() {
        var userData = getUserData()
        let currentDate = Date()
        
        let dateFormatter = DateFormatter()
        
        
        dateFormatter.dateFormat = "yyyy-MM-dd"
    
        let dateString = dateFormatter.string(from: currentDate)
        userData?.competitionData.removeValue(forKey: dateString)
        saveUserData(userData!)
    }
    func getCurrentWeeklyScore() -> Int{
        // take the last 7 days and get their date values with the format dd-mm-yyyy
        // Get the current date
        let userData = getUserData();
        let currentDate = Date()

        // Create a DateFormatter
        let dateFormatter = DateFormatter()

        // Set the date format to include only the year, month, and day
        dateFormatter.dateFormat = "yyyy-MM-dd"
    
        var dateString = dateFormatter.string(from: currentDate)
        // for loop getting the date one day back each time
        var finalData:[HoursPerDay] = []
        var totalEvents = 0
        for _ in 0..<7{
                // subtract one day
//            check if the date is in currtCompetitionDate
            print(userData!.competitionData)
            if(userData!.competitionData.keys.contains(dateString)){
                // check how many unique events there are
                var events = 0
                var previousInfractions:[String] = []
                userData!.competitionData[dateString]?.forEach{
                    if(previousInfractions.contains($0.infraction)) != true{
                        events += 1
                        previousInfractions.append($0.infraction)
                        
                    }
                }
                
                
                
                totalEvents += events;
            }
            let newDate = Calendar.current.date(byAdding: .day, value: -1, to: dateFormatter.date(from: dateString)!)
            dateString = dateFormatter.string(from: newDate!)
            
            
            
        }
        print(finalData)
    
        
        return totalEvents;
        
        
        
        
    }
    func addThreshold(_ threshold:String ) {
        // Get the current date
        let currentDate = Date()

        // Create a DateFormatter
        let dateFormatter = DateFormatter()

        // Set the date format to include only the year, month, and day
        dateFormatter.dateFormat = "yyyy-MM-dd"

        // Convert the current date to a string
        let dateString = dateFormatter.string(from: currentDate)

        // Convert the string back to a date, which now has only the year, month, and day
//        let dateWithoutTime = dateFormatter.date(from: dateString)
        
        var userData:SavedUserData = getUserData()!;
        
        
        let compLossVal = competitionLossData(infraction: threshold, time: Date(), selection: userData.competitionCategories ?? FamilyActivitySelection())
        if(userData.competitionData.keys.contains(dateString) ) {
            userData.competitionData[dateString]?.append(compLossVal)
        }
           else{
               userData.competitionData[dateString] = [compLossVal]
            
        }
        
        
        saveUserData(userData)
        
        
        
    
        
        
    
        
        
        
        
        
        
    }
    
    func saveUserData(_ userData: SavedUserData){
//        save user data to a file
        do {
            let encoder = JSONEncoder()
            let data = try encoder.encode(userData)
            let sharedContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sharedContainerIdentifier)
            let url = sharedContainerURL?.appendingPathComponent("userData.json")
            try data.write(to: url!)
            updateUserData(.success(userData))
        
        } catch {
            print("Error saving object: \(error)")
        }
    }
    func setCurrentFocusMode(_ focusMode: FocusMode){
        
        LiveFocusManager().startLiveFocus(focusMode)
        var userData = getUserData()
        saveCurrentFocusMode()
        userData?.currentFocusSettings.focusMode = focusMode
        saveUserData(userData!)
    }
    
    func saveCurrentFocusMode(){
        
        let userData = getUserData()
        if(userData?.currentFocusSettings.focusMode != nil){
            var focusMode = userData?.currentFocusSettings.focusMode
            focusMode!.ActualEndTime = Date()
            saveFocusModeToHistory(focusMode!)
        }
    }
    func saveFocusModeToHistory(_ focusMode: FocusMode){
        LiveFocusManager().endLiveFocus()
        var userData = getUserData()
        var curFocusMode = focusMode
        curFocusMode.ActualEndTime = Date()
        userData?.focusModes.append(curFocusMode)
        saveUserData(userData!)
    }
    func saveFocusGoals(_ goals: UserGoals){
        var userData = getUserData()
        userData?.userGoals = goals
        saveUserData(userData!)
    }
    func setDistractingApps(_ apps: FamilyActivitySelection){
        var userData = getUserData()
        userData?.distractingApps = apps
        saveUserData(userData!)
    }
    func setAlwaysDistractingApps(_ apps: FamilyActivitySelection){
        var userData = getUserData()
        userData?.alwaysDistractingApps = apps
        saveUserData(userData!)
    }
    func clearCurrentFocusMode() {
        print("SOMEONE IS CLEARING CURRENT FOCUS MODE")
        LiveFocusManager().endLiveFocus()
        var userData = getUserData()
        userData?.currentFocusSettings.focusMode = nil
        saveUserData(userData!)
    }
    func ignoreCurrentFocusMode() {
        var userData = getUserData()
        userData?.currentFocusSettings.lastFocusModeToIgnore = getUserData()!.currentFocusSettings.focusMode?.focusMode?.focus_mode_id ?? 0
        saveUserData(userData!)
    }
    func saveWeekdays(_ weekdays: [String: Bool]){
        var userData = getUserData()
        userData?.currentFocusSettings.weekdays = weekdays
        saveUserData(userData!)
    }
    func setFocusModeThreshold(_ threshold: Int){
        var userData = getUserData()
        userData?.currentFocusSettings.threshold = threshold
        saveUserData(userData!)
    }
    func startFocusModeStreak(){
        var userData = getUserData()
        let streakFormat = DateFormatter()
        streakFormat.dateFormat = "yyyy-MM-dd"
        userData?.currentFocusSettings.streakSince = streakFormat.string(from: Date())
        saveUserData(userData!)
    }
    func calculateStreakDays()->Int{
//        return int
        let userData = getUserData()
        let streakFormat = DateFormatter()
        streakFormat.dateFormat = "yyyy-MM-dd"
        let streakSince = streakFormat.date(from: userData!.currentFocusSettings.streakSince ?? streakFormat.string(from: Date()))
        let today = streakFormat.date(from: streakFormat.string(from: Date()))
        let calendar = Calendar.current
        let components = calendar.dateComponents([.day], from: streakSince!, to: today!)
        return components.day!
        
        
    }
}




struct FixateAccount: Codable {
    var hasLoggedIn: Bool
    var acountId:Int?
    var name: String?
    var dataEncodedJson:String?
}

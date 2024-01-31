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
}
extension DeviceActivityEvent.Name{
    static let timeSpent = Self("timeSpent")
}
extension ManagedSettingsStore.Name {
    static let focused = Self("focused")
    static let daily = Self("daily")
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


struct SavedUserData : Codable {
    var userGoals: UserGoals
    var focusModes:[FocusMode]
    var currentFocusSettings: FocusModeSettings
    var distractingApps: FamilyActivitySelection
    var alwaysDistractingApps: FamilyActivitySelection
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
//        do {
//            let encoder = JSONEncoder()
//            let data = try encoder.encode(object)
//            let sharedContainerURL = FileManager.default.containerURL(forSecurityApplicationGroupIdentifier: sharedContainerIdentifier)
//            let url = sharedContainerURL?.appendingPathComponent("distracingApps.json")
//            try data.write(to: url!)
//        } catch {
//            print("Error saving object: \(error)")
//        }
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

//
//  fixateApp.swift
//  fixate
//
//  Created by Shorya Malani on 7/22/23.
//

import SwiftUI
import DeviceActivity
import FamilyControls
import ManagedSettings
import UserNotifications
import Combine
import DeviceActivity


//public let tim = Timer.publish(every: 2, on: .current, in: .common).autoconnect()

public var model = MyModel.shared
public struct publicModelStore {
    static var publicModel = model
}
extension DeviceActivityReport.Context {
    static let iconView = Self("Icon View")
}


class AppDelegate: NSObject, UIApplicationDelegate,UNUserNotificationCenterDelegate {
    // Make this request when the app launches
    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil) -> Bool {
        print("OMG WE INIT CORRECTLY BOIS")
        let userNotificationCenter = UNUserNotificationCenter.current()
        
        let authOptions = UNAuthorizationOptions.init(arrayLiteral: .alert, .badge, .sound)
        
        userNotificationCenter.requestAuthorization(options: authOptions) { (success, error) in
            if let error = error {
                print("Error: ", error)
            } else{
                if(success){
                    print("User has granted permission for notifications")
                        DispatchQueue.main.async {
                            userNotificationCenter.delegate = self
                            print(UIApplication.shared.isRegisteredForRemoteNotifications)
                            UIApplication.shared.unregisterForRemoteNotifications()
                            print(UIApplication.shared.isRegisteredForRemoteNotifications)
                            UIApplication.shared.registerForRemoteNotifications()
                        }
                }
            }
        }
       
        
        
        return true
    }
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        print("Registered for notifications")
        addMobileNotificationCode(code: deviceToken.base64EncodedString())
    }

}

class CurrentUserData : ObservableObject {
    
    @Published var userData = ObjectPersistanceManager().getUserData()!
    func updateData(){
        DispatchQueue.main.async {
            self.userData = ObjectPersistanceManager().getUserData()!
        }
    }
    
    func calculateStreakDifficulty() -> Double{
//        Take number of days/7 and multiply it by 10/minutes allowed
        let days = self.userData.currentFocusSettings.weekdays!.filter{$0.value}.count
        let minutes = Double(self.userData.currentFocusSettings.threshold ?? 10) + 1
        let streakDifficulty = Double(days)/Double(7) * Double(20)/minutes * 100
        return streakDifficulty
        
    }
    
    
    
    func calculatePoints(startTime:Date, endTime:Date) -> Int{
        var points:Int = 0
        var focusModePoints = 0
        for focusMode in userData.focusModes {
//            print("focus mode")
            if(focusMode.startTime >= startTime && focusMode.startTime <= endTime){
//                print("Active focus mode")
                focusModePoints += 10
                if(focusMode.ActualEndTime != nil){
                    if(focusMode.ActualEndTime! > focusMode.ExpectedEndTime){
                        points += -Int(focusMode.startTime.timeIntervalSince(focusMode.ExpectedEndTime))/60 * 10
                        points += 50
                    }else{
                        points += -Int(focusMode.startTime.timeIntervalSince(focusMode.ActualEndTime!))/60 * 10
                    }
                }
            }
        }
        if (focusModePoints > 100){
            points += 100
        } else{
            points += focusModePoints
        
        }
        
        return points
    }
}

@main
struct fixateApp: App {
    init() {
        var curUserDat = ObjectPersistanceManager().getUserData()
        if (curUserDat==nil) {
            let curFocusModes:[FocusMode] = []
            curUserDat = SavedUserData(userGoals: UserGoals(version: 1, numberOfFocusModesPerDay: 3, focusTimePerDay: 60, daysPerWeek: 5), focusModes:curFocusModes , currentFocusSettings: FocusModeSettings(lastFocusModeToIgnore: -10), distractingApps: FamilyActivitySelection(), alwaysDistractingApps: FamilyActivitySelection(), competitionCategories: FamilyActivitySelection(), competitionData: [:])
            ObjectPersistanceManager().saveUserData(curUserDat!)
        }
        if (curUserDat?.currentFocusSettings.weekdays == nil){
            curUserDat?.currentFocusSettings.weekdays = ["Monday":true,"Tuesday":true,"Wednesday":true,"Thursday":true,"Friday":true,"Saturday":false,"Sunday":false]
        }
        if(curUserDat?.currentFocusSettings.threshold == nil){
            curUserDat?.currentFocusSettings.threshold = 0
        }
        if(curUserDat?.competitionCategories == nil){
            curUserDat?.competitionCategories = FamilyActivitySelection()
        }
        if(curUserDat?.competitionData == nil){
            curUserDat?.competitionData = [:]
            
        }
        ObjectPersistanceManager().saveUserData(curUserDat!)
        
        
    
    }
    
    @UIApplicationDelegateAdaptor(AppDelegate.self) var appDelegate
    let persistenceController = PersistenceController.shared
    @StateObject var userData:CurrentUserData = CurrentUserData()
    private let timer = Timer.publish(every: 2, on: .main, in: .common).autoconnect()
    @StateObject var modelPublic = model
    @StateObject var store = ManagedSettingsStore()
    
    func onStartup() {
        APIManager().getCurrentFocusMode {result in
            
            switch result {
            case .success(let data):
                // Handle the successful response data here
                DispatchQueue.main.sync {
                    
//                print("Received data: \(data)")
                // figure out if we should start a focus mode
//                format of focus_mode_start_time: 2023-08-06 07:24:35
                let dateFormatter = DateFormatter()
                dateFormatter.dateFormat = "yyyy-MM-dd HH:mm:ss"
                    dateFormatter.timeZone = TimeZone(identifier:  "UTC")//                convert focusmodestart time to account for the fact that it is on utc
                let focusModeStartTime =  dateFormatter.date(from: data.focus_mode_start_time)
//                dateFormatter.timeZone = TimeZone.current
//                print(" focus mdoe start time: \(focusModeStartTime)")
                
//                focusModeStartTime = convertToCurrentTimeZone(date: focusModeStartTime!)
                var focusModeFixed = data
                focusModeFixed.focus_mode_start_time = dateFormatter.string(from: focusModeStartTime!)
//                print(" focus mdoe start time: \(focusModeFixed.focus_mode_start_time)")
                
                
//                print(" focus mdoe start time: \(focusModeStartTime)")
                
                let focusModeEndTime = focusModeStartTime?.addingTimeInterval(TimeInterval(data.focus_mode_duration*60))
                    print(dateFormatter.string(from: focusModeEndTime!))
//                print(focusModeEndTime)
//                print(focusModeStartTime)
                
                    if(focusModeStartTime != nil && focusModeEndTime != nil){
                        let now = Date()
//                        now = convertToCurrentTimeZone(date: now)
                        let curUserData = ObjectPersistanceManager().getUserData()
                        print(now.timeIntervalSince(focusModeStartTime!))
                        
//                        print("now: \(now)")
//                        print(curUserData?.currentFocusSettings.focusMode?.focusMode ?? "no focus mode")
                        if(curUserData?.currentFocusSettings.focusMode?.focusMode != nil && data.focus_mode_active == true){
//                            print("Focus mode already running")
                        } else if (curUserData?.currentFocusSettings.lastFocusModeToIgnore == data.focus_mode_id && data.focus_mode_active == true) {
//                            print("ignoring focus mode")
                        }
                        else if(now.timeIntervalSince(focusModeStartTime!) > 0 && now.timeIntervalSince(focusModeEndTime!) < 0  && data.focus_mode_active == true){
                            print("we should start a focus mode")
                            //                        time interval should be since now
                            var duration = focusModeEndTime!.timeIntervalSince(now)/60
                            print(duration)
                            if(duration < 15){
                                duration = 15
                            }
                            print("The duration is \(duration)")
                            
                            MySchedule.startTimedFocusMode(num: duration,focusMode: focusModeFixed)
                        } else if (curUserData?.currentFocusSettings.focusMode?.focusMode != nil && data.focus_mode_active == false){
                            print("we should end a focus mode")
                            MyModel.shared.stopFocusMode()
                            ObjectPersistanceManager().saveCurrentFocusMode()
                            ObjectPersistanceManager().clearCurrentFocusMode()

                        } else if(curUserData?.currentFocusSettings.streakSince == nil){
                            ObjectPersistanceManager().startFocusModeStreak()
                        }
                        userData.updateData()
                    }
                }
                
            case .failure(let error):
                // Handle the error here
                print("Error: \(error.localizedDescription)")
            }
        }
        
        
    }
    func convertToCurrentTimeZone(date: Date) -> Date {
            
            let timeZoneOffset = Double(TimeZone.current.secondsFromGMT(for: date))
            guard let localDate = Calendar.current.date(byAdding: .second, value: Int(timeZoneOffset), to: date) else {
                return date
            }
            return localDate
        
        }
    var body: some Scene {
        WindowGroup {
            HStack{
                TabView {
                    
                    
                    ContentView(userData: userData).environmentObject(modelPublic).environmentObject(store).environmentObject(userData)
                        .environment(\.managedObjectContext, persistenceController.container.viewContext)
                        .tabItem {
                            Label("Home", systemImage: "house")
                        }
                    ComputerIntegration().environmentObject(modelPublic).environmentObject(store).environmentObject(userData)
                        .environment(\.managedObjectContext, persistenceController.container.viewContext)
                        .tabItem {
                            Label("Computer", systemImage: "laptopcomputer")
                        }
                    PointsView(userData: userData)
                        .tabItem {
                            Label("Progress", systemImage: "cellularbars")
                        }
                    SchedulingView(userData: userData).environmentObject(modelPublic)
                        .tabItem {
                            Label("Schedule", systemImage: "calendar")
                        }
                    PeerInterface(userData: userData).environmentObject(modelPublic).tabItem {
                        Label("Peers",systemImage: "person.2.fill")
                    }
                }
                .onReceive(timer) {
                    _ in
                    
                    onStartup()
                    userData.updateData()
                }

            }
        }
    }
}

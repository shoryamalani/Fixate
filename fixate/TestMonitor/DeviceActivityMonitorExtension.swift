//
//  DeviceActivityMonitorExtension.swift
//  TestMonitor
//
//  Created by Shorya Malani on 7/26/23.
//

import DeviceActivity
import ManagedSettings
import Foundation
import FamilyControls
import Combine


 

// Optionally override any of the functions below.
// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.

class DeviceActivityMonitorExtension: DeviceActivityMonitor {
    let focusedStore = ManagedSettingsStore(named: .focused)
    let dailyStore = ManagedSettingsStore(named: .daily)
    override init(){
        super.init()
        
        
    }
    override func intervalDidStart(for activity: DeviceActivityName) {
        print(activity)
        let center: FamilyActivitySelection?
        let store: ManagedSettingsStore
        if(activity == .focusedTime){
            center = ObjectPersistanceManager().getUserData()?.distractingApps
            store = focusedStore
            if(center == nil){
                print("WHY NOT BRO")
            }
            
            else {
                if(center!.applications.isEmpty){
                    store.shield.applications = nil;
                }else{
                    store.shield.applications = center!.applicationTokens
                }
                store.shield.applicationCategories = center!.categoryTokens.isEmpty ? nil: ShieldSettings.ActivityCategoryPolicy.specific(center!.categoryTokens)
            }
        } else if(activity == .daily){
            center = ObjectPersistanceManager().getUserData()?.alwaysDistractingApps
            store = dailyStore
        }else{
            center = nil
            store = focusedStore
        }
        
//        super.intervalDidStart(for: activity)
        
        
        // Handle the start of the interval.
    }
    
    override func intervalDidEnd(for activity: DeviceActivityName) {
//        super.intervalDidEnd(for: activity)
        let store: ManagedSettingsStore
        print(activity)
        print(activity == .daily)
        if(activity == .focusedTime){
            store = focusedStore
            ObjectPersistanceManager().saveCurrentFocusMode()
            ObjectPersistanceManager().clearCurrentFocusMode()
        }
        
        else if(activity == .daily){
            store = dailyStore
        }
        else{
            store = focusedStore
        }
        
        store.shield.applications = nil
        store.shield.applicationCategories = nil
        
        // Handle the end of the interval.
    }
    
    override func eventDidReachThreshold(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventDidReachThreshold(event, activity: activity)
        // Handle the event reaching its threshold.
        
        if(activity == .daily && event == .timeSpent){
            let center = ObjectPersistanceManager().getUserData()?.alwaysDistractingApps
            let store = dailyStore
            let weekdays = ObjectPersistanceManager().getUserData()?.currentFocusSettings.weekdays
            let calendar = Calendar.current
            let components = calendar.dateComponents([.weekday], from: Date())
            let allWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
            if(weekdays![allWeekdays[components.weekday!-1]] == true){
                print("BLOCKING THIS WEEKDAY")
                if(center == nil){
                    print("WHY NOT BRO")
                }
                
                else {
                    if(center!.applications.isEmpty){
                        store.shield.applications = nil;
                    }else{
                        store.shield.applications = center!.applicationTokens
                    }
                    store.shield.applicationCategories = center!.categoryTokens.isEmpty ? nil: ShieldSettings.ActivityCategoryPolicy.specific(center!.categoryTokens)
                }
            }
            
        }
    }
    
    override func intervalWillStartWarning(for activity: DeviceActivityName) {
        super.intervalWillStartWarning(for: activity)
        
        // Handle the warning before the interval starts.
    }
    
    override func intervalWillEndWarning(for activity: DeviceActivityName) {
        super.intervalWillEndWarning(for: activity)
        
        // Handle the warning before the interval ends.
    }
    
    override func eventWillReachThresholdWarning(_ event: DeviceActivityEvent.Name, activity: DeviceActivityName) {
        super.eventWillReachThresholdWarning(event, activity: activity)
        
        // Handle the warning before the event reaches its threshold.
    }
}

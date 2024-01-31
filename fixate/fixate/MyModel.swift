import Foundation
import FamilyControls
import ManagedSettings
import SwiftUI


private let _MyModel = MyModel()

public class MyModel: ObservableObject {
    // Import ManagedSettings to get access to the application shield restriction
    let store = ManagedSettingsStore()
//    @EnvironmentObject var store: ManagedSettingsStore

    
    @Published var selectionToDiscourage: FamilyActivitySelection
    @Published var alwaysDistractingApps: FamilyActivitySelection
    init() {
        let savedValue = ObjectPersistanceManager().getUserData()?.distractingApps
        let alwaysDistracting = ObjectPersistanceManager().getUserData()?.alwaysDistractingApps
        if(savedValue == nil){
            selectionToDiscourage = FamilyActivitySelection()
        }else{
            selectionToDiscourage = savedValue!
        }
        if(alwaysDistracting == nil){
            alwaysDistractingApps = FamilyActivitySelection()
        } else{
            alwaysDistractingApps = alwaysDistracting!
        
        }
    }
    
    func updateSelections(){
        let savedValue = ObjectPersistanceManager().getUserData()?.distractingApps
        let alwaysDistracting = ObjectPersistanceManager().getUserData()?.alwaysDistractingApps
        if(savedValue == nil){
            selectionToDiscourage = FamilyActivitySelection()
        }else{
            selectionToDiscourage = savedValue!
        }
        if(alwaysDistracting == nil){
            alwaysDistractingApps = FamilyActivitySelection()
        } else{
            alwaysDistractingApps = alwaysDistracting!
        
        }
    }
    
    
    
    class var shared: MyModel {
        return _MyModel
    }
    func saveSelectionToDiscourage(){
        ObjectPersistanceManager().saveDistractingAppsToPersistence(selectionToDiscourage)
    }
    
    func stopFocusMode(){
        print("SOMEONE IS STOPPING THE FOCUS MODE")
        ObjectPersistanceManager().saveCurrentFocusMode()
        ObjectPersistanceManager().clearCurrentFocusMode()
        liftRestrictions()
    }
    
    
    func setShieldRestrictions() {
        // Pull the selection out of the app's model and configure the application shield restriction accordingly
//        self.selectionToDiscourage = applications;
        store.shield.applications = selectionToDiscourage.applicationTokens.isEmpty ? nil : selectionToDiscourage.applicationTokens
        store.shield.applicationCategories = selectionToDiscourage.categoryTokens.isEmpty
        ? nil
        : ShieldSettings.ActivityCategoryPolicy.specific(selectionToDiscourage.categoryTokens)
    }
    func liftRestrictions(){
        var focusStore = ManagedSettingsStore(named: .focused)
        focusStore.shield.applications = nil;
        focusStore.shield.applicationCategories = nil;
    }
    func getCurrent() -> FamilyActivitySelection{
        return self.selectionToDiscourage
    }

//    func setShieldOneMinute(){
//        print("setSheild1min")
//        MySchedule.addTimer(num: 15)
//    }
}

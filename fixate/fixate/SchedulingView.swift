//
//  SchedulingView.swift
//  fixate
//
//  Created by Shorya Malani on 8/13/23.
//

import SwiftUI

struct SchedulingView: View {
    @ObservedObject var userData:CurrentUserData;
    @EnvironmentObject var modelPublic: MyModel
    @State var days: [String: Bool]
    @State var selectedNumber: Int
    let minimumValue = 0
    let maximumValue = 60
    @State private var isDisallowPresented = false
    @State private var weekDays: [String]
    init(userData:CurrentUserData){
        self.userData = userData
        days = userData.userData.currentFocusSettings.weekdays!
        weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday","Sunday"]
        selectedNumber = userData.userData.currentFocusSettings.threshold!
        
    }
    var body: some View {

        VStack{
            Text("Select days to schedule").font(.title)
                .padding()
            HStack {
                
                
                ForEach(weekDays, id: \.self) { day in
                    Button(action: {
//                        days[day]?.toggle()
                        var tempDays = days
                        tempDays[day]!.toggle()
                        self.days = tempDays
                        
//                        ObjectPersistanceManager().saveWeekdays(tempDays)
//                        userData.updateData()
                        
                        
                    }) {
                        Text(day[Range(NSRange(location: 0, length: 1), in: day)!])
                            .padding()
                            .foregroundColor(days[day]! ? .white : .blue)
                            .background(days[day]! ? Color.blue : Color.white)
                            .cornerRadius(10)
                            .scaleEffect(days[day]! ? 1 : 0.7)
                    }
                }
            }
//            Text("Minutes of use before blocking: \(selectedNumber)")
//                .padding()
            
            Slider(value: Binding<Double>(
                            get: { Double(selectedNumber) },
                            set: {
                                selectedNumber = Int($0)
                            }
                        ), in: Double(minimumValue)...Double(maximumValue), step: 1)
                        .padding(.horizontal)
            Button {
                isDisallowPresented = true
            }
        label:{
            Text("Select Apps That Be Blocked after \(selectedNumber) minutes")
                .font(Font.body.bold())
                .padding()
                .foregroundColor(Color.primary)
                .colorInvert()
        }
        .myButtonStyle()
                .buttonStyle(.borderedProminent)
                .familyActivityPicker(isPresented: $isDisallowPresented, selection: $modelPublic.alwaysDistractingApps)
           
            Text("Apps/Categories Considered Distracting")
//            VStack{
//                ForEach(modelPublic.alwaysDistractingApps.applicationTokens, id: \.self) { app in
//                    Label(app).labelStyle(.iconOnly)
//                }
//            }
            List {
                ForEach(Array(modelPublic.alwaysDistractingApps.applicationTokens), id: \.self) { app in
                    Label(app).labelStyle(.titleAndIcon)
                }
                ForEach(Array(modelPublic.alwaysDistractingApps.categoryTokens), id: \.self) { app in
                    Label(app).labelStyle(.titleAndIcon)
                }
            }
            if(days != userData.userData.currentFocusSettings.weekdays || selectedNumber != userData.userData.currentFocusSettings.threshold || model.alwaysDistractingApps != userData.userData.alwaysDistractingApps){
                Button {
                    ObjectPersistanceManager().setFocusModeThreshold(selectedNumber)
                    ObjectPersistanceManager().saveWeekdays(days)
                    ObjectPersistanceManager().setAlwaysDistractingApps(modelPublic.alwaysDistractingApps)
                    let weekdays = ObjectPersistanceManager().getUserData()?.currentFocusSettings.weekdays
                    let calendar = Calendar.current
                    let components = calendar.dateComponents([.weekday], from: Date())
                    let allWeekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
                    print(weekdays![allWeekdays[components.weekday!-1]])
                    if(weekdays![allWeekdays[components.weekday!-1]] == true){
                        print("CORRECT WEEKDAY")
                    }
                    else{
                        
                    }
                    MySchedule.scheduleWeeklyFocus()
                }
            label:{
                Text("Set configuration and reset streak")
                    .font(Font.body.bold())
                    .padding()
                    .foregroundColor(Color.primary)
                    .colorInvert()
            }.errorButtonStyle()
            }
        }.onChange(of: model.alwaysDistractingApps) { newSelection in
            print(newSelection)
            
            print(model.alwaysDistractingApps)
        }
    }
}

//struct SchedulingView_Previews: PreviewProvider {
//    static var previews: some View {
//        SchedulingView(userData: CurrentUserData()).environmentObject(MyModel())
//    }
//}

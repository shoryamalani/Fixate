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
    var days: [String: Bool]
    @State var selectedNumber: Int
    let minimumValue = 0
    let maximumValue = 30
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
                        ObjectPersistanceManager().saveWeekdays(tempDays)
                        userData.updateData()
                        
                        
                    }) {
                        Text(day[Range(NSRange(location: 0, length: 1), in: day)!])
                            .padding()
                            .foregroundColor(days[day]! ? .white : .blue)
                            .background(days[day]! ? Color.blue : Color.white)
                            .cornerRadius(10)
                    }
                }
            }
            Text("Minutes of use before blocking: \(selectedNumber)")
                .padding()
            
            Slider(value: Binding<Double>(
                            get: { Double(selectedNumber) },
                            set: {
                                selectedNumber = Int($0)
                                ObjectPersistanceManager().setFocusModeThreshold(selectedNumber)
                            }
                        ), in: Double(minimumValue)...Double(maximumValue), step: 1)
                        .padding(.horizontal)
            Button("Select Apps That Should Always Be Blocked") {
                isDisallowPresented = true
            }.buttonStyle(.borderedProminent)
                .familyActivityPicker(isPresented: $isDisallowPresented, selection: $modelPublic.alwaysDistractingApps)
            Button("Set configuration") {
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
            }.buttonStyle(.borderedProminent)
            
        }.onChange(of: model.alwaysDistractingApps) { newSelection in
            print(newSelection)
            ObjectPersistanceManager().setAlwaysDistractingApps(newSelection)
            print(model.alwaysDistractingApps)
        }
    }
}

struct SchedulingView_Previews: PreviewProvider {
    static var previews: some View {
        SchedulingView(userData: CurrentUserData()).environmentObject(MyModel())
    }
}

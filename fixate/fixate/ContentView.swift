//
//  ContentView.swift
//  fixate
//
//  Created by Shorya Malani on 7/22/23.
//

import SwiftUI
import CoreData
import FamilyControls
import DeviceActivity
import activityReport
import UserNotifications
import BRYXBanner

let tim = Timer
    .publish(every: 1, on: .main, in: .common)
    .autoconnect()

extension DeviceActivityReport.Context {
    static let totalActivity = Self("Total Activity")
}

struct ContentView: View {
    @Environment(\.managedObjectContext) private var viewContext
    @State private var context: DeviceActivityReport.Context = .totalActivity
    @ObservedObject var userData:CurrentUserData;
    @FetchRequest(
        sortDescriptors: [NSSortDescriptor(keyPath: \Item.timestamp, ascending: true)],
        animation: .default)
    private var items: FetchedResults<Item>
    let center = AuthorizationCenter.shared
    @State private var isDiscouragedPresented = false
    @State private var selectedNumber = 20
    @State private var showAppUsageModal = false
    @EnvironmentObject var modelPublic: MyModel
    @State var counter: Int = 0
    @State var countTo: Int = 120 //4 minutes 120 - 2minutes
    @State private var showAlert = false;
    let minimumValue: Int = 15
    
    let maximumValue: Int = 120
    func appStartup () {
//        let account:FixateAccount? = ObjectPersistanceManager().retrieveAccount()
        checkAccount()
        print(ObjectPersistanceManager().getUserData()?.focusModes ?? "None")
        print(ObjectPersistanceManager().getUserData()?.currentFocusSettings ?? "None")
        
    }

    let redGradient = AngularGradient(gradient:
        Gradient(colors: [
            Color(red: 249/255, green: 77/255, blue: 83/255),
            Color(red: 40/255, green: 12/255, blue: 12/255)
        ]),
        center: .center,
        startAngle: .degrees(-90),
        endAngle: .degrees(270))
    
    let greenGradient = AngularGradient(gradient: Gradient(colors: [
        Color(red: 51/255, green: 224/255, blue: 94/255),
        Color(red: 13/255, green: 58/255, blue: 24/255)
    ]), center: .center,
        startAngle: .degrees(-90),
        endAngle: .degrees(270))
    // What to show
    // Buttom should be old scrollable focus modes
    // Top should be start a new focus mode/current focus mode
    // current focus mode should show the time left and information about the focus mode
    // Create a focus mode should show a time
    // in between these two there should be something to set distracting apps.
    var body: some View {

        VStack{
            
//            Button("Show Screen Time Report"){
//                showAppUsageModal = true
//            }
//            DeviceActivityReport(.totalAc tivity)
            
        
            
            VStack {
                Text("Fixate")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .padding(.bottom, 20)
                if(userData.userData.currentFocusSettings.focusMode == nil){
                    
                    Button("Block for \(selectedNumber) minutes"){
                        MySchedule.startTimedFocusMode(num: Double(selectedNumber),focusMode: nil)
                        userData.updateData()
                    }.buttonStyle(.borderedProminent)
//                    Picker("Select a number", selection: $selectedNumber) {
//                       ForEach(15..<121) { number in
//                           Text("\(number)").tag(number)
//                       }
//
//                   }
////                   .labelsHidden() // Hide the labels to make it cleaner
//                   .pickerStyle(InlinePickerStyle()) // Use WheelPickerStyle for a circular picker
                    Slider(value: Binding<Double>(
                                    get: { Double(selectedNumber) },
                                    set: { selectedNumber = Int($0) }
                                ), in: Double(minimumValue)...Double(maximumValue), step: 1)
                                .padding(.horizontal)
                    Button("Select Apps to Discourage") {
                        isDiscouragedPresented = true
                    }.buttonStyle(.borderedProminent)
                        .familyActivityPicker(isPresented: $isDiscouragedPresented, selection: $modelPublic.selectionToDiscourage)
                } else {
                    
                    
                    
//                    Make countdown
//                    ProgressView(timerInterval: Date().addingTimeInterval(userData.userData.currentFocusSettings.focusMode!.startTime.timeIntervalSinceNow)...Date().addingTimeInterval(userData.userData.currentFocusSettings.focusMode!.ExpectedEndTime.timeIntervalSinceNow),countsDown: false)
//                        .frame(width: 300, height: 300)
//                        .padding().progressViewStyle(.linear)
                        //                    ProgressView(timerInterval:userData.userData.currentFocusSettings.focusMode!.startTime... userData.userData.currentFocusSettings.focusMode!.ExpectedEndTime,value: Double(userData.userData.currentFocusSettings.focusMode!.startTime.timeIntervalSinceNow))
//                        .frame(width: 300, height: 300)
//                        .padding()
                    VStack{
                               ZStack{
                                   Circle()
                                       .fill(Color.clear)
                                       .frame(width: 250, height: 250)
                                       .overlay(
                                           Circle()
//                                            .stroke(Color.red, lineWidth: 25)
                                            .stroke(
                                                redGradient,
                                                style: StrokeStyle(lineWidth: 25, lineCap: .round))
                                   ).rotationEffect(Angle(degrees: -90))

                                   Circle()
                                       .fill(Color.clear)
                                       .frame(width: 250, height: 250)
                                       .overlay(
                                           Circle().trim(from:0, to: progress())
                                               .stroke(greenGradient,
                                                   style: StrokeStyle(
                                                       lineWidth: 25,
                                                       lineCap: .round,
                                                       lineJoin:.round
                                                   )
                                               )
                                               .foregroundColor(
                                                   (completed() ? Color.orange : Color.green)
                                               ).animation(
                                                   .easeInOut(duration: 0.2)
                                               )
                                       ).rotationEffect(Angle(degrees: -90))

                                   Clock(counter: counter, countTo: countTo)
                               }
                    }.padding()
                    
                    .onAppear{
                        countTo = Int(userData.userData.currentFocusSettings.focusMode!.ExpectedEndTime.timeIntervalSince(userData.userData.currentFocusSettings.focusMode!.startTime))
                        counter = -Int(userData.userData.currentFocusSettings.focusMode!.startTime.timeIntervalSinceNow)
                    }

                    .onReceive(tim) { time in
                               if (self.counter < self.countTo) {
                                   self.counter += 1
                               }
                           }
//                    Button("Start blocking restrictions"){
//                        MyModel.shared.setShieldRestrictions()
//                    }.buttonStyle(.borderedProminent)
//
                    if(userData.userData.currentFocusSettings.focusMode?.focusMode != nil){
                        Button("Ignore This Focus Mode"){
                            ObjectPersistanceManager().ignoreCurrentFocusMode()
                            MyModel.shared.stopFocusMode()
                            userData.updateData()
                        }.buttonStyle(.borderedProminent)
                    } else {
                        Button("Stop Focus Mode"){
                            MyModel.shared.stopFocusMode()
                            userData.updateData()
                            
                        }.buttonStyle(.borderedProminent)
                    }
                }
//                Text("Points for today: \(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))")
//                ProgressView(value: Double(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date())),total: Double(1000))
                CircularProgressView(progress:Double(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))/1000,progressText: "Today:\n "+String(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))).frame(width: 250, height: 250).padding()
//            Info button
                Button(action: {
                    showAlert = true
                })
                {
                    Image(systemName: "info.circle")
                }
                .buttonStyle(.borderedProminent)
//                ScrollView {
//                    ForEach(userData.userData.focusModes,id: \.focusModeId) { mode in
//                        Text(mode.focusModeId.uuidString)
//                    }
//
//                }
               
            }.alert(isPresented: $showAlert, content: {
                Alert(
                    title: Text("Points"),
                    message: Text("The points are for personal motivation. They are calculated by giving 10 points for every minute of active focus mode and then 10 points for starting a focus mode. The starting focus mode bonus is capped at 100 points."),
                    dismissButton: .default(Text("OK"))
                )
            })
            .onChange(of: model.selectionToDiscourage) { newSelection in
                print(newSelection)
                ObjectPersistanceManager().saveDistractingAppsToPersistence(newSelection)
                print(model.selectionToDiscourage)
            }
                
        }
        
        
        .onAppear(perform: appStartup)
            .onAppear {
                Task {
                    do {
                        try await center.requestAuthorization(for: .individual)
                        MySchedule.setSchedule()
                        print("TEST")
                    }
                }
            }
            
        
        }
    func completed() -> Bool {
        if progress() >= 1{
            ObjectPersistanceManager().saveCurrentFocusMode()
            ObjectPersistanceManager().clearCurrentFocusMode()
            userData.updateData()
            return true
        }else {
            return false
        
        }
        }
    func getThisMorningDate() -> Date {
            let calendar = Calendar.current
            let components = calendar.dateComponents([.year, .month, .day], from: Date())
            return calendar.date(from: components)!
        }
        func progress() -> CGFloat {
            return (CGFloat(counter) / CGFloat(countTo))
        }
    
    }
private func checkUsage(){
        
}
struct Clock: View {
    var counter: Int
    var countTo: Int
     
    var body: some View {
        VStack {
            Text(counterToMinutes())
                .font(.system(size: 60))
                .fontWeight(.black)
        }
    }
     
    func counterToMinutes() -> String {
        let currentTime = countTo - counter
        let seconds = currentTime % 60
        let minutes = Int(currentTime / 60)
         
        return "\(minutes):\(seconds < 10 ? "0" : "")\(seconds)"
    }
}
//    private func addItem() {
//        withAnimation {
//            let newItem = Item(context: viewContext)
//            newItem.timestamp = Date()
//
//            do {
//                try viewContext.save()
//            } catch {
//                // Replace this implementation with code to handle the error appropriately.
//                // fatalError() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
//                let nsError = error as NSError
//                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
//            }
//        }
//    }
//
//    private func deleteItems(offsets: IndexSet) {
//        withAnimation {
//            offsets.map { items[$0] }.forEach(viewContext.delete)
//
//            do {
//                try viewContext.save()
//            } catch {
//                // Replace this implementation with code to handle the error appropriately.
//                // fatalError() causes the application to generate a crash log and terminate. You should not use this function in a shipping application, although it may be useful during development.
//                let nsError = error as NSError
//                fatalError("Unresolved error \(nsError), \(nsError.userInfo)")
//            }
//        }
//    }
//}


struct CircularProgressView: View {
    var progress: Double
    var progressText:String = ""
    
    var body: some View {
//        let progressText = String(format: "%.0f%%", progress * 100)
        let purpleAngularGradient = AngularGradient(
            gradient: Gradient(colors: [
                Color(red: 200/255, green: 168/255, blue: 240/255),
                Color(red: 71/255, green: 33/255, blue: 158/255)
            ]),
            center: .center,
            startAngle: .degrees(0),
            endAngle: .degrees(360.0 * progress))
        
        ZStack {
            Circle()
                .stroke(Color(.systemGray4), lineWidth: 20)
            Circle()
                .trim(from: 0, to: CGFloat(self.progress))
                .stroke(
                    purpleAngularGradient,
                    style: StrokeStyle(lineWidth: 20, lineCap: .round))
                .rotationEffect(Angle(degrees: -90))
                .overlay(
                    Text(progressText)
                        .multilineTextAlignment(.center)
                        .font(.system(size: 45))
                        .fontWeight(.black)
//                        .font(.system(size: 36, weight: .bold, design:.rounded))
//                        .foregroundColor(Color(.black))
                )
        }
    }
}

struct ContentView_Previews: PreviewProvider {
    static var previews: some View {
        ContentView(userData: CurrentUserData()).environmentObject(MyModel()).environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)
//        TotalActivityView()
    }
}

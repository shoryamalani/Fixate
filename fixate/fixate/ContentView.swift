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
    @State var leftData:SliderData = SliderData(side: .right)
    @State var rightData:SliderData = SliderData(side: .left)
    init(userData:CurrentUserData) {
        self.userData = userData;
        if(userData.userData.currentFocusSettings.focusMode != nil){
                pageIndex = 1
        }
        self.leftData = self.leftData.setFinishingFunc(finishingFunc: stopFocusMode)
        self.rightData = self.rightData.setFinishingFunc(finishingFunc:startFocusMode)
    }
    @State var pageIndex = 0
    let columns = [GridItem(.flexible()), GridItem(.flexible()), GridItem(.flexible())]
    @State var topSlider = SliderSide.right
    @State var sliderOffset: CGFloat = 0
    let minimumValue: Int = 15
    
    let maximumValue: Int = 120
//    init(userData:CurrentUserData) {
//        self.userData = userData;
//        self.leftData = SliderData(side: .left,finishingFunc: stopFocusMode)
//        self.rightData =  SliderData(side: .right,finishingFunc:startFocusMode )
//    }
    
    func appStartup () {
//        let account:FixateAccount? = ObjectPersistanceManager().retrieveAccount()
        checkAccount()
        print(ObjectPersistanceManager().getUserData()?.focusModes ?? "None")
        print(ObjectPersistanceManager().getUserData()?.currentFocusSettings ?? "None")
        
    }

    let redGradient = AngularGradient(gradient:
        Gradient(colors: [
            Color(red: 249/255, green: 77/255, blue: 83/255),
            Color(red: 249/255, green: 77/255, blue: 83/255),
//            Color(red: 40/255, green: 12/255, blue: 12/255)
        ]),
        center: .center,
        startAngle: .degrees(-90),
        endAngle: .degrees(270))
    
    let greenGradient = AngularGradient(gradient: Gradient(colors: [
        Color(red: 51/255, green: 224/255, blue: 94/255),
        Color(red: 51/255, green: 224/255, blue: 94/255),
//        Color(red: 13/255, green: 58/255, blue: 24/255)
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

        ZStack{
            content()
                .onChange(of: pageIndex){ newPageIndex in
                    if(newPageIndex == 1){
                        startFocusMode()
                    }else {
                        stopFocusMode()
                    }
                }
            if(userData.userData.currentFocusSettings.focusMode == nil){
                slider(data: $leftData).accessibility(identifier: "leftPull")
            
            }else{
                slider(data:$rightData).accessibility(identifier: "rightPull")
            
            }
            
        }
        
    }
    func slider(data: Binding<SliderData>) -> some View {
        let value = data.wrappedValue
        return ZStack {
            wave(data: data)
            button(data: value)
        }
        .zIndex(topSlider == value.side ? 1 : 0)
        .offset(x: value.side == .left ? -sliderOffset : sliderOffset)
    }
    func content() -> some View {
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
                    HStack{
                        Text("\(selectedNumber)\n minutes").multilineTextAlignment(.center)
                        //                        Center the text
                        Slider(value: Binding<Double>(
                            get: { Double(selectedNumber) },
                            set: { selectedNumber = Int($0) }
                        ), in: Double(minimumValue)...Double(maximumValue), step: 1)
                        .padding()
                        Spacer()
                         VStack{
                        Text("\(selectedNumber*10 + 10)\n points").multilineTextAlignment(.center)
                    }.background(Color(hex: 0x323d47)).cornerRadius(10)
                    }.background(Color(hex: 0x323d47)).cornerRadius(10).padding()
                    Button {
                        isDiscouragedPresented = true
                    } label:{
                        Text("Apps to block")
                            .font(Font.body.bold())
                            .padding()
                            .foregroundColor(Color.primary)
                            .colorInvert()
                    }.myButtonStyle()
                        .buttonStyle(.borderedProminent)
                        .familyActivityPicker(isPresented: $isDiscouragedPresented, selection: $modelPublic.selectionToDiscourage)
                } else {
                    
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
                    
                }
                //                Text("Points for today: \(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))")
                //                ProgressView(value: Double(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date())),total: Double(1000))
                //                CircularProgressView(progress:Double(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))/1000,progressText: "Today:\n "+String(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))).frame(width: 250, height: 250).padding()
                //            Info button
                if ( userData.userData.currentFocusSettings.focusMode == nil){
                    Button {
                        showAlert = true
                    } label: {
                        Image(systemName: "info.circle")
                            .font(Font.body.bold())
                            .imageScale(.large)
                            .padding()
                            .foregroundColor(Color.primary)
                            .colorInvert()
                    }.myButtonStyle()
                        .buttonStyle(.borderedProminent)
                    HStack{
                        VStack{
                            VStack{
                                Text("Distracting Apps/Categories").padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0))
                            ScrollView{
                                LazyVGrid(columns: columns) {
                                    ForEach(Array(modelPublic.selectionToDiscourage.applicationTokens), id: \.self) { app in
                                        
                                        Label(app).labelStyle(.iconOnly).scaleEffect(2, anchor: .center).padding(EdgeInsets(top: 30, leading: 0, bottom: 10, trailing: 0)).frame(width:40,height:40)
                                    
                                    
                                    }
                                    ForEach(Array(modelPublic.selectionToDiscourage.categoryTokens), id: \.self) { app in
                                        Label(app).labelStyle(.iconOnly).scaleEffect(1.5, anchor: .center).padding(EdgeInsets(top: 30, leading: 0, bottom: 10, trailing: 0)).frame(width:40,height:40)
                                    }
                                }.padding(EdgeInsets(top: 10, leading: 0, bottom: 0, trailing: 0))
                            
                            }
                            }.background(Color(hex: 0x323d47)).cornerRadius(10)
//                            VStack{
//                                Text("Distracting Categories")
//                                ScrollView{
//                                    LazyVGrid(columns: columns) {
//
//                                    }
//                                }
//                            }.background(Color(hex: 0x323d47)).cornerRadius(10)
                        }
                        
                    }.padding(EdgeInsets(top: 0, leading: 20, bottom: 0, trailing: 20))
                         
                    Text("Swipe left to start a focus mode")
                        .font(.headline)
                        .padding(.top, 20)
                    //                ScrollView {
                    //                    ForEach(userData.userData.focusModes,id: \.focusModeId) { mode in
                    //                        Text(mode.focusModeId.uuidString)
                    //                    }
                    //
                    //                }
                }
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
    
    func startFocusMode(){
        print("AM I EVEN RUN")
        MySchedule.startTimedFocusMode(num: Double(selectedNumber),focusMode: nil)
        userData.updateData()
    }
    func stopFocusMode(){
        if(userData.userData.currentFocusSettings.focusMode?.focusMode != nil){
            ObjectPersistanceManager().ignoreCurrentFocusMode()
            MyModel.shared.stopFocusMode()
            userData.updateData()
        } else {
            MyModel.shared.stopFocusMode()
            userData.updateData()
        }
    }
    
     func button(data: SliderData) -> some View {
         let aw = (data.side == .left ? 1 : -1) * Config.arrowWidth / 2
         let ah = Config.arrowHeight / 2
         return ZStack {
             circle(radius: Config.buttonRadius).stroke().opacity(0.2)
             polyline(-aw, -ah, aw, 0, -aw, ah).stroke(Color.white, lineWidth: 2)
         }
         .offset(data.buttonOffset)
         .opacity(data.buttonOpacity)
     }

     func wave(data: Binding<SliderData>) -> some View {
         let gesture = DragGesture().onChanged {
             self.topSlider = data.wrappedValue.side
             data.wrappedValue = data.wrappedValue.drag(value: $0)
         }
         .onEnded {
             if data.wrappedValue.isCancelled(value: $0) {
                 withAnimation(.spring(dampingFraction: 0.5)) {
                     data.wrappedValue = data.wrappedValue.initial()
                 }
             } else {
                 self.swipe(data: data)
             }
         }
         .simultaneously(with: TapGesture().onEnded {
             self.topSlider = data.wrappedValue.side
             self.swipe(data: data)
         })
         return WaveView(data: data.wrappedValue).gesture(gesture)
             .foregroundColor(Config.colors[data.wrappedValue.side == .left ? 0:1])
     }

     private func swipe(data: Binding<SliderData>) {
         withAnimation() {
             data.wrappedValue = data.wrappedValue.final()
         }
         DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
             self.pageIndex = self.index(of: data.wrappedValue)
             self.leftData = self.leftData.initial()
             self.rightData = self.rightData.initial()

             self.sliderOffset = 100
             withAnimation(.spring(dampingFraction: 0.5)) {
                 self.sliderOffset = 0
             }
         }
     }

     private func index(of data: SliderData) -> Int {
         let last = Config.colors.count - 1
         if data.side == .left {
             return pageIndex == 0 ? last : pageIndex - 1
         } else {
             return pageIndex == last ? 0 : pageIndex + 1
         }
     }

     private func circle(radius: Double) -> Path {
         return Path { path in
             path.addEllipse(in: CGRect(x: -radius, y: -radius, width: radius * 2, height: radius * 2))
         }
     }

     private func polyline(_ values: Double...) -> Path {
         return Path { path in
             path.move(to: CGPoint(x: values[0], y: values[1]))
             for i in stride(from: 2, to: values.count, by: 2) {
                 path.addLine(to: CGPoint(x: values[i], y: values[i + 1]))
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

struct MyButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        configuration.label
            .background(Capsule()
                            .foregroundColor(configuration.isPressed ? Color(.sRGB, red:0.71, green:0.985, blue:0.089, opacity:1.0) : Color.primary))
            .scaleEffect(configuration.isPressed ? CGFloat(0.8) : 1.0)
            .rotationEffect(.degrees(configuration.isPressed ? -19.0 : 0))
            .blur(radius: configuration.isPressed ? CGFloat(1.2) : 0)
            .animation(Animation.spring(response: 0.32, dampingFraction: 0.4, blendDuration: 1), value: configuration.isPressed)
    }
}

struct ErrorButtonStyle: ButtonStyle {
    func makeBody(configuration: Self.Configuration) -> some View {
        configuration.label
            .background(Capsule()
                            .foregroundColor(configuration.isPressed ? Color(.sRGB, red:0.71, green:0.985, blue:0.089, opacity:1.0) : Color.red))
            .scaleEffect(configuration.isPressed ? CGFloat(0.8) : 1.0)
            .rotationEffect(.degrees(configuration.isPressed ? -19.0 : 0))
            .blur(radius: configuration.isPressed ? CGFloat(1.2) : 0)
            .animation(Animation.spring(response: 0.32, dampingFraction: 0.4, blendDuration: 1), value: configuration.isPressed)
    }

}
extension Button {
    func myButtonStyle() -> some View {
        self.buttonStyle(MyButtonStyle())
    }
    func errorButtonStyle() -> some View {
        self.buttonStyle(ErrorButtonStyle())
    }
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
        ContentView(userData: CurrentUserData())
            .environmentObject(MyModel()).environment(\.managedObjectContext, PersistenceController.preview.container.viewContext)

    }
}

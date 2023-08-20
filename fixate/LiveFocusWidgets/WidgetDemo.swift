//
//  WidgetDemo.swift
//  WidgetDemo
//
//  Created by Ming on 28/7/2022.
//

import ActivityKit
import WidgetKit
import SwiftUI
import Combine


@main
struct Widgets: WidgetBundle {
   var body: some Widget {
       LiveFocusActivityWidget()
   }
}
class TimerWrapper: ObservableObject {
    @Published var currentTime: TimeInterval = 0
    private var timer: Timer?

    func start(withTimeInterval interval: Double) {
        timer?.invalidate()
        timer = Timer.scheduledTimer(withTimeInterval: interval, repeats: true) { _ in
            self.currentTime += interval
        }
    }

    func stop() {
        timer?.invalidate()
        timer = nil
    }
}
struct ProgressBar: View {
    @ObservedObject var timerWrapper: TimerWrapper
    var totalTime: TimeInterval

    var body: some View {
        GeometryReader { geometry in
            let progress = min(timerWrapper.currentTime / totalTime, 1)
            let width = geometry.size.width * CGFloat(progress)
            Rectangle()
                .fill(Color.green)
                .frame(width: width, height: geometry.size.height)
        }
    }
}
struct TimerBarView: View {
    let startDate: Date
    let endDate: Date
    let timer: Publishers.Autoconnect<Timer.TimerPublisher>
    
    
    
    

    @State private var currentDate = Date()
    
    var body: some View {
        GeometryReader { geometry in
            ZStack(alignment: .leading) {
                           Rectangle()
                               .frame(width: geometry.size.width, height: 10)
                               .foregroundColor(Color.gray.opacity(0.5))
                               .opacity(currentDate != startDate ? 0 : 1) // Fade-in when currentDate changes
                           
                           Rectangle()
                               .frame(width: calculateProgress(geometry: geometry), height: 10)
                               .foregroundColor(Color.blue)
                       }
                       .onReceive(timer) { _ in
                           withAnimation(.easeInOut) {
                               currentDate = Date()
                           }
                       }
        }
    }
    
    private func calculateProgress(geometry: GeometryProxy) -> CGFloat {
        let totalWidth = geometry.size.width
        let totalDuration = endDate.timeIntervalSince(startDate)
        let elapsedDuration = currentDate.timeIntervalSince(startDate)
        let progress = CGFloat(elapsedDuration / totalDuration)
        
        
        return totalWidth * progress
    }
}
struct LiveFocusActivityWidget: Widget {

    let timer = Timer.publish(every: 1, on: .main, in: .common).autoconnect()
    @State private var counter = 0
    var body: some WidgetConfiguration {
        
        ActivityConfiguration(for: LiveFocusAttributes.self) { context in
            // MARK: - For devices that don't support the Dynamic Island.
            VStack(alignment: .leading) {
                HStack {
                    HStack() {
                        
//                        ZStack {
//                            RoundedRectangle(cornerRadius: 15)
//                                .fill(.secondary)
//                            HStack {
//                                RoundedRectangle(cornerRadius: 15)
//                                    .fill(.blue)
//                                    .frame(width: 50)
//                                Image(systemName: "brain.head.profile")
//                                    .foregroundColor(.white)
//                                    .padding(.leading, -25)
//                                Image(systemName: "arrow.forward")
//                                    .foregroundColor(.white.opacity(0.5))
//                                Image(systemName: "ellipsis")
//                                    .foregroundColor(.white.opacity(0.5))
//
//                                Image(systemName: "ellipsis")
//                                    .foregroundColor(.white.opacity(0.5))
//                                Image(systemName: "arrow.forward")
//                                    .foregroundColor(.white.opacity(0.5))
//                                Image(systemName: "arrow.up")
//                                    .foregroundColor(.white)
//                                    .background(.black)
//                                    .clipShape(Circle())
//                            }
//                        }
//                         make a countdown timer
                        ProgressView(
                            timerInterval: context.state.completionTime,
                            countsDown: false,
                            label: { EmptyView() },
                            currentValueLabel: { Text(timerInterval: context.state.completionTime, countsDown: true)
                                    .bold()
                                    .font(.caption)
                                    .foregroundColor(.white.opacity(0.8))
                                    .multilineTextAlignment(.center)
                            }
                        ).progressViewStyle(.circular)
                      .padding(.horizontal)
//                        Text("\(counter) points!")
//                            .font(.headline)
                    }.onReceive(timer) { time in
                        if counter == 5 {
                            timer.upstream.connect().cancel()
                        } else {
                            print("The time is now \(time)")
                        }

                        counter += 1
                    }
//                    Spacer()
//                    VStack {
//                        Text("\(context.state.points)")
//                            .font(.title)
//                            .bold()
//                        Spacer()
//                    }
                }.padding(5)
//                Text("You've already paid: \(context.attributes.totalAmount) + $9.9 Delivery Fee 💸")
//                    .font(.caption)
//                    .foregroundColor(.secondary)
//                    .padding(.horizontal, 5)
            }.padding(15)
            // MARK: - For Dynamic Island
        } dynamicIsland: { context in
            DynamicIsland {
                DynamicIslandExpandedRegion(.leading) {
//                    Label("\(context.state.points) Points", systemImage: "bag")
//                        .font(.title3)
                }
                DynamicIslandExpandedRegion(.trailing) {
                    Label {
                        Text(timerInterval: context.state.completionTime, countsDown: true)
                            .multilineTextAlignment(.trailing)
                            .frame(width: 50)
                            .monospacedDigit()
                            .font(.caption2)
                    } icon: {
                        Image(systemName: "timer")
                    }
                    .font(.title2)
                }
                DynamicIslandExpandedRegion(.center) {
//                    Text("\(context.state.points) Points!")
//                        .lineLimit(1)
//                        .font(.caption)
//                        .foregroundColor(.secondary)
                }
                DynamicIslandExpandedRegion(.bottom) {
                    // Deep Linking
//                    HStack {
//                        Link(destination: URL(string: "pizza://contact+TIM")!) {
//                             Label("Contact driver", systemImage: "phone.circle.fill")
//                                .font(.caption)
//                                .padding()
//                         }.background(Color.accentColor)
//                         .clipShape(RoundedRectangle(cornerRadius: 15))
//                        Spacer()
//                        Link(destination: URL(string: "pizza://cancelOrder")!) {
//                             Label("Cancel Order", systemImage: "xmark.circle.fill")
//                                .font(.caption)
//                                .padding()
//                         }.background(Color.red)
//                         .clipShape(RoundedRectangle(cornerRadius: 15))
//                    }
                }
            } compactLeading: {
//                Label {
////                    Text("\(context.state.points) Points")
//                } icon: {
//                    Image(systemName: "bag")
//                }
//                .font(.caption2)
            } compactTrailing: {
                Text(timerInterval: context.state.completionTime, countsDown: true)
                    .multilineTextAlignment(.center)
                    .frame(width: 40)
                    .font(.caption2)
            } minimal: {
                VStack(alignment: .center) {
                    Image(systemName: "timer")
                    Text(timerInterval: context.state.completionTime, countsDown: true)
                        .multilineTextAlignment(.center)
                        .monospacedDigit()
                        .font(.caption2)
                }
            }
            .keylineTint(.accentColor)
        }
    }
}

//struct PizzaAdActivityWidget: Widget {
//    var body: some WidgetConfiguration {
//        ActivityConfiguration(for: PizzaAdAttributes.self) { context in
//            HStack {
//                let logo = UserDefaults(suiteName: "group.io.startway.iOS16-Live-Activities")?.data(forKey: "pizzaLogo")
//                if (logo != nil) {
//                    Image(uiImage: UIImage(data: logo!)!)
//                        .resizable()
//                        .scaledToFit()
//                        .frame(width: 64, height: 64)
//                        .cornerRadius(15)
//                }
//                Spacer()
//                VStack(alignment: .leading) {
//                    Text(context.state.adName).font(.caption).foregroundColor(.secondary)
//                    Text("Get \(Text(context.attributes.discount).fontWeight(.black).foregroundColor(.blue)) OFF").bold().font(.system(size: 25)).foregroundColor(.secondary)
//                    Text("when purchase 🍕 every $500").font(.callout).italic().lineLimit(1)
//                }.padding(.trailing)
//            }.padding()
//        } dynamicIsland: { context in
//            DynamicIsland {
//                DynamicIslandExpandedRegion(.leading) {
//                    Label(context.attributes.discount, systemImage: "dollarsign.arrow.circlepath")
//                        .font(.title2)
//                }
//                DynamicIslandExpandedRegion(.trailing) {
//                    Label {
//                        Text("Ads")
//                            .multilineTextAlignment(.trailing)
//                            .frame(width: 50)
//                            .monospacedDigit()
//                            .font(.caption2)
//                    } icon: {
//                        Image(systemName: "dollarsign.circle.fill")
//                    }
//                    .font(.title2)
//                }
//                DynamicIslandExpandedRegion(.center) {
//                    Text(context.state.adName)
//                        .lineLimit(1)
//                        .font(.caption)
//                }
//                DynamicIslandExpandedRegion(.bottom) {
//                    Button {
//                        // Deep link into the app.
//                    } label: {
//                        Label("Pay now", systemImage: "creditcard")
//                    }
//                }
//            } compactLeading: {
//                Label {
//                    Text(context.attributes.discount)
//                } icon: {
//                    Image(systemName: "dollarsign.circle.fill")
//                }
//                .font(.caption2)
//                .foregroundColor(.red)
//            } compactTrailing: {
//                Text("Due")
//                    .multilineTextAlignment(.center)
//                    .frame(width: 40)
//                    .font(.caption2)
//            } minimal: {
//                VStack(alignment: .center) {
//                    Image(systemName: "dollarsign.circle.fill")
//                    Text(context.attributes.discount)
//                        .multilineTextAlignment(.center)
//                        .monospacedDigit()
//                        .font(.caption2)
//                }
//            }
//            .keylineTint(.accentColor)
//        }
//    }
//}

// Preview available on iOS 16.2 or above
@available(iOSApplicationExtension 16.2, *)
struct LiveFocusActivityWidget_Previews: PreviewProvider {
    static let activityAttributes = LiveFocusAttributes(focusMode: FocusMode(focusModeId: UUID(), startTime: Date().addingTimeInterval(-1*60), ExpectedEndTime: Date().addingTimeInterval(15*60), isBlocking: true, isConnectedToFocusMode: false, pauseCount: 0, pausesAllowed: false))
    static let activityState = LiveFocusAttributes.ContentState(points:50, completionTime: Date().addingTimeInterval(-1*60)...Date().addingTimeInterval(15*60))
    
    static var previews: some View {
        activityAttributes
            .previewContext(activityState, viewKind: .content)
            .previewDisplayName("Notification")
        
        activityAttributes
            .previewContext(activityState, viewKind: .dynamicIsland(.compact))
            .previewDisplayName("Compact")
        
        activityAttributes
            .previewContext(activityState, viewKind: .dynamicIsland(.expanded))
            .previewDisplayName("Expanded")
        
        activityAttributes
            .previewContext(activityState, viewKind: .dynamicIsland(.minimal))
            .previewDisplayName("Minimal")
    }
}

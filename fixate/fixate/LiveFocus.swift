//
//  LiveFocus.swift
//  fixate
//
//  Created by Shorya Malani on 8/12/23.
//

import Foundation
import ActivityKit


struct LiveFocusAttributes: ActivityAttributes {
    public typealias LiveFocusStatus = ContentState

    public struct ContentState: Codable, Hashable {
        var points: Int
        var completionTime: ClosedRange<Date>
    }

    var focusMode: FocusMode
}
class LiveFocusManager {
    
    func startLiveFocus(_ focusMode:FocusMode) {
        print(ActivityAuthorizationInfo().areActivitiesEnabled)
        
        let liveFocusAttributes = LiveFocusAttributes(focusMode: focusMode)

        let initialContentState = LiveFocusAttributes.LiveFocusStatus(points: 10, completionTime:  focusMode.startTime...focusMode.ExpectedEndTime)
    //  create ActivityContent<LiveFocusAttributes.ContentState>
        let content = ActivityContent<LiveFocusAttributes.ContentState>(state: initialContentState, staleDate: Date.distantFuture)
        

                                                  
        do {
            let LiveFocusActivity = try Activity<LiveFocusAttributes>.request(
                attributes: liveFocusAttributes,
                content:    content,
                pushType: .token)   // Enable Push Notification Capability First (from pushType: nil)
            
            print("Requested a Live Focus Live Activity \(LiveFocusActivity.id)")

            // Send the push token to server
            Task {
                for await pushToken in LiveFocusActivity.pushTokenUpdates {
                    let pushTokenString = pushToken.reduce("") { $0 + String(format: "%02x", $1) }
                    print(pushTokenString)
                    
    //                alertMsg = "Requested a pizza delivery Live Activity \(LiveFocusActivity.id)\n\nPush Token: \(pushTokenString)"
    //                showAlert = true
                }
            }
        } catch (let error) {
            print("Error requesting pizza delivery Live Activity \(error.localizedDescription)")
    //        alertMsg = "Error requesting pizza delivery Live Activity \(error.localizedDescription)"
    //        showAlert = true
        }
    }
    // Honestly update funcitionality is not needed till later
    //func updateDeliveryPizza() {
    //    Task {
    //        let updatedDeliveryStatus = LiveFocusAttributes.LiveFocusStatus(driverName: "TIM 👨🏻‍🍳", estimatedDeliveryTime: Date()...Date().addingTimeInterval(60 * 60))
    //
    //        for activity in Activity<LiveFocusAttributes>.activities{
    //            await activity.update(using: updatedDeliveryStatus)
    //        }
    //
    //        print("Updated pizza delivery Live Activity")
    //
    //        showAlert = true
    //        alertMsg = "Updated pizza delivery Live Activity"
    //    }
    //}
    func endLiveFocus() {
        Task {
            for activity in Activity<LiveFocusAttributes>.activities{
                await activity.end(dismissalPolicy: .immediate)
            }

            print("Cancelled pizza delivery Live Activity")

    //        showAlert = true
    //        alertMsg = "Cancelled pizza delivery Live Activity"
        }
    }
    func showAllDeliveries() {
        Task {
            for activity in Activity<LiveFocusAttributes>.activities {
                print("Live Focus details: \(activity.id) -> \(activity.attributes)")
            }
        }
    }

    //For use later when we start pushing people to start live focus modes
    //struct PizzaAdAttributes: ActivityAttributes {
    //    public typealias PizzaAdStatus = ContentState
    //
    //    public struct ContentState: Codable, Hashable {
    //        var adName: String
    //        var showTime: Date
    //    }
    //    var discount: String
    //}


}

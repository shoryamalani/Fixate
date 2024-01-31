//
//  TotalActivityView.swift
//  activityReport
//
//  Created by Shorya Malani on 7/23/23.
//

import SwiftUI

struct TotalActivityView: View {
//    let totalActivity: String
//
//    var body: some View {
//        Text(totalActivity)
//    }
    @AppStorage("settedHour") var settedHour: Int = UserDefaults.standard.integer(forKey: "settedHour")
    @AppStorage("settedMinute") var settedMinute: Int = UserDefaults.standard.integer(forKey: "settedMinute")
    let totalActivity: String

    var body: some View {
        Text("Hello")
        Text(totalActivity)
        Text("\(settedHour)")
        Text("\(settedMinute)")
    }
}

// In order to support previews for your extension's custom views, make sure its source files are
// members of your app's Xcode target as well as members of your extension's target. You can use
// Xcode's File Inspector to modify a file's Target Membership.
struct TotalActivityView_Previews: PreviewProvider {
    static var previews: some View {
        TotalActivityView(totalActivity: "1h 23m")
    }
}

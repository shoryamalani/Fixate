//
//  activityReport.swift
//  activityReport
//
//  Created by Shorya Malani on 7/23/23.
//

import DeviceActivity
import SwiftUI

@main
struct activityReport: DeviceActivityReportExtension {
    var body: some DeviceActivityReportScene {
        // Create a report for each DeviceActivityReport.Context that your app supports.
        TotalActivityReport { totalActivity in
            TotalActivityView(totalActivity: totalActivity)
        }
        // Add more reports here...
    }
}

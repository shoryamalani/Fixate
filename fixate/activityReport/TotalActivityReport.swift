//
//  TotalActivityReport.swift
//  activityReport
//
//  Created by Shorya Malani on 7/23/23.
//

import DeviceActivity
import SwiftUI

extension DeviceActivityReport.Context {
    // If your app initializes a DeviceActivityReport with this context, then the system will use
    // your extension's corresponding DeviceActivityReportScene to render the contents of the
    // report.
    static let totalActivity = Self("Total Activity")
}

struct TotalActivityReport: DeviceActivityReportScene {
    // Define which context your scene will represent.
    let context: DeviceActivityReport.Context = .totalActivity
    
    // Define the custom configuration and the resulting view for this report.
    let content: (String) -> TotalActivityView
    
    func makeConfiguration(representing data: DeviceActivityResults<DeviceActivityData>) async -> String {
        // Reformat the data into a configuration that can be used to create
        // the report's view.
//        print(data)
//        print("DATA ABOVE")
        let formatter = DateComponentsFormatter()
        formatter.allowedUnits = [.day, .hour, .minute, .second]
        formatter.unitsStyle = .abbreviated
        formatter.zeroFormattingBehavior = .dropAll
        
        var totalActivityDuration =  await data.flatMap { $0.activitySegments }.reduce(0, {
            $0 + $1.totalActivityDuration
        })
        var appHash: [String:Double] = [:]
        var iterator = data.makeAsyncIterator();
        var next = await iterator.next()
        
        while(next != nil){
            
            var segments = next!.activitySegments.makeAsyncIterator()

            var segNext = await segments.next();
            while (segNext != nil){
                var catsIterator = segNext!.categories.makeAsyncIterator()
                var catsNext = await catsIterator.next();
//
                while(catsNext != nil){
                    var appsIter = catsNext!.applications.makeAsyncIterator()

//                    appNames.append(catsNext!.category.localizedDisplayName!)
                    var appsNext = await appsIter.next()
                    while(appsNext != nil){
                        if(appsNext!.application.localizedDisplayName != nil){
                            if let count = appHash[appsNext!.application.localizedDisplayName!]{
                                appHash.updateValue(appHash[appsNext!.application.localizedDisplayName!]!+appsNext!.totalActivityDuration, forKey: appsNext!.application.localizedDisplayName!)
                            }else{
                                appHash[appsNext!.application.localizedDisplayName!] = appsNext!.totalActivityDuration
                            }
                        }
                        appsNext = await appsIter.next()

                        
                    }
                    catsNext = await catsIterator.next()
                }
                segNext = await segments.next();
            }
            
            next =  await iterator.next()
        }
//        var hasData = true;
//        var iterator = data.makeAsyncIterator();
//        while(hasData){
//            var curData = await iterator.next();
//            if(!(curData == nil)){
//                var time = curData!.activitySegments.makeAsyncIterator()
//                var hasTime = true;
//                while(hasTime){
//                    var curTime = await time.next()
//                    if(!(curTime==nil)){
//                        totalActivityDuration += Int(curTime!.totalActivityDuration)
//                    }
//                }
//            }
//
        var finalString = ""
        
        for (app, val) in appHash {
            finalString += "\(app) \(formatter.string(from:val) ?? "No data")\n"
        }
        return finalString
    }
}

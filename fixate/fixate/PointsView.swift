//
//  PointsView.swift
//  fixate
//
//  Created by Shorya Malani on 8/7/23.
//

import SwiftUI

struct PointsView: View { 
    @ObservedObject var userData:CurrentUserData;
    var body: some View {
        VStack{
            ScrollView{
                CircularProgressView(progress:Double(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))/1000,progressText: "Today:\n "+String(userData.calculatePoints(startTime:getThisMorningDate() , endTime: Date()))).frame(width: 250, height: 250).padding()
                CircularProgressView(progress:Double(userData.calculatePoints(startTime:getThisWeek() , endTime: Date()))/5000,progressText: "Week:\n "+String(userData.calculatePoints(startTime:getThisWeek() , endTime: Date()))).frame(width: 250, height: 250).padding()
                CircularProgressView(progress:Double(userData.calculatePoints(startTime:getThisMonth() , endTime: Date()))/20000,progressText: "Month:\n "+String(userData.calculatePoints(startTime:getThisMonth() , endTime: Date()))).frame(width: 250, height: 250).padding()
            }.scrollIndicators(ScrollIndicatorVisibility.hidden)
        }
    
    }
    func getThisMorningDate() -> Date {
            let calendar = Calendar.current
            let components = calendar.dateComponents([.year, .month, .day], from: Date())
            return calendar.date(from: components)!
        
    
    }
    func getThisWeek() -> Date {
//            Return start of this week
            let calendar = Calendar.current
        let components = calendar.dateComponents([.yearForWeekOfYear, .weekOfYear], from: Date())
            return calendar.date(from: components)!
    }
    func getThisMonth() -> Date {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.year, .month], from: Date())
        return calendar.date(from: components)!
    
    }
    
}



struct PointsView_Previews: PreviewProvider {
    static var previews: some View {
        PointsView(userData: CurrentUserData())
    }
}

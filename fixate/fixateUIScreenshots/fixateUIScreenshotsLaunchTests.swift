//
//  fixateUIScreenshotsLaunchTests.swift
//  fixateUIScreenshots
//
//  Created by Shorya Malani on 9/3/23.
//

import XCTest

final class fixateUIScreenshotsLaunchTests: XCTestCase {

    override class var runsForEachTargetApplicationUIConfiguration: Bool {
        true
    }

    override func setUpWithError() throws {
        continueAfterFailure = false
    }

    func testLaunch() throws {
        let app = XCUIApplication()
        setupSnapshot(app)
        app.launch()
        snapshot("0Start")
        app.buttons["Apps to block"].tap()
        if(app.collectionViews.switches["Games"].images["circle"].exists){
            app.collectionViews.switches["Games"].images["circle"].tap()
        }
        snapshot("01Picking")
        app.navigationBars["Choose Activities"]/*@START_MENU_TOKEN@*/.buttons["Done"]/*[[".otherElements[\"Done\"].buttons[\"Done\"]",".buttons[\"Done\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.tap()
        
        
    
        
//        swipe left on the element with the identifier pullLeft
        
        app.otherElements["leftPull"].tap()
        sleep(180)
//        sleep(1)
        snapshot("02focus")
                        
        let focusModeAttachment = XCTAttachment(screenshot: app.screenshot())
        focusModeAttachment.name = "Focus Mode"
        focusModeAttachment.lifetime = .keepAlways
        add(focusModeAttachment)
        app.otherElements["rightPull"].tap()

                                                                                    
        let tabBar = app.tabBars["Tab Bar"]
        let computerButton = tabBar.buttons["Computer"]
        computerButton.tap()
        snapshot("03Computer")
        tabBar.buttons["Progress"].tap()
        snapshot("04Progress")
        tabBar.buttons["Schedule"].tap()
        app.buttons["Select Apps That Be Blocked after 0 minutes"].tap()
        
        let collectionViewsQuery = app.collectionViews
        if(app.collectionViews.switches["Games"].images["circle"].exists){
            app.collectionViews.switches["Games"].images["circle"].tap()
        }
        app.navigationBars["Choose Activities"]/*@START_MENU_TOKEN@*/.buttons["Done"]/*[[".otherElements[\"Done\"].buttons[\"Done\"]",".buttons[\"Done\"]"],[[[-1,1],[-1,0]]],[0]]@END_MENU_TOKEN@*/.tap()
        app.sliders["0"].swipeRight()
        snapshot("05Schedule")
                                

            
        
       
        
        // Insert steps here to perform after app launch but before taking a screenshot,
        // such as logging into a test account or navigating somewhere in the app
                        
        let attachment = XCTAttachment(screenshot: app.screenshot())
        attachment.name = "Launch Screen"
        attachment.lifetime = .keepAlways
        add(attachment)
    }
}

//
//  fixateApp.swift
//  fixate
//
//  Created by Shorya Malani on 7/22/23.
//

import SwiftUI

@main
struct fixateApp: App {
    let persistenceController = PersistenceController.shared

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environment(\.managedObjectContext, persistenceController.container.viewContext)
        }
    }
}

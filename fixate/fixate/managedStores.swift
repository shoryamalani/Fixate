//
//  managedStore.swift
//  fixate
//
//  Created by Shorya Malani on 7/22/23.
//

import Foundation
import ManagedSettings

extension ManagedSettingsStore.Name {
    static let social = Self("social")
    
}

func fixateSetup(){
    let socialStore = ManagedSettingsStore(named:.social)
    socialStore.shield.applicationCategories = .all()
    
}

//
//  ShieldConfigurationExtension.swift
//  shieldBranding
//
//  Created by Shorya Malani on 8/8/23.
//

import ManagedSettings
import ManagedSettingsUI
import UIKit

// Override the functions below to customize the shields used in various situations.
// The system provides a default appearance for any methods that your subclass doesn't override.
// Make sure that your class name matches the NSExtensionPrincipalClass in your Info.plist.

class ShieldConfigurationExtension: ShieldConfigurationDataSource {
    
    let shieldConfig = ShieldConfiguration(backgroundBlurStyle: UIBlurEffect.Style.dark, backgroundColor: UIColor(red: 0.0, green: 0.0, blue: 0.0, alpha: 0.5),icon: UIImage(named:"FixateIcon"),title: ShieldConfiguration.Label(text: "You are in a focus mode, so focus.\n- Fixate", color: UIColor.white))
    override func configuration(shielding application: Application) -> ShieldConfiguration {
        // Customize the shield as needed for applications.
        return shieldConfig
    }
    
    override func configuration(shielding application: Application, in category: ActivityCategory) -> ShieldConfiguration {
        // Customize the shield as needed for applications shielded because of their category.
        return shieldConfig
    }
    
    override func configuration(shielding webDomain: WebDomain) -> ShieldConfiguration {
        // Customize the shield as needed for web domains.
        return shieldConfig
    }
    
    override func configuration(shielding webDomain: WebDomain, in category: ActivityCategory) -> ShieldConfiguration {
        // Customize the shield as needed for web domains shielded because of their category.
        return shieldConfig
    }
}

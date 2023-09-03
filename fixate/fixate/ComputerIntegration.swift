//
//  ComputerIntegration.swift
//  fixate
//
//  Created by Shorya Malani on 8/4/23.
//

import SwiftUI
import Foundation
struct ComputerIntegration: View {
    @State private var connectCode:Int = 0
    @State var hasAccount = false
    
    var body: some View {
        
        VStack{
            if(hasAccount == false){
                Text("Connect your phone to your computer")
                    .font(.title)
                    .padding()
                if (connectCode != 0) {
                    //                show this without the comma
                    Text("Enter this code into the computer app in settings: \(connectCode)")
                    
                }else{
                    Text("Loading...")
                    
                }
            }
            else{
                Text("Your phone is already connected to your computer")
                    .font(.title)
                    .padding()
            
            }
            Link("Download the computer version", destination: URL(string: "https://www.fixateapp.dev")!)
                           .font(.headline)
                           .foregroundColor(.blue)
                           .padding()
        }.onAppear {
            let account = ObjectPersistanceManager().retrieveAccount()
            if(account == nil) {
                APIManager().getMobileConnectCode { result in
                    switch result {
                    case .success(let data):
                        // Handle the successful response data here
                        print("Received data: \(data)")
                        self.connectCode = data.connect_code
                        self.hasAccount = data.hasComputer
                    case .failure(let error):
                        // Handle the error here
                        print("Error: \(error.localizedDescription)")
                    }
                }
                
            }
        }
    }
}

struct ComputerIntegration_Previews: PreviewProvider {
    static var previews: some View {
        ComputerIntegration()
    }
}

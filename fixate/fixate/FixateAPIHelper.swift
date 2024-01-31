//
//  FixateAPIHelper.swift
//  fixate
//
//  Created by Shorya Malani on 8/2/23.
//

import Foundation
import UIKit

let BaseURL = "https://api.powertimetracking.shoryamalani.com/mobile"

struct ResponseStatus : Codable {
    var status:String
}

struct basicUUID :Codable {
 var device_id: String
}

func checkAccount(){
    do {
        let dataURL = URL(string:BaseURL + "/addMobileDeviceAndLogin")!
        var request = URLRequest(url: dataURL)
        request.httpMethod = "POST"
    
         
        // HTTP Request Parameters which will be sent in HTTP Request Body
//        let postString = "device_id=\(UIDevice.current.identifierForVendor?.uuidString)";
        // Set HTTP Request Body
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        //request.httpBody = postString.data(using: String.Encoding.utf8);
        let jsonData = try JSONEncoder().encode(basicUUID(device_id: UIDevice.current.identifierForVendor!.uuidString))
        request.httpBody = jsonData
        let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
                
                // Check for Error
                if let error = error {
                    print("Error took place \(error)")
                    return
                }
         
                // Convert HTTP Response Data to a String
                if let data = data, let dataString = String(data: data, encoding: .utf8) {
                    print("Response data string:\n \(dataString)")
                }
        }
        task.resume()
    }catch{
        print("No response")
    }
}

struct basicNotificationCode :Codable {
 var device_id: String
 var notification_code: String
}



func addMobileNotificationCode(code: String){
    do {
        let dataURL = URL(string:BaseURL + "/addMobileNotificationCode")!
        var request = URLRequest(url: dataURL)
        request.httpMethod = "POST"
        
        
        // HTTP Request Parameters which will be sent in HTTP Request Body
        //        let postString = "device_id=\(UIDevice.current.identifierForVendor?.uuidString)";
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        let jsonData = try JSONEncoder().encode(basicNotificationCode(device_id: UIDevice.current.identifierForVendor!.uuidString, notification_code: code))
        
        request.httpBody = jsonData
        
        let task = URLSession.shared.dataTask(with: request) { (data, response, error) in
            
            // Check for Error
            if let error = error {
                print("Error took place \(error)")
                return
            }
            
            // Convert HTTP Response Data to a String
            if let data = data, let dataString = String(data: data, encoding: .utf8) {
                print("Response data string:\n \(dataString)")
            }
        }
        task.resume()
    }catch{
        print("No response")
    }
}
 
struct mobileConectResponse : Codable {
    var status:String;
    var connect_code:Int
    var hasComputer:Bool
}
class APIManager {
    func getMobileConnectCode(completion: @escaping (Result<mobileConectResponse, Error>) -> Void) {
        
        do {
            let dataURL = URL(string:BaseURL + "/getMobileConnectCode")!
            var request = URLRequest(url: dataURL)
            request.httpMethod = "POST"
            
            
            // HTTP Request Parameters which will be sent in HTTP Request Body
            //        let postString = "device_id=\(UIDevice.current.identifierForVendor?.uuidString)";
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let jsonData = try JSONEncoder().encode(basicUUID(device_id: UIDevice.current.identifierForVendor!.uuidString))
            
            request.httpBody = jsonData
            
            let task = URLSession.shared.dataTask(with: request)  { (data, response, error)  in
                
                // Check for Error
                if let error = error {
                    print("Error took place \(error)")
                    
                }
                
                // Convert HTTP Response Data to a String
                if let data = data, let dataString = String(data: data, encoding: .utf8)  {
                    do {
//                        let vals = try mobileConectResponse(from: data as! Decoder)
                        let vals = try JSONDecoder().decode(mobileConectResponse.self, from: data)
                        print(vals.connect_code)
                        
                        completion(.success(vals))
                        
                        
                    }catch{
                        print("failed to decode")
                    }
                    print("Response data string:\n \(dataString)")
                }
                
            }
            return task.resume()
        }
        catch{
            print("No response")
        }
    }
    
    func getCurrentFocusMode(completion: @escaping (Result<FocusModeResponse, Error>) -> Void) {
        
        do {
            let dataURL = URL(string:BaseURL + "/isFocusModeRunning")!
            var request = URLRequest(url: dataURL)
            request.httpMethod = "POST"
            
            
            // HTTP Request Parameters which will be sent in HTTP Request Body
            //        let postString = "device_id=\(UIDevice.current.identifierForVendor?.uuidString)";
            request.setValue("application/json", forHTTPHeaderField: "Accept")
            request.setValue("application/json", forHTTPHeaderField: "Content-Type")
            let jsonData = try JSONEncoder().encode(basicUUID(device_id: UIDevice.current.identifierForVendor!.uuidString))
            
            request.httpBody = jsonData
            
            let task = URLSession.shared.dataTask(with: request)  { (data, response, error)  in
                // Check for Error
                if let error = error {
                    print("Error took place \(error)")
                    
                }
                
                // Convert HTTP Response Data to a String
                if let data = data, let dataString = String(data: data, encoding: .utf8)  {
                    do {
                        //                        let vals = try mobileConectResponse(from: data as! Decoder)
                        let vals = try JSONDecoder().decode(FocusModeResponse.self, from: data)
                        print(String(data: data, encoding: .utf8) )
                        print(vals.status)
                        
                        completion(.success(vals))
                        
                        
                    }catch{
                        print("failed to decode")
                        print(String(data: data, encoding: .utf8) )
                    }
//                    print("Response data string:\n \(dataString)")
                }
                
            }
            return task.resume()
        }
        catch{
            print("No response")
        }
    }
    
}


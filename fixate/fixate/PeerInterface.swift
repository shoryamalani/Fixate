//
//  PeerInterface.swift
//  fixate
//
//  Created by Shorya Malani on 8/4/24.
//

import SwiftUI
import Charts
import GameKit
struct Player: Hashable, Comparable {
    static func < (lhs: Player, rhs: Player) -> Bool {
        return rhs.score > lhs.score
    }
    
    let id = UUID()
    let name: String
    let score: String
    let image: UIImage?
}

struct PeerInterface: View {
    @AppStorage("GKGameCenterViewControllerState") var gameCenterViewControllerState:GKGameCenterViewControllerState = .default
    @AppStorage("IsGameCenterActive") var isGKActive:Bool = false
    var leaderboardIdentifier = "WeeklyScores"
    @State var playersList: [Player] = []
    
    @ObservedObject var userData:CurrentUserData;
    @EnvironmentObject var modelPublic: MyModel
    @State private var isDiscouragedPresented = false
    func authenticateUser() {
            GKLocalPlayer.local.authenticateHandler = { vc, error in
                guard error == nil else {
                    print(error?.localizedDescription ?? "")
                    return
                }
                let curScore = ObjectPersistanceManager().getCurrentWeeklyScore();
                
                
                GKLeaderboard.submitScore(50-curScore, context: 0, player: GKLocalPlayer.local, leaderboardIDs: ["WeeklyScores"]) { error in
                    if let error = error {
                        // Handle the error
                        print("Error submitting score: \(error.localizedDescription)")
                    } else {
                        // Score was successfully submitted
                        print("Score successfully submitted")
                    }
                }
                Task{
                    await loadLeaderboard(source: 3)
                }
            }
        }
    func loadLeaderboard(source: Int = 0) async {
        print(source)
        print("source")
        playersList.removeAll()
        Task {
            var playersListTemp: [Player] = []
            
            do {
                print("Loading leaderboards...")
                let leaderboards = try await GKLeaderboard.loadLeaderboards(IDs: [leaderboardIdentifier])
                print("Leaderboards loaded: \(leaderboards)")
                
                if let leaderboard = leaderboards.first(where: { $0.baseLeaderboardID == self.leaderboardIdentifier }) {
                    print("Leaderboard found: \(leaderboard)")
                    
                    let allPlayers = try await leaderboard.loadEntries(for: .friendsOnly, timeScope: .allTime, range: NSRange(1...5))
                    print("Leaderboard entries loaded: \(allPlayers.1)")
                    
                    if allPlayers.1.count > 0 {
                        for leaderboardEntry in allPlayers.1 {
                            print("Loading photo for player: \(leaderboardEntry.player.displayName)")
                            
                            let image = try await leaderboardEntry.player.loadPhoto(for: .small)
                            print("Photo loaded for player: \(leaderboardEntry.player.displayName)")
                            
                            playersListTemp.append(Player(name: leaderboardEntry.player.displayName, score: leaderboardEntry.formattedScore, image: image))
                        }
                        
                        playersListTemp.sort {
                            $0.score < $1.score
                        }
                    } else {
                        print("No players found in leaderboard.")
                    }
                } else {
                    print("No matching leaderboard found.")
                }
            } catch {
                print("Error loading leaderboard: \(error)")
            }
            
            print("Final playersListTemp: \(playersListTemp)")
            
            // Ensure UI updates happen on the main thread
            DispatchQueue.main.async {
                self.playersList = playersListTemp
            }
        }
    }
    var body: some View {
        VStack{
            Button {
                isDiscouragedPresented = true;
                ObjectPersistanceManager().saveSelectionForCompetitionToPersistance(modelPublic.competitionToDiscourage)
                MySchedule.scheduleCompetitionFocus()
                
            } label:{
                Text("Apps To Count For Weekly Competitions")
                    .font(Font.body.bold())
                    .padding()
                    .foregroundColor(Color.primary)
                    .colorInvert()
            }.myButtonStyle()
                .buttonStyle(.borderedProminent)
                .familyActivityPicker(isPresented: $isDiscouragedPresented, selection: $modelPublic.competitionToDiscourage)
            Spacer()
            Chart(ObjectPersistanceManager().getDistractionsPerDay().reversed(), id: \.day){ item in
                BarMark(
                    x: .value("Day", item.day),
                    y: .value("Hours Distracted", item.hours)
                ).foregroundStyle(Color.red)
            }.frame(height: 200)
            Spacer()
//            if(GKLocalPlayer.local.isAuthenticated != true){
//                // Button to authenticate
//                Button {
//                    
//                    GKLocalPlayer.local.authenticateHandler = { vc, error in
//                        guard error == nil else {
//                            print(error?.localizedDescription ?? "")
//                            return
//                        }
//                    }
//                } label:
//                {
//                    Text("Log in to Game Center").font(Font.body.bold())
//                        .padding()
//                        .foregroundColor(Color.primary)
//                        .colorInvert()
//                }.myButtonStyle()
                
//            }else{
                
                VStack{
                    ScrollView(.horizontal, showsIndicators: false)
                    {
                        HStack(spacing: 10){
                            ForEach(playersList, id: \.self) { item in
                                VStack{
                                    Image(uiImage: item.image!)
                                        .resizable()
                                        .frame(width: 72, height: 72, alignment: .center)
                                        .clipShape(Circle())
                                    Text(item.name)
                                        .font(Font.custom("Avenir",size: 10))
                                        .fontWeight(.heavy)
                                        .lineLimit(1)
                                        .foregroundColor(.white)
                                        .truncationMode(.middle)
                                        .frame(minWidth:105,idealWidth:105,maxWidth:105)
                                    Text(item.score)
                                        .font(Font.custom("Avenir",size: 10))
                                        .foregroundColor(.white)
                                }.padding(5)
                            }
                        }
                    }
                    .padding(.leading, 10.0)
                    
                }.onAppear{
                    if !GKLocalPlayer.local.isAuthenticated {
                        authenticateUser()
                    } else if playersList.count == 0 {
                        Task{
                            await loadLeaderboard(source: 1)
                        }
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.75) {
                        // 7.
                        withAnimation {
                            if !GKLocalPlayer.local.isAuthenticated {
                                authenticateUser()
                            } else if playersList.count == 0 {
                                Task{
                                    await loadLeaderboard(source: 2)
                                }
                            }
                        }
                    }
                }
                .onTapGesture {
                    gameCenterViewControllerState = .leaderboards
                    //                       simpleSuccessHaptic()
                    isGKActive = true
                }
                
            
            
            
            
            
        }
    }
}

#Preview {
    PeerInterface(userData: CurrentUserData())
}

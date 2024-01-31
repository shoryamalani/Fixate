//
//  Badges.swift
//  fixate
//
//  Created by Shorya Malani on 9/3/23.
//

import Foundation


var availableBadges:[Badge] = [
    Badge(displayId: 1),
    Badge(displayId: 2),
    Badge(displayId: 3),
    Badge(displayId: 4),
    Badge(displayId: 5),
    Badge(displayId: 6),
    Badge(displayId: 7),
    Badge(displayId: 8),
    Badge(displayId: 9),
    Badge(displayId: 10),
    Badge(displayId: 11),
    Badge(displayId: 12),
]

var badgeDisplayData:[Int:BadgeDisplayData] = [
    1: BadgeDisplayData(displayId: 1, name: "The start of something greater...", type: "Total focus minutes", description: "First focused minute achieved", thresholds: [1], pointValue: 50, image: "1_focus_minute"),
    2: BadgeDisplayData(displayId: 2, name: "50 going to 500", type: "Total focus minutes", description: "50 focused minutes achieved", thresholds: [50], pointValue: 100, image: "50_focus_minutes"),
    3: BadgeDisplayData(displayId: 3, name: "An adventure in focus", type: "Total focus minutes", description: "500 focused minutes achieved", thresholds: [500], pointValue: 200, image: "500_focus_minutes"),
    4: BadgeDisplayData(displayId: 4, name: "Focused Hour", type: "Total focus minutes", description: "1 hour of focused time achieved", thresholds: [60], pointValue: 75, image: "1_hour_focus"),
    5: BadgeDisplayData(displayId: 5, name: "Dedicated Day", type: "Total focus minutes", description: "24 hours of focused time achieved", thresholds: [1440], pointValue: 150, image: "dedicated_day_focus"),
    6: BadgeDisplayData(displayId: 6, name: "Weekend Warrior", type: "Total focus minutes", description: "48 hours of focused time achieved", thresholds: [2880], pointValue: 250, image: "weekend_warrior_focus"),
    7: BadgeDisplayData(displayId: 7, name: "Month of Mastery", type: "Total focus minutes", description: "30 days of focused time achieved", thresholds: [43200], pointValue: 500, image: "month_mastery_focus"),
    8: BadgeDisplayData(displayId: 8, name: "Year of Zen", type: "Total focus minutes", description: "365 days of focused time achieved", thresholds: [525600], pointValue: 1000, image: "year_zen_focus"),
    9: BadgeDisplayData(displayId: 9, name: "Focus Champion", type: "Total focus minutes", description: "1000 focused minutes achieved", thresholds: [1000], pointValue: 300, image: "1000_focus_minutes"),
    10: BadgeDisplayData(displayId: 10, name: "Epic Focus Streak", type: "Total focus minutes", description: "10 days of consecutive focused time achieved", thresholds: [14400], pointValue: 400, image: "epic_streak_focus")
]



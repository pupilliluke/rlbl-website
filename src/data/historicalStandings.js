// Historical standings data from Discord seasons

// Season 1 - Fall 24 Standings
export const season1Standings = {
  overall: [
    ["John & Tyler", "24", "20 - 4 - 0", "83", "19", "1", "0", "4", "0", "118", "52", "66"],
    ["Style Boyz", "24", "18 - 5 - 1", "78", "17", "1", "1", "5", "0", "120", "51", "69"],
    ["Lebron James", "24", "16 - 8 - 0", "70", "14", "2", "0", "8", "0", "102", "58", "44"],
    ["Drunken Goats", "24", "13 - 9 - 2", "65", "13", "0", "2", "9", "0", "104", "77", "27"],
    ["Wolverines", "24", "12 - 11 - 1", "61", "12", "0", "1", "11", "0", "84", "75", "9"],
    ["Corner Boost", "24", "12 - 11 - 1", "59", "10", "2", "1", "11", "0", "80", "63", "17"],
    ["Chopped Trees", "24", "10 - 12 - 2", "56", "10", "0", "2", "12", "0", "82", "62", "20"],
    ["Shock", "24", "7 - 17 - 0", "44", "6", "1", "0", "16", "1", "54", "90", "-36"],
    ["Super Sonics", "24", "0 - 24 - 0", "24", "0", "0", "0", "24", "0", "23", "238", "-215"]
  ],
  playoffs: {
    champion: "John & Tyler",
    runnerUp: "Style Boyz",
    bracket: {
      quarterfinals: [
        { home: "Lebron James", away: "John & Tyler", result: "3-3" },
        { home: "Corner Boost", away: "Drunken Goats", result: "0-3" },
        { home: "Drunken Goats", away: "Style Boyz", result: "0-3" },
        { home: "Wolverines", away: "Lebron James", result: "2-3" }
      ],
      semifinals: [
        { home: "John & Tyler", away: "Style Boyz", result: "3-1" },
        { home: "Style Boyz", away: "Lebron James", result: "3-2" }
      ],
      final: {
        home: "John & Tyler",
        away: "Style Boyz", 
        result: "4-1",
        series: "The Beer Mug (Bo7)"
      }
    }
  }
};

// Season 2 - Spring 25 Standings
export const season2Standings = {
  homerConference: [
    ["Drunken Goats", "24", "18 - 5 - 1", "76", "15", "3", "1", "5", "0", "94", "62", "32"],
    ["MJ", "24", "14 - 6 - 4", "70", "14", "0", "4", "6", "0", "107", "77", "30"],
    ["Non Chalant", "24", "13 - 10 - 1", "63", "12", "1", "1", "10", "0", "89", "96", "-7"],
    ["Overdosed Otters", "24", "9 - 13 - 2", "53", "9", "0", "2", "13", "0", "74", "82", "-8"],
    ["Chicken Jockeys", "24", "8 - 15 - 1", "47", "6", "2", "1", "15", "0", "68", "90", "-22"],
    ["Pen15 Club", "24", "5 - 15 - 4", "42", "4", "1", "4", "15", "0", "69", "99", "-30"]
  ],
  garfieldConference: [
    ["Jakeing It", "24", "18 - 5 - 1", "78", "17", "1", "1", "5", "0", "98", "59", "39"],
    ["Mid Boost", "24", "15 - 6 - 3", "71", "14", "1", "3", "6", "0", "78", "55", "23"],
    ["Backdoor Bandits", "24", "15 - 9 - 0", "65", "11", "4", "0", "9", "0", "85", "63", "22"],
    ["Double Bogey", "24", "11 - 12 - 1", "57", "10", "1", "1", "12", "0", "67", "89", "-22"],
    ["Bronny James", "24", "11 - 13 - 0", "55", "9", "2", "0", "13", "0", "63", "80", "-17"],
    ["Nick Al Nite", "24", "7 - 16 - 1", "43", "4", "3", "1", "16", "0", "60", "98", "-38"]
  ],
  overall: [
    ["Jakeing it", "24", "18 - 5 - 1", "78"],
    ["Drunken Goats", "24", "18 - 5 - 1", "76"],
    ["Mid Boost", "24", "15 - 6 - 3", "71"],
    ["MJ", "24", "14 - 6 - 4", "70"],
    ["Backdoor Bandits", "24", "15 - 9 - 0", "65"],
    ["Non Chalant", "24", "13 - 10 - 1", "63"],
    ["Double Bogey", "24", "11 - 12 - 1", "57"],
    ["Bronny James", "24", "11 - 13 - 0", "55"],
    ["Overdosed Otters", "24", "9 - 13 - 2", "53"],
    ["Chicken Jockeys", "24", "8 - 15 - 1", "47"],
    ["Nick Al Nite", "24", "7 - 16 - 1", "43"],
    ["Pen15 Club", "24", "5 - 15 - 4", "42"]
  ],
  playoffs: {
    champion: "MJ",
    runnerUp: "Jakeing It",
    bracket: {
      wildcardShowdown: [
        { home: "Overdosed Otters", away: "Chicken Jockeys", result: "9-0" }
      ],
      quarterfinals: [
        { home: "Drunken Goats", away: "Overdosed Otters", result: "2-3" },
        { home: "MJ", away: "Non Chalant", result: "3-2" },
        { home: "Jakeing It", away: "Double Bogey", result: "3-1" },
        { home: "Mid Boost", away: "Backdoor Bandits", result: "3-0" }
      ],
      conferenceFinals: [
        { home: "Overdosed Otters", away: "MJ", result: "2-3" },
        { home: "Jakeing It", away: "Mid Boost", result: "3-0" }
      ],
      final: {
        home: "MJ",
        away: "Jakeing It", 
        result: "4-0",
        series: "The Beer Mug (Bo7)"
      }
    }
  }
};

// Season 3 team names (current season setup - no data yet)
export const season3Teams = [
  "Backdoor Bandits",
  "LeJohn James", 
  "vince owen",
  "Cancun Baboons",
  "jack pup",
  "Jakeing It",
  "Mid Boost", 
  "MJ",
  "Nick Al Nite",
  "a rob alex",
  "Otters",
  "erica collin",
  "Bogey and Ethan",
  "Jack W and Mario"
];

export const historicalStandingsData = {
  "season1": {
    name: "Season 1",
    year: "Fall 24", 
    data: season1Standings
  },
  "season2": {
    name: "Season 2",
    year: "Spring 25",
    data: season2Standings
  },
  "season3": {
    name: "Season 3", 
    year: "Summer 25",
    teams: season3Teams
  }
};
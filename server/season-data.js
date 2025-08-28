// Season data for API responses

const season1Stats = [
  {
    rank: 1,
    player: "Dylan",
    team: "The Wolverines",
    goals: 37,
    assists: 25,
    saves: 25,
    points: 11383,
    ppg: 474.29,
    gpg: 1.54,
    apg: 1.04,
    svpg: 1.04,
    shots: 80,
    shPercent: 46.25,
    mvps: 5,
    demos: 22,
    epicSaves: 8,
    gamesPlayed: 24
  },
  {
    rank: 2,
    player: "Matt S",
    team: "Drunken Goats",
    goals: 62,
    assists: 21,
    saves: 31,
    points: 15231,
    ppg: 634.62,
    gpg: 2.58,
    apg: 0.88,
    svpg: 1.29,
    shots: 113,
    shPercent: 54.86,
    mvps: 11,
    demos: 6,
    epicSaves: 7,
    gamesPlayed: 24
  },
  {
    rank: 3,
    player: "Tyler",
    team: "John & Tyler",
    goals: 84,
    assists: 16,
    saves: 28,
    points: 17512,
    ppg: 729.66,
    gpg: 3.5,
    apg: 0.67,
    svpg: 1.17,
    shots: 159,
    shPercent: 52.83,
    mvps: 20,
    demos: 27,
    epicSaves: 9,
    gamesPlayed: 24
  }
];

const season2Stats = [
  {
    rank: 1,
    player: "Austin",
    team: "Backdoor Bandits",
    goals: 41,
    assists: 22,
    saves: 33,
    points: 12952,
    ppg: 539.67,
    gpg: 1.71,
    apg: 0.92,
    svpg: 1.38,
    shots: 101,
    shPercent: 40.59,
    mvps: 7,
    demos: 23,
    epicSaves: 8,
    gamesPlayed: 24
  },
  {
    rank: 2,
    player: "Gup",
    team: "Chicken Jockey",
    goals: 63,
    assists: 12,
    saves: 54,
    points: 18393,
    ppg: 766.38,
    gpg: 2.63,
    apg: 0.5,
    svpg: 2.25,
    shots: 152,
    shPercent: 41.45,
    mvps: 14,
    demos: 25,
    epicSaves: 11,
    gamesPlayed: 24
  },
  {
    rank: 3,
    player: "Mason",
    team: "Non Chalant",
    goals: 65,
    assists: 20,
    saves: 44,
    points: 17106,
    ppg: 712.75,
    gpg: 2.71,
    apg: 0.83,
    svpg: 1.83,
    shots: 126,
    shPercent: 51.59,
    mvps: 13,
    demos: 11,
    epicSaves: 8,
    gamesPlayed: 24
  }
];

const season2PlayoffStats = [
  {
    rank: 1,
    player: "Austin",
    team: "Backdoor Bandits",
    goals: 16,
    assists: 7,
    saves: 26,
    points: 5835,
    ppg: 486.25,
    gpg: 1.33,
    apg: 0.58,
    svpg: 2.17,
    shots: 47,
    shPercent: 34.04,
    mvps: 3,
    demos: 6,
    epicSaves: 6,
    gamesPlayed: 12
  },
  {
    rank: 2,
    player: "Mason",
    team: "Drunken Goats",
    goals: 30,
    assists: 12,
    saves: 23,
    points: 9530,
    ppg: 595.63,
    gpg: 1.88,
    apg: 0.75,
    svpg: 1.44,
    shots: 74,
    shPercent: 40.54,
    mvps: 8,
    demos: 6,
    epicSaves: 6,
    gamesPlayed: 16
  }
];

const careerStats = [
  {
    id: 1,
    player: "Dylan",
    gamertag: "Dylan",
    team: "Career Total",
    seasons: 3,
    points: 22942,
    goals: 71,
    assists: 48,
    saves: 54,
    shots: 156,
    mvps: 7,
    demos: 47,
    epicSaves: 12,
    gamesPlayed: 72,
    ppg: 318.64,
    gpg: 0.99,
    apg: 0.67
  },
  {
    id: 2,
    player: "Tyler",
    gamertag: "Tyler",
    team: "Career Total",
    seasons: 2,
    points: 26730,
    goals: 100,
    assists: 46,
    saves: 61,
    shots: 258,
    mvps: 33,
    demos: 54,
    epicSaves: 22,
    gamesPlayed: 48,
    ppg: 556.88,
    gpg: 2.08,
    apg: 0.96
  },
  {
    id: 3,
    player: "Mason",
    gamertag: "Mason",
    team: "Career Total",
    seasons: 3,
    points: 42908,
    goals: 150,
    assists: 46,
    saves: 119,
    shots: 321,
    mvps: 31,
    demos: 24,
    epicSaves: 26,
    gamesPlayed: 88,
    ppg: 487.59,
    gpg: 1.70,
    apg: 0.52
  }
];

const historicalSeasons = {
  "season1": {
    name: "Season 1",
    year: "Fall 24",
    stats: season1Stats
  },
  "season2": {
    name: "Season 2", 
    year: "Spring 25",
    stats: season2Stats
  },
  "season2_playoffs": {
    name: "Season 2 Playoffs",
    year: "Winter 25",
    stats: season2PlayoffStats
  }
};

module.exports = {
  historicalSeasons,
  careerStats
};
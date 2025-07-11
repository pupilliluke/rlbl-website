const teamStats = [
  {
    name: "Backdoor Bandits",
    stats: {
      goals: 85,
      saves: 75,
      demos: 34,
      shotsAllowed: 151,
      goalsAllowed: 64,
      shots: 202,
      gpg: 3.54,
      spg: 3.13,
      shPct: "42.08%",
      savesPerGame: 3.125,
      epicSavesPerGame: 0.54,
      savesPerShotAgainst: 0.50,
      demosAgainstPerGame: 1.42,
      goalsAllowedPerGame: 2.67,
      shotsAllowedPerGame: 6.29,
      goalsAllowedPct: 0.42,
      gamesPlayed: 24,
      homerRecord: "2-4-0",
      garfieldRecord: "6-3-0",
      last8: "3-3-0",
      seed: 1,
    },
  },
  {
    name: "Bronny James",
    stats: {
      goals: 63,
      saves: 84,
      demos: 25,
      shotsAllowed: 186,
      goalsAllowed: 80,
      shots: 145,
      gpg: 2.63,
      spg: 3.50,
      shPct: "43.45%",
      savesPerGame: 3.500,
      epicSavesPerGame: 0.71,
      savesPerShotAgainst: 0.45,
      demosAgainstPerGame: 1.04,
      goalsAllowedPerGame: 3.33,
      shotsAllowedPerGame: 7.75,
      goalsAllowedPct: 0.43,
      gamesPlayed: 24,
      homerRecord: "4-1-1",
      garfieldRecord: "5-4-0",
      last8: "3-3-0",
      seed: 2,
    },
  },
  {
    name: "Chicken Jockeys",
    stats: {
      goals: 68,
      saves: 57,
      demos: 26,
      shotsAllowed: 156,
      goalsAllowed: 79,
      shots: 157,
      gpg: 2.83,
      spg: 2.38,
      shPct: "43.31%",
      savesPerGame: 2.375,
      epicSavesPerGame: 0.79,
      savesPerShotAgainst: 0.37,
      demosAgainstPerGame: 1.08,
      goalsAllowedPerGame: 3.29,
      shotsAllowedPerGame: 6.50,
      goalsAllowedPct: 0.51,
      gamesPlayed: 24,
      homerRecord: "1-5-0",
      garfieldRecord: "1-2-0",
      last8: "1-5-0",
      seed: 3,
    },
  },
  {
    name: "Double Bogey",
    stats: {
      goals: 68,
      saves: 50,
      demos: 21,
      shotsAllowed: 149,
      goalsAllowed: 89,
      shots: 140,
      gpg: 2.83,
      spg: 2.08,
      shPct: "48.57%",
      savesPerGame: 2.083,
      epicSavesPerGame: 0.38,
      savesPerShotAgainst: 0.34,
      demosAgainstPerGame: 0.88,
      goalsAllowedPerGame: 3.71,
      shotsAllowedPerGame: 6.21,
      goalsAllowedPct: 0.60,
      gamesPlayed: 24,
      homerRecord: "2-1-0",
      garfieldRecord: "5-4-0",
      last8: "1-5-0",
      seed: 4,
    },
  },
  {
    name: "Drunken Goats",
    stats: {
      goals: 94,
      saves: 56,
      demos: 57,
      shotsAllowed: 121,
      goalsAllowed: 62,
      shots: 199,
      gpg: 3.92,
      spg: 2.33,
      shPct: "47.24%",
      savesPerGame: 2.333,
      epicSavesPerGame: 0.63,
      savesPerShotAgainst: 0.46,
      demosAgainstPerGame: 2.38,
      goalsAllowedPerGame: 2.58,
      shotsAllowedPerGame: 5.04,
      goalsAllowedPct: 0.51,
      gamesPlayed: 24,
      homerRecord: "7-2-0",
      garfieldRecord: "5-0-1",
      last8: "4-1-1",
      seed: 5,
    },
  },
  {
    name: "Jakeing It",
    stats: {
      goals: 101,
      saves: 58,
      demos: 23,
      shotsAllowed: 131,
      goalsAllowed: 66,
      shots: 223,
      gpg: 4.21,
      spg: 2.42,
      shPct: "45.29%",
      savesPerGame: 2.417,
      epicSavesPerGame: 0.67,
      savesPerShotAgainst: 0.44,
      demosAgainstPerGame: 0.96,
      goalsAllowedPerGame: 2.75,
      shotsAllowedPerGame: 5.46,
      goalsAllowedPct: 0.50,
      gamesPlayed: 24,
      homerRecord: "3-0-0",
      garfieldRecord: "3-3-0",
      last8: "3-2-1",
      seed: 6,
    },
  },
  {
    name: "Mid Boost",
    stats: {
      goals: 82,
      saves: 71,
      demos: 35,
      shotsAllowed: 133,
      goalsAllowed: 55,
      shots: 188,
      gpg: 3.42,
      spg: 2.96,
      shPct: "43.62%",
      savesPerGame: 2.958,
      epicSavesPerGame: 0.71,
      savesPerShotAgainst: 0.53,
      demosAgainstPerGame: 1.46,
      goalsAllowedPerGame: 2.29,
      shotsAllowedPerGame: 5.54,
      goalsAllowedPct: 0.41,
      gamesPlayed: 24,
      homerRecord: "3-2-1",
      garfieldRecord: "3-2-1",
      last8: "3-3-0",
      seed: 7,
    },
  },
  {
    name: "MJ",
    stats: {
      goals: 105,
      saves: 79,
      demos: 38,
      shotsAllowed: 176,
      goalsAllowed: 75,
      shots: 213,
      gpg: 4.38,
      spg: 3.29,
      shPct: "49.30%",
      savesPerGame: 3.292,
      epicSavesPerGame: 0.88,
      savesPerShotAgainst: 0.45,
      demosAgainstPerGame: 1.58,
      goalsAllowedPerGame: 3.13,
      shotsAllowedPerGame: 7.33,
      goalsAllowedPct: 0.43,
      gamesPlayed: 24,
      homerRecord: "9-3-0",
      garfieldRecord: "4-2-3",
      last8: "3-2-1",
      seed: 8,
    },
  },
  {
    name: "Nick Al Nite",
    stats: {
      goals: 55,
      saves: 88,
      demos: 15,
      shotsAllowed: 221,
      goalsAllowed: 98,
      shots: 131,
      gpg: 2.29,
      spg: 3.67,
      shPct: "41.98%",
      savesPerGame: 3.667,
      epicSavesPerGame: 1.33,
      savesPerShotAgainst: 0.40,
      demosAgainstPerGame: 0.63,
      goalsAllowedPerGame: 4.08,
      shotsAllowedPerGame: 9.21,
      goalsAllowedPct: 0.44,
      gamesPlayed: 24,
      homerRecord: "4-2-0",
      garfieldRecord: "1-4-1",
      last8: "2-4-0",
      seed: 9,
    },
  },
  {
    name: "Non Chalant",
    stats: {
      goals: 89,
      saves: 49,
      demos: 25,
      shotsAllowed: 175,
      goalsAllowed: 96,
      shots: 192,
      gpg: 3.71,
      spg: 2.04,
      shPct: "46.35%",
      savesPerGame: 2.042,
      epicSavesPerGame: 0.83,
      savesPerShotAgainst: 0.28,
      demosAgainstPerGame: 1.04,
      goalsAllowedPerGame: 4.00,
      shotsAllowedPerGame: 7.29,
      goalsAllowedPct: 0.55,
      gamesPlayed: 24,
      homerRecord: "5-4-0",
      garfieldRecord: "2-4-0",
      last8: "3-3-0",
      seed: 10,
    },
  },
  {
    name: "Overdosed Otters",
    stats: {
      goals: 74,
      saves: 63,
      demos: 29,
      shotsAllowed: 183,
      goalsAllowed: 82,
      shots: 165,
      gpg: 3.08,
      spg: 2.63,
      shPct: "44.85%",
      savesPerGame: 2.625,
      epicSavesPerGame: 0.42,
      savesPerShotAgainst: 0.34,
      demosAgainstPerGame: 1.21,
      goalsAllowedPerGame: 3.42,
      shotsAllowedPerGame: 7.63,
      goalsAllowedPct: 0.45,
      gamesPlayed: 24,
      homerRecord: "4-5-0",
      garfieldRecord: "0-2-1",
      last8: "3-3-0",
      seed: 11,
    },
  },
  {
    name: "Pen15 Club",
    stats: {
      goals: 69,
      saves: 89,
      demos: 44,
      shotsAllowed: 227,
      goalsAllowed: 99,
      shots: 144,
      gpg: 2.88,
      spg: 3.71,
      shPct: "47.92%",
      savesPerGame: 3.708,
      epicSavesPerGame: 1.17,
      savesPerShotAgainst: 0.39,
      demosAgainstPerGame: 1.83,
      goalsAllowedPerGame: 4.13,
      shotsAllowedPerGame: 9.46,
      goalsAllowedPct: 0.44,
      gamesPlayed: 24,
      homerRecord: "0-0-6",
      garfieldRecord: "3-1-2",
      last8: "3-0-3",
      seed: 12,
    },
  },
];

export { teamStats };

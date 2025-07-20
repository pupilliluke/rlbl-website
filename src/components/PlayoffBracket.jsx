import { SingleEliminationBracket, Match } from '@g-loot/react-tournament-brackets';
import React from 'react';
import { SVGViewer } from '@g-loot/react-tournament-brackets';

const matches = [
  {
    id: "1",
    name: "Round 1",
    nextMatchId: "5",
    participants: [
      { id: "a", name: "Nick Al Nite" },
      { id: "b", name: "MJ" },
    ],
  },
  {
    id: "2",
    name: "Round 1",
    nextMatchId: "5",
    participants: [
      { id: "c", name: "Double Bogey" },
      { id: "d", name: "Non Chalant" },
    ],
  },
  {
    id: "3",
    name: "Round 1",
    nextMatchId: "6",
    participants: [
      { id: "e", name: "Jakeing It" },
      { id: "f", name: "Chicken Jockeys" },
    ],
  },
  {
    id: "4",
    name: "Round 1",
    nextMatchId: "6",
    participants: [
      { id: "g", name: "Drunken Goats" },
      { id: "h", name: "Overdosed Otters" },
    ],
  },
  {
    id: "5",
    name: "Quarter Final",
    nextMatchId: "7",
    participants: [],
  },
  {
    id: "6",
    name: "Quarter Final",
    nextMatchId: "7",
    participants: [],
  },
  {
    id: "7",
    name: "Final",
    nextMatchId: null,
    participants: [],
  },
];



export default function PlayoffBracket() {
  return (
    <SingleEliminationBracket
      matches={matches}
      matchComponent={Match}

    />
  );
}

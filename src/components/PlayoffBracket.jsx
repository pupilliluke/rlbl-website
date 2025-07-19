// import React from "react";
// import { Tournament, Match } from "react-tournament-tree";

// const matches = [
//   {
//     id: "1",
//     name: "Round 1",
//     nextMatchId: "5",
//     participants: [
//       { id: "a", name: "Nick Al Nite" },
//       { id: "b", name: "MJ" },
//     ],
//   },
//   {
//     id: "2",
//     name: "Round 1",
//     nextMatchId: "5",
//     participants: [
//       { id: "c", name: "Double Bogey" },
//       { id: "d", name: "Non Chalant" },
//     ],
//   },
//   {
//     id: "3",
//     name: "Round 1",
//     nextMatchId: "6",
//     participants: [
//       { id: "e", name: "Jakeing It" },
//       { id: "f", name: "Chicken Jockeys" },
//     ],
//   },
//   {
//     id: "4",
//     name: "Round 1",
//     nextMatchId: "6",
//     participants: [
//       { id: "g", name: "Drunken Goats" },
//       { id: "h", name: "Overdosed Otters" },
//     ],
//   },
//   {
//     id: "5",
//     name: "Quarter Final",
//     nextMatchId: "7",
//     participants: [],
//   },
//   {
//     id: "6",
//     name: "Quarter Final",
//     nextMatchId: "7",
//     participants: [],
//   },
//   {
//     id: "7",
//     name: "Final",
//     nextMatchId: null,
//     participants: [],
//   },
// ];

// const PlayoffBracket = () => {
//   return (
//     <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white py-12 px-4">
//       <h1 className="text-4xl font-bold text-center text-yellow-400 mb-12 drop-shadow-md animate-pulse">
//         🏆 2025 Playoff Bracket
//       </h1>
//       <div className="flex justify-center overflow-x-auto">
//         <Tournament
//           matches={matches}
//           matchComponent={Match}
//           svgWrapper={({ children }) => (
//             <svg width="1000" height="600">{children}</svg>
//           )}
//         />
//       </div>
//     </div>
//   );
// };

// export default PlayoffBracket;

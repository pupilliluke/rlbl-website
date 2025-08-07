import React, { useState, useEffect } from "react";
import { players } from "../data/players";
import { powerRankings } from "../data/powerRankings";
import { schedule } from "../data/schedule";
import { homerConference, garfieldConference, overall } from "../data/standings";
import { teams } from "../data/teams";
import { gameStats, seasons } from "../data/gameStats";

const dataSources = {
  players,
  powerRankings,
  schedule,
  homerConference,
  garfieldConference,
  overall,
  teams,
  gameStats,
  seasons,
};

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timeout = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const [selectedSource, setSelectedSource] = useState("players");
  const [items, setItems] = useState(dataSources[selectedSource]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [newItem, setNewItem] = useState({});
  
  // Game stats entry state
  const [showGameEntry, setShowGameEntry] = useState(false);
  const [gameEntry, setGameEntry] = useState({
    gameDate: "",
    homeTeam: "",
    awayTeam: "",
    week: "",
    season: "2025",
    playerStats: []
  });
  const [selectedPlayers, setSelectedPlayers] = useState([]);

  const handleAuth = () => {
    const isCorrect = password === process.env.REACT_APP_ADMIN_PASSWORD;
    if (isCorrect) {
      setAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
      setShowError(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };

  const handleChange = (key, value) => {
    setNewItem({ ...newItem, [key]: value });
  };

  const handleSelectSource = (source) => {
    setSelectedSource(source);
    setItems(dataSources[source]);
    setEditingIndex(null);
    setNewItem({});
  };

  const handleAdd = () => {
    if (!newItem || Object.keys(newItem).length === 0) return;
    setItems([...items, newItem]);
    setNewItem({});
  };

  const handleEdit = (index) => {
    setEditingIndex(index);
    setNewItem(items[index]);
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setNewItem({});
  };

  const handleSave = () => {
    const updated = [...items];
    updated[editingIndex] = newItem;
    setItems(updated);
    setEditingIndex(null);
    setNewItem({});
  };

  const handleDelete = (index) => {
    const filtered = items.filter((_, i) => i !== index);
    setItems(filtered);
    setEditingIndex(null);
  };

  // Game stats handlers
  const handleAddPlayer = () => {
    const newPlayer = {
      player: "",
      team: "",
      goals: 0,
      assists: 0,
      saves: 0,
      shots: 0,
      mvp: 0,
      demos: 0,
      epicSaves: 0,
      points: 0
    };
    setSelectedPlayers([...selectedPlayers, newPlayer]);
  };

  const handlePlayerStatChange = (index, field, value) => {
    const updated = [...selectedPlayers];
    updated[index][field] = field === 'player' || field === 'team' ? value : parseInt(value) || 0;
    setSelectedPlayers(updated);
  };

  const handleSaveGame = () => {
    const newGame = {
      ...gameEntry,
      id: gameStats.length + 1,
      playerStats: selectedPlayers
    };
    
    if (selectedSource === 'gameStats') {
      setItems([...items, newGame]);
    }
    
    // Reset form
    setGameEntry({
      gameDate: "",
      homeTeam: "",
      awayTeam: "",
      week: "",
      season: "2025",
      playerStats: []
    });
    setSelectedPlayers([]);
    setShowGameEntry(false);
  };

  const renderValue = (key, value) => {
    if (Array.isArray(value)) {
      return (
        <ul className="list-disc ml-5 text-gray-300 space-y-1">
          {value.map((v, i) => (
            <li key={i} className="bg-[#1f1f2e] px-3 py-2 rounded text-sm">
              {typeof v === 'object' ? (
                <pre className="text-xs text-green-300 whitespace-pre-wrap">{JSON.stringify(v, null, 2)}</pre>
              ) : (
                v
              )}
            </li>
          ))}
        </ul>
      );
    }
    return <span className="text-gray-300">{String(value)}</span>;
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
        <div className={`bg-[#1f1f2e] p-8 rounded-xl shadow-xl max-w-md w-full transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-bold text-center text-orange-400 mb-4">🔐 Admin Access</h2>
          <input
            type="password"
            placeholder="Enter admin password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-4 py-2 rounded bg-[#2a2a3d] border border-blue-900 text-white mb-3"
          />
          {error && (
            <p
              className={`text-red-500 text-sm mb-2 text-center transition-opacity duration-700 ${showError ? "opacity-100" : "opacity-0"}`}
            >
              {error}
            </p>
          )}
          <button
            onClick={handleAuth}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded shadow"
          >
            Enter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-900 via-orange-800 to-red-900 border-b border-red-700">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6 md:py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">🛠 Admin Panel</h1>
          <p className="text-red-200 text-sm md:text-base">League data management and administration tools</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
<div className="flex justify-center gap-4 mb-10 flex-wrap">
  {Object.keys(dataSources).map((key) => (
    <button
      key={key}
      onClick={() => handleSelectSource(key)}
      className={`px-4 py-2 rounded-full border transition duration-150 text-sm font-medium ${
        selectedSource === key
          ? "bg-orange-500 border-orange-700"
          : "bg-[#2a2a3d] border-blue-800"
      }`}
    >
      {key.charAt(0).toUpperCase() + key.slice(1)}
    </button>
  ))}
</div>

{/* Game Stats Entry Button */}
{selectedSource === 'gameStats' && (
  <div className="flex justify-center mb-6">
    <button
      onClick={() => setShowGameEntry(true)}
      className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
    >
      + Add New Game Stats
    </button>
  </div>
)}

<div className="max-w-5xl mx-auto bg-[#1f1f2e] rounded-xl shadow-md p-6 space-y-6">
  {items.map((item, index) => (
    <div
      key={index}
      className="bg-[#2a2a3d] rounded p-4 shadow flex flex-col gap-2 border border-blue-900"
    >
      {Object.entries(item).map(([key, value]) => (
        <div key={key} className="text-sm">
          <span className="font-semibold text-blue-300 mr-2">{key}:</span>
          {editingIndex === index ? (
            <textarea
              rows={12}
              className="bg-[#1f1f2e] border border-blue-900 rounded px-2 py-1 w-full text-sm transition-all duration-300 shadow-inner resize-y"
              value={newItem[key] || ""}
              onChange={(e) => handleChange(key, e.target.value)}
            />
          ) : (
            renderValue(key, value)
          )}
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        {editingIndex === index ? (
          <>
            <button
              className="px-3 py-1 text-sm bg-green-600 rounded"
              onClick={handleSave}
            >
              Save
            </button>
            <button
              className="px-3 py-1 text-sm bg-gray-600 rounded"
              onClick={handleCancel}
            >
              Collapse
            </button>
          </>
        ) : (
          <button
            className="px-3 py-1 text-sm bg-blue-600 rounded"
            onClick={() => handleEdit(index)}
          >
            Edit
          </button>
        )}
        <button
          className="px-3 py-1 text-sm bg-red-600 rounded"
          onClick={() => handleDelete(index)}
        >
          Delete
        </button>
      </div>
    </div>
  ))}

  {/* Add New Entry */}
  <div className="mt-6 border-t border-blue-800 pt-4">
    <h2 className="text-lg font-semibold text-orange-300 mb-2">
      Add New Entry
    </h2>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {Object.keys(items[0] || {}).map((key) => (
        <input
          key={key}
          placeholder={key}
          value={newItem[key] || ""}
          onChange={(e) => handleChange(key, e.target.value)}
          className="bg-[#2a2a3d] border border-blue-900 text-sm px-3 py-2 rounded w-full"
        />
      ))}
    </div>
    <button
      onClick={handleAdd}
      className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded"
    >
      Add Entry
    </button>
  </div>
</div>

{/* Game Entry Modal */}
{showGameEntry && (
  <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
    <div className="bg-[#1f1f2e] rounded-xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <h2 className="text-2xl font-bold text-orange-400 mb-4">Add New Game Stats</h2>
      
      {/* Game Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <input
          type="date"
          placeholder="Game Date"
          value={gameEntry.gameDate}
          onChange={(e) => setGameEntry({...gameEntry, gameDate: e.target.value})}
          className="bg-[#2a2a3d] border border-blue-800 px-3 py-2 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Home Team"
          value={gameEntry.homeTeam}
          onChange={(e) => setGameEntry({...gameEntry, homeTeam: e.target.value})}
          className="bg-[#2a2a3d] border border-blue-800 px-3 py-2 rounded text-sm"
        />
        <input
          type="text"
          placeholder="Away Team"
          value={gameEntry.awayTeam}
          onChange={(e) => setGameEntry({...gameEntry, awayTeam: e.target.value})}
          className="bg-[#2a2a3d] border border-blue-800 px-3 py-2 rounded text-sm"
        />
        <input
          type="number"
          placeholder="Week"
          value={gameEntry.week}
          onChange={(e) => setGameEntry({...gameEntry, week: e.target.value})}
          className="bg-[#2a2a3d] border border-blue-800 px-3 py-2 rounded text-sm"
        />
      </div>

      {/* Player Stats */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-blue-300">Player Statistics</h3>
          <button
            onClick={handleAddPlayer}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm"
          >
            Add Player
          </button>
        </div>

        {selectedPlayers.map((player, index) => (
          <div key={index} className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-2 mb-3 p-3 bg-[#2a2a3d] rounded">
            <input
              type="text"
              placeholder="Player"
              value={player.player}
              onChange={(e) => handlePlayerStatChange(index, 'player', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="text"
              placeholder="Team"
              value={player.team}
              onChange={(e) => handlePlayerStatChange(index, 'team', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Goals"
              value={player.goals}
              onChange={(e) => handlePlayerStatChange(index, 'goals', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Assists"
              value={player.assists}
              onChange={(e) => handlePlayerStatChange(index, 'assists', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Saves"
              value={player.saves}
              onChange={(e) => handlePlayerStatChange(index, 'saves', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Shots"
              value={player.shots}
              onChange={(e) => handlePlayerStatChange(index, 'shots', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="MVP"
              max="1"
              value={player.mvp}
              onChange={(e) => handlePlayerStatChange(index, 'mvp', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Demos"
              value={player.demos}
              onChange={(e) => handlePlayerStatChange(index, 'demos', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Epic Saves"
              value={player.epicSaves}
              onChange={(e) => handlePlayerStatChange(index, 'epicSaves', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
            <input
              type="number"
              placeholder="Points"
              value={player.points}
              onChange={(e) => handlePlayerStatChange(index, 'points', e.target.value)}
              className="bg-[#1f1f2e] border border-blue-900 px-2 py-1 rounded text-xs"
            />
          </div>
        ))}
      </div>

      {/* Modal Actions */}
      <div className="flex justify-end gap-4">
        <button
          onClick={() => setShowGameEntry(false)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSaveGame}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Save Game
        </button>
      </div>
      </div>
    </div>
)}
      </div>
    </div>
  );
};

export default Admin;

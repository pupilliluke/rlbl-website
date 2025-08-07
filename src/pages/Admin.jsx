import React, { useState, useEffect } from "react";
import { players } from "../data/players";
import { powerRankings } from "../data/powerRankings";
import { schedule } from "../data/schedule";
import { homerConference, garfieldConference, overall } from "../data/standings";
import { teams } from "../data/teams";
import { gameStats } from "../data/gameStats";
import { careerStats } from "../data/careerStats";

const Admin = () => {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showError, setShowError] = useState(false);
  const [activeTab, setActiveTab] = useState("players");
  
  // Data state for each tab - with error handling
  const [playersData, setPlayersData] = useState(() => {
    try {
      return [...players];
    } catch (err) {
      console.error("Error loading players data:", err);
      return [];
    }
  });
  const [teamsData, setTeamsData] = useState(() => {
    try {
      return [...teams];
    } catch (err) {
      console.error("Error loading teams data:", err);
      return [];
    }
  });
  const [standingsData, setStandingsData] = useState(() => {
    try {
      return {
        homer: [...homerConference],
        garfield: [...garfieldConference],
        overall: [...overall]
      };
    } catch (err) {
      console.error("Error loading standings data:", err);
      return { homer: [], garfield: [], overall: [] };
    }
  });
  const [scheduleData, setScheduleData] = useState(() => {
    try {
      return [...schedule];
    } catch (err) {
      console.error("Error loading schedule data:", err);
      return [];
    }
  });
  const [gameStatsData, setGameStatsData] = useState(() => {
    try {
      return [...gameStats];
    } catch (err) {
      console.error("Error loading game stats data:", err);
      return [];
    }
  });
  const [powerRankingsData, setPowerRankingsData] = useState(() => {
    try {
      return [...powerRankings];
    } catch (err) {
      console.error("Error loading power rankings data:", err);
      return [];
    }
  });
  const [careerStatsData, setCareerStatsData] = useState(() => {
    try {
      return [...careerStats];
    } catch (err) {
      console.error("Error loading career stats data:", err);
      return [];
    }
  });
  
  // Form states
  const [editingItem, setEditingItem] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({});
  const [selectedConference, setSelectedConference] = useState("homer");

  useEffect(() => {
    if (error) {
      setShowError(true);
      const timeout = setTimeout(() => setShowError(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [error]);

  const handleAuth = () => {
    console.log('Entered password:', password);
    console.log('Expected password:', process.env.REACT_APP_ADMIN_PASSWORD);
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

  // Generic CRUD operations
  const getCurrentData = () => {
    switch (activeTab) {
      case "players": return playersData;
      case "teams": return teamsData;
      case "standings": return standingsData[selectedConference];
      case "schedule": return scheduleData;
      case "gameStats": return gameStatsData;
      case "powerRankings": return powerRankingsData;
      case "careerStats": return careerStatsData;
      default: return [];
    }
  };

  const setCurrentData = (newData) => {
    switch (activeTab) {
      case "players":
        setPlayersData(newData);
        break;
      case "teams":
        setTeamsData(newData);
        break;
      case "standings":
        setStandingsData(prev => ({ ...prev, [selectedConference]: newData }));
        break;
      case "schedule":
        setScheduleData(newData);
        break;
      case "gameStats":
        setGameStatsData(newData);
        break;
      case "powerRankings":
        setPowerRankingsData(newData);
        break;
      case "careerStats":
        setCareerStatsData(newData);
        break;
    }
  };

  const getDefaultFormData = () => {
    switch (activeTab) {
      case "players":
        return {
          player: "",
          gamertag: "",
          team: "",
          gamesPlayed: null,
          points: 0,
          ppg: 0,
          goals: 0,
          gpg: 0,
          assists: 0,
          apg: 0,
          saves: 0,
          svpg: 0,
          shots: 0,
          shPercent: 0,
          mvps: 0,
          demos: 0,
          epicSaves: 0
        };
      case "teams":
        return {
          name: "",
          primaryColor: "#000000",
          secondaryColor: "#ffffff",
          players: []
        };
      case "standings":
        return {
          team: "",
          wins: 0,
          losses: 0,
          winPercentage: 0,
          pointsFor: 0,
          pointsAgainst: 0,
          pointDifferential: 0
        };
      case "schedule":
        return {
          week: 1,
          date: "",
          homeTeam: "",
          awayTeam: "",
          time: "",
          status: "scheduled"
        };
      case "gameStats":
        return {
          gameDate: "",
          homeTeam: "",
          awayTeam: "",
          week: 1,
          season: "2025",
          playerStats: []
        };
      case "powerRankings":
        return {
          rank: 1,
          team: "",
          record: "",
          trend: "",
          reasoning: ""
        };
      case "careerStats":
        return {
          player: "",
          team: "",
          gamesPlayed: null,
          points: 0,
          ppg: 0,
          goals: 0,
          gpg: 0,
          assists: 0,
          apg: 0,
          saves: 0,
          svpg: 0,
          shots: 0,
          shPercent: 0,
          mvps: 0,
          demos: 0,
          epicSaves: 0
        };
      default:
        return {};
    }
  };

  const handleAdd = () => {
    if (!formData || Object.keys(formData).length === 0) return;
    const currentData = getCurrentData();
    setCurrentData([...currentData, formData]);
    setFormData(getDefaultFormData());
    setShowAddForm(false);
  };

  const handleEdit = (item, index) => {
    setEditingItem(index);
    setFormData({ ...item });
  };

  const handleSave = () => {
    const currentData = getCurrentData();
    const updated = [...currentData];
    updated[editingItem] = formData;
    setCurrentData(updated);
    setEditingItem(null);
    setFormData({});
  };

  const handleDelete = (index) => {
    if (window.confirm("Are you sure you want to delete this item?")) {
      const currentData = getCurrentData();
      const filtered = currentData.filter((_, i) => i !== index);
      setCurrentData(filtered);
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
    setShowAddForm(false);
  };

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderFormField = (field, value, type = "text") => {
    const isTextarea = field === "reasoning" || field === "players";
    const isColor = field.includes("Color");
    const isNumber = ["rank", "week", "gamesPlayed", "points", "goals", "assists", "saves", "shots", "mvps", "demos", "epicSaves", "wins", "losses", "pointsFor", "pointsAgainst"].includes(field);

    if (isTextarea) {
      return (
        <textarea
          value={value || ""}
          onChange={(e) => handleFormChange(field, e.target.value)}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full h-24 resize-none"
          rows={3}
        />
      );
    }

    if (isColor) {
      return (
        <div className="flex gap-2 items-center">
          <input
            type="color"
            value={value || "#000000"}
            onChange={(e) => handleFormChange(field, e.target.value)}
            className="w-12 h-12 rounded-lg border-2 border-gray-500"
          />
          <input
            type="text"
            value={value || ""}
            onChange={(e) => handleFormChange(field, e.target.value)}
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
            className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white flex-1"
          />
        </div>
      );
    }

    let stepValue;
    if (isNumber) {
      stepValue = field.includes("Percent") ? "0.1" : "1";
    }

    return (
      <input
        type={isNumber ? "number" : type}
        value={value ?? ""}
        onChange={(e) => {
          if (isNumber) {
            const inputValue = e.target.value;
            if (inputValue === "" || inputValue === null) {
              handleFormChange(field, null);
            } else {
              const numValue = field.includes("Percent") || field === "ppg" || field === "gpg" || field === "apg" || field === "svpg" 
                ? parseFloat(inputValue) 
                : parseInt(inputValue);
              handleFormChange(field, isNaN(numValue) ? null : numValue);
            }
          } else {
            handleFormChange(field, e.target.value);
          }
        }}
        placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
        className="bg-gray-700/80 border border-gray-500 rounded-xl px-4 py-3 text-white w-full"
        step={stepValue}
      />
    );
  };

  const renderDataTable = () => {
    const currentData = getCurrentData();
    if (!currentData || currentData.length === 0) {
      return (
        <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-12 text-center">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-2xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-gray-300">Start by adding your first entry using the button above.</p>
        </div>
      );
    }

    // Get all possible keys from all objects to ensure consistent columns
    const allKeys = [...new Set(currentData.flatMap(item => Object.keys(item)))];

    return (
      <div className="bg-gray-800/90 border border-gray-600 rounded-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white">Data Table</h3>
          <p className="text-sm text-gray-300 mt-1">Click edit to modify entries</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-900 to-gray-800 border-b border-gray-600">
              <tr>
                {allKeys.map((key) => (
                  <th key={key} className="px-4 py-3 text-left font-bold text-white border-r border-white/5 last:border-r-0">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-bold text-white w-32">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentData.map((item, index) => {
                const itemKey = item.id || item.player || item.team || item.rank || `admin-item-${Date.now()}-${Math.random()}`;
                return (
                  <tr key={itemKey} className="border-b border-gray-600 hover:bg-gray-700/50 transition-all duration-300">
                    {allKeys.map((key) => {
                      const value = item[key];
                      let displayValue;
                      
                      if (key.includes("Color")) {
                        displayValue = (
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-full border-2 border-gray-400" style={{ backgroundColor: value }} />
                            <span className="text-xs">{value}</span>
                          </div>
                        );
                      } else if (Array.isArray(value)) {
                        displayValue = <div className="text-xs">Array ({value.length} items)</div>;
                      } else if (typeof value === "object" && value !== null) {
                        displayValue = <div className="text-xs">Object</div>;
                      } else if (value === null || value === undefined) {
                        displayValue = <span className="text-gray-500 italic">null</span>;
                      } else {
                        const className = typeof value === "number" ? "font-mono" : "";
                        displayValue = <span className={className}>{String(value)}</span>;
                      }

                      return (
                        <td key={`${itemKey}-${key}`} className="px-4 py-3 text-gray-300 border-r border-gray-600/50 last:border-r-0">
                          {displayValue}
                        </td>
                      );
                    })}
                    <td className="px-4 py-3 text-center">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEdit(item, index)}
                          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(index)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm transition-all duration-300"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    return (
      <div className="space-y-6">
        {/* Add/Edit Form */}
        {(showAddForm || editingItem !== null) && (
          <div className="bg-gray-800/90 border border-gray-600 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingItem !== null ? "Edit" : "Add New"} {activeTab.slice(0, -1)}
              </h3>
              <button
                onClick={handleCancel}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {Object.keys(getDefaultFormData()).map((field) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300">
                    {field.charAt(0).toUpperCase() + field.slice(1)}
                  </label>
                  {renderFormField(field, formData[field])}
                </div>
              ))}
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={handleCancel}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={editingItem !== null ? handleSave : handleAdd}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-300 shadow-luxury"
              >
                {editingItem !== null ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        )}

        {/* Data Table */}
        {renderDataTable()}
      </div>
    );
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
    <div className="min-h-screen bg-gradient-executive relative">
      {/* Neural Background */}
      <div className="absolute inset-0 neural-bg opacity-20" />
      
      {/* Executive Header */}
      <div className="relative z-10 glass-dark border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-black text-white mb-4">🛠 Admin Control Center</h1>
              <p className="text-xl text-white font-light">
                Full CRUD management for all league data and operations
              </p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-gray-600">
                <div className="text-2xl font-bold text-red-400">🔐</div>
                <div className="text-xs text-white">Secure</div>
              </div>
              <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl px-6 py-4 text-center border border-gray-600">
                <div className="text-2xl font-bold text-orange-400">⚡</div>
                <div className="text-xs text-white">Live</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8">
        <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-6 mb-8 border border-gray-600">
          <div className="flex flex-wrap gap-2 mb-6">
            {[
              { id: "players", label: "👥 Players", icon: "🏃‍♂️" },
              { id: "teams", label: "🏆 Teams", icon: "⚽" },
              { id: "standings", label: "📊 Standings", icon: "🏅" },
              { id: "schedule", label: "📅 Schedule", icon: "⏰" },
              { id: "gameStats", label: "📈 Game Stats", icon: "📋" },
              { id: "powerRankings", label: "👑 Rankings", icon: "🥇" },
              { id: "careerStats", label: "🌟 Career Stats", icon: "📜" }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setEditingItem(null);
                  setShowAddForm(false);
                  setFormData({});
                }}
                className={`px-6 py-3 rounded-xl font-bold transition-all duration-300 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-luxury"
                    : "bg-gray-700/80 border border-gray-500 text-white hover:text-blue-300 hover:bg-gray-600"
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Conference selector for standings */}
          {activeTab === "standings" && (
            <div className="mb-4">
              <div className="flex gap-2">
                {["homer", "garfield", "overall"].map((conf) => (
                  <button
                    key={conf}
                    onClick={() => setSelectedConference(conf)}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 ${
                      selectedConference === conf
                        ? "bg-blue-600 text-white"
                        : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    }`}
                  >
                    {conf.charAt(0).toUpperCase() + conf.slice(1)} Conference
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add New Button */}
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-white">
              Manage {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              {activeTab === "standings" && ` - ${selectedConference.charAt(0).toUpperCase() + selectedConference.slice(1)} Conference`}
            </h3>
            <button
              onClick={() => {
                setShowAddForm(true);
                setFormData(getDefaultFormData());
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold transition-all duration-300 shadow-luxury"
            >
              + Add New {activeTab === "standings" ? "Team" : activeTab.slice(0, -1)}
            </button>
          </div>
        </div>

        {/* Content Area */}
        {renderTabContent()}
      </div>
    </div>
  );
};

export default Admin;

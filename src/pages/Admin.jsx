import React, { useState, useEffect } from "react";
import { players } from "../data/players";
import { powerRankings } from "../data/powerRankings";
import { schedule } from "../data/schedule";
import { homerConference, garfieldConference, overall } from "../data/standings";
import { teams } from "../data/teams";

const dataSources = {
  players,
  powerRankings,
  schedule,
  homerConference,
  garfieldConference,
  overall,
  teams,
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
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
    <div className="min-h-screen px-6 py-10 text-white bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black">
      <h1 className="text-4xl font-bold text-orange-400 text-center mb-8 drop-shadow">
        🛠 Admin Panel
      </h1>
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
    </div>
  );
};

export default Admin;

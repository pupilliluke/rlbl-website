import React, { useState, useEffect } from "react";

const AdminAuth = ({ onAuthenticated }) => {
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

  const handleAuth = () => {
    console.log('Entered password:', password);
    const isCorrect = password === process.env.REACT_APP_ADMIN_PASSWORD;
    if (isCorrect) {
      onAuthenticated(true);
      setError("");
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleAuth();
    }
  };

  return (
    <div className="min-h-screen pt-20 flex items-center justify-center bg-gradient-to-b from-[#0f0f1a] via-[#1a1a2e] to-black text-white">
      <div className={`bg-[#1f1f2e] p-8 rounded-xl shadow-xl max-w-md w-full transition-transform duration-300 ${error ? 'animate-shake' : ''}`}>
        <h2 className="text-2xl font-bold text-center text-orange-400 mb-4">Admin Access</h2>
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
};

export default AdminAuth;
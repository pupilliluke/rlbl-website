const Season3Status = ({ showTitle = true }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg p-6 mb-8 border border-blue-500/30">
      {showTitle && (
        <h3 className="text-2xl font-bold text-blue-400 mb-4">Season 3 - Summer 25</h3>
      )}
      <div className="flex items-center gap-4">
        <div className="bg-yellow-500/20 rounded-full px-3 py-1">
          <span className="text-yellow-400 font-semibold text-sm">Coming Soon</span>
        </div>
        <p className="text-gray-300">
          Season 3 is in preparation. Teams are being organized and the schedule is being finalized.
        </p>
      </div>
    </div>
  );
};

export default Season3Status;
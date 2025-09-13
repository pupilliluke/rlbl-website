import React from "react";

const EditFormModal = ({ 
  show, 
  formData, 
  editingItem, 
  showAddForm, 
  loading, 
  onCancel, 
  onSave, 
  onAdd, 
  onDelete,
  onFormChange, 
  renderFormField, 
  currentKeys,
  activeTab
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4" tabIndex="-1">
      <div className={`bg-gray-800 rounded-xl shadow-2xl border border-gray-600 w-full max-h-[90vh] overflow-y-auto ${
        activeTab === 'schedule' || activeTab === 'gameResults' ? 'max-w-4xl' : 'max-w-2xl'
      }`}>
        <div className="sticky top-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 px-6 py-4 border-b border-gray-600">
          <h3 className="text-xl font-bold text-white">
            {showAddForm ? "Add New Entry" : "Edit Entry"}
          </h3>
        </div>
        <div className="p-6">
          {activeTab === 'schedule' || activeTab === 'gameResults' ? (
            // Grid layout for games
            <div className="grid grid-cols-3 gap-4">
              {currentKeys.map((field) => (
                <div key={field} className="space-y-2">
                  <label className="block text-xs font-medium text-gray-300 uppercase tracking-wide font-mono">
                    {field.replace(/_/g, " ")}
                  </label>
                  {renderFormField(field, formData[field])}
                </div>
              ))}
            </div>
          ) : (
            // Vertical layout for other items
            <div className="space-y-4">
              {currentKeys.map((field) => (
                <div key={field} className="space-y-2">
                  <label className="block text-sm font-medium text-gray-300 capitalize">
                    {field.replace(/_/g, " ")}
                  </label>
                  {renderFormField(field, formData[field])}
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="sticky bottom-0 bg-gray-800 border-t border-gray-600 px-6 py-4 flex gap-3 justify-between">
          <div className="flex gap-3">
            {!showAddForm && onDelete && (
              <button
                onClick={onDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-all duration-300"
              >
                Delete
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded transition-all duration-300"
            >
              Cancel
            </button>
            <button
              onClick={showAddForm ? onAdd : onSave}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
            >
              {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {showAddForm ? "Add" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditFormModal;
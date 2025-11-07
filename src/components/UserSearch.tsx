import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface UserSearchProps {
  onClose: () => void;
  onRoomCreated: (roomId: Id<"rooms">) => void;
}

export function UserSearch({ onClose, onRoomCreated }: UserSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Id<"users">[]>([]);
  const [groupName, setGroupName] = useState("");
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const searchResults = useQuery(
    api.profiles.searchUsers,
    searchQuery.length >= 2 ? { query: searchQuery } : "skip"
  );
  
  const createDirectMessage = useMutation(api.rooms.createDirectMessage);
  const createRoom = useMutation(api.rooms.createRoom);

  const handleUserSelect = (userId: Id<"users">) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter(id => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleCreateChat = async () => {
    if (selectedUsers.length === 0) return;

    try {
      if (selectedUsers.length === 1 && !isCreatingGroup) {
        // Create direct message
        const roomId = await createDirectMessage({ otherUserId: selectedUsers[0] });
        onRoomCreated(roomId);
      } else {
        // Create group chat
        if (!groupName.trim()) {
          alert("Please enter a group name");
          return;
        }
        
        const roomId = await createRoom({
          name: groupName.trim(),
          participants: selectedUsers,
        });
        onRoomCreated(roomId);
      }
    } catch (error) {
      console.error("Failed to create chat:", error);
      alert("Failed to create chat. Please try again.");
    }
  };

  const getSelectedUserNames = () => {
    if (!searchResults) return [];
    return searchResults
      .filter(user => selectedUsers.includes(user.userId))
      .map(user => user.displayName);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Start New Chat</h2>
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {/* Search input */}
          <div className="mt-4">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search users..."
              className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          
          {/* Group chat toggle */}
          {selectedUsers.length > 1 && (
            <div className="mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isCreatingGroup}
                  onChange={(e) => setIsCreatingGroup(e.target.checked)}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <span className="text-sm">Create group chat</span>
              </label>
            </div>
          )}
          
          {/* Group name input */}
          {isCreatingGroup && (
            <div className="mt-4">
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Group name..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
          )}
        </div>

        {/* Selected users */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-b bg-gray-50">
            <div className="flex flex-wrap gap-2">
              {getSelectedUserNames().map((name, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 bg-primary text-white text-sm rounded-full"
                >
                  {name}
                  <button
                    onClick={() => handleUserSelect(selectedUsers[index])}
                    className="ml-2 text-white/80 hover:text-white"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Search results */}
        <div className="flex-1 overflow-y-auto">
          {searchQuery.length < 2 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p>Type at least 2 characters to search</p>
            </div>
          ) : searchResults === undefined ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p>No users found</p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {searchResults.map((user) => (
                <button
                  key={user.userId}
                  onClick={() => handleUserSelect(user.userId)}
                  className={`w-full p-3 rounded-lg text-left transition-colors ${
                    selectedUsers.includes(user.userId)
                      ? "bg-primary text-white"
                      : "hover:bg-gray-100"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      selectedUsers.includes(user.userId)
                        ? "bg-white/20 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}>
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className={`text-sm ${
                        selectedUsers.includes(user.userId)
                          ? "text-white/80"
                          : "text-gray-500"
                      }`}>
                        {user.status}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {selectedUsers.length > 0 && (
          <div className="p-4 border-t">
            <button
              onClick={handleCreateChat}
              className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
            >
              {selectedUsers.length === 1 && !isCreatingGroup
                ? "Start Direct Message"
                : `Create Group (${selectedUsers.length} members)`
              }
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

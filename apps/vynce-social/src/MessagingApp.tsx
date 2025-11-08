import { useCallback, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { RoomsList } from "./components/RoomsList";
import { ChatWindow } from "./components/ChatWindow";
import { UserSearch } from "./components/UserSearch";
import { ProfileSection } from "./components/ProfileSection";
import { Id } from "../convex/_generated/dataModel";

export function MessagingApp() {
  const [selectedRoomId, setSelectedRoomId] = useState<Id<"rooms"> | null>(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [hasAttemptedEnsure, setHasAttemptedEnsure] = useState(false);
  const [ensuringProfile, setEnsuringProfile] = useState(false);
  const [ensureError, setEnsureError] = useState<string | null>(null);
  
  const profile = useQuery(api.profiles.getCurrentProfile);
  const rooms = useQuery(api.rooms.getUserRooms);
  const ensureProfileMutation = useMutation(api.profiles.ensureProfile);

  const ensureProfileIfMissing = useCallback(async () => {
    if (ensuringProfile) {
      return;
    }
    setEnsuringProfile(true);
    setEnsureError(null);
    try {
      await ensureProfileMutation({});
    } catch (error) {
      setEnsureError(error instanceof Error ? error.message : "Failed to set up your profile");
    } finally {
      setEnsuringProfile(false);
    }
  }, [ensuringProfile, ensureProfileMutation]);

  useEffect(() => {
    if (profile === null && !hasAttemptedEnsure) {
      setHasAttemptedEnsure(true);
      void ensureProfileIfMissing();
    }
  }, [profile, hasAttemptedEnsure, ensureProfileIfMissing]);

  if (profile === undefined || (profile === null && ensuringProfile)) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (profile === null) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-primary">Finishing setup</h2>
          <p className="text-sm text-gray-600">
            We weren't able to create your profile automatically. Please try again.
          </p>
          {ensureError && <p className="text-sm text-red-500">{ensureError}</p>}
          <button
            onClick={() => void ensureProfileIfMissing()}
            className="px-4 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-hover disabled:opacity-60"
            disabled={ensuringProfile}
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Messages</h2>
            <button
              onClick={() => setShowUserSearch(true)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Start new chat"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <ProfileSection profile={profile} />
        </div>

        {/* Rooms list */}
        <div className="flex-1 overflow-y-auto">
          <RoomsList
            rooms={rooms || []}
            selectedRoomId={selectedRoomId}
            onRoomSelect={setSelectedRoomId}
          />
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col">
        {selectedRoomId ? (
          <ChatWindow roomId={selectedRoomId} />
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <p className="text-lg">Select a conversation to start messaging</p>
            </div>
          </div>
        )}
      </div>

      {/* User search modal */}
      {showUserSearch && (
        <UserSearch
          onClose={() => setShowUserSearch(false)}
          onRoomCreated={(roomId) => {
            setSelectedRoomId(roomId);
            setShowUserSearch(false);
          }}
        />
      )}
    </div>
  );
}

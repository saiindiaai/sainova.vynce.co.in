import { Id } from "../../convex/_generated/dataModel";

interface Room {
  _id: Id<"rooms">;
  type: "direct" | "group";
  displayName?: string;
  avatar?: Id<"_storage">;
  avatarUrl?: string | null;
  lastMessage?: string;
  lastMessageAt?: number;
  unreadCount: number;
  participantCount: number;
}

interface RoomsListProps {
  rooms: Room[];
  selectedRoomId: Id<"rooms"> | null;
  onRoomSelect: (roomId: Id<"rooms">) => void;
}

export function RoomsList({ rooms, selectedRoomId, onRoomSelect }: RoomsListProps) {
  const formatTime = (timestamp?: number) => {
    if (!timestamp) return "";
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInHours < 168) { // 7 days
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="space-y-1 p-2">
      {rooms.map((room) => {
        const isSelected = selectedRoomId === room._id;
        const hasAvatarImage = Boolean(room.avatarUrl);

        const avatarClasses = [
          "w-12 h-12 rounded-full flex items-center justify-center font-semibold overflow-hidden",
          isSelected ? "text-white" : "text-gray-700",
        ];

        if (hasAvatarImage) {
          avatarClasses.push(isSelected ? "ring-2 ring-white/70" : "ring-1 ring-gray-200");
        } else {
          avatarClasses.push(isSelected ? "bg-white/20" : "bg-gray-200");
        }

        return (
          <button
            key={room._id}
            onClick={() => onRoomSelect(room._id)}
            className={`w-full p-3 rounded-lg text-left transition-colors ${
              isSelected ? "bg-primary text-white" : "hover:bg-gray-100"
            }`}
          >
            <div className="flex items-center space-x-3">
              {/* Avatar */}
              <div className={avatarClasses.join(" ")}>
                {hasAvatarImage ? (
                  <img
                    src={room.avatarUrl ?? undefined}
                    alt={`${room.displayName ?? "Room"} avatar`}
                    className="w-full h-full object-cover"
                  />
                ) : room.type === "group" ? (
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm8 0c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
                  </svg>
                ) : (
                  room.displayName?.charAt(0).toUpperCase() || "U"
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`font-medium truncate ${
                    isSelected ? "text-white" : "text-gray-900"
                  }`}>
                    {room.displayName || `${room.type} chat`}
                  </h3>
                  <span className={`text-xs ${
                    isSelected ? "text-white/70" : "text-gray-500"
                  }`}>
                    {formatTime(room.lastMessageAt)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <p className={`text-sm truncate ${
                    isSelected ? "text-white/80" : "text-gray-600"
                  }`}>
                    {room.lastMessage || "No messages yet"}
                  </p>
                  
                  {room.unreadCount > 0 && (
                    <span className={`inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full ${
                      isSelected ? "bg-white text-primary" : "bg-primary text-white"
                    }`}>
                      {room.unreadCount > 99 ? "99+" : room.unreadCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        );
      })}
      
      {rooms.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No conversations yet</p>
          <p className="text-sm">Start a new chat to get started</p>
        </div>
      )}
    </div>
  );
}

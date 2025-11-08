import { useState, useRef, useEffect, useMemo } from "react";
import { useMutation, useQuery, usePaginatedQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { TypingIndicator } from "./TypingIndicator";

interface ChatWindowProps {
  roomId: Id<"rooms">;
}

export function ChatWindow({ roomId }: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  const room = useQuery(api.rooms.getRoom, { roomId });
  const { results: messages, status, loadMore } = usePaginatedQuery(
    api.messages.getMessages,
    { roomId },
    { initialNumItems: 50 }
  );
  const messagesInChronologicalOrder = useMemo(
    () => (messages ? [...messages].reverse() : []),
    [messages]
  );
  
  const sendMessage = useMutation(api.messages.sendMessage);
  const markAsRead = useMutation(api.messages.markAsRead);
  const setTyping = useMutation(api.typing.setTyping);
  const typingUsers = useQuery(api.typing.getTypingUsers, { roomId });

  // Mark messages as read when room is opened
  useEffect(() => {
    if (roomId) {
      markAsRead({ roomId });
    }
  }, [roomId, markAsRead]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messagesInChronologicalOrder]);

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    try {
      await sendMessage({
        roomId,
        content: message.trim(),
      });
      setMessage("");
      setTyping({ roomId, isTyping: false });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleTyping = (isTyping: boolean) => {
    setTyping({ roomId, isTyping });
  };

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getRoomDisplayName = () => {
    if (room.type === "group") {
      return room.name || "Group Chat";
    }
    
    // For direct messages, find the other user
    const otherMember = room.members?.find(member => member.profile);
    return otherMember?.profile?.displayName || "Direct Message";
  };

  const getOnlineStatus = () => {
    if (room.type === "group") {
      const onlineCount = room.members?.filter(member => 
        member.profile?.status === "online"
      ).length || 0;
      return `${onlineCount} online`;
    }
    
    const otherMember = room.members?.find(member => member.profile);
    return otherMember?.profile?.status || "offline";
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Chat header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center space-x-4">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-semibold">
            {room.type === "group" ? (
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm4 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zm8 0c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2z"/>
              </svg>
            ) : (
              getRoomDisplayName().charAt(0).toUpperCase()
            )}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{getRoomDisplayName()}</h2>
            <p className="text-sm text-gray-500 capitalize">{getOnlineStatus()}</p>
          </div>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        {status === "CanLoadMore" && (
          <div className="p-4 text-center">
            <button
              onClick={() => loadMore(20)}
              className="px-4 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
            >
              Load more messages
            </button>
          </div>
        )}
        
        <MessageList messages={messagesInChronologicalOrder} />
        
        {typingUsers && typingUsers.length > 0 && (
          <TypingIndicator users={typingUsers} />
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <div className="bg-white border-t p-4">
        <MessageInput
          value={message}
          onChange={setMessage}
          onSend={handleSendMessage}
          onTyping={handleTyping}
          roomId={roomId}
        />
      </div>
    </div>
  );
}

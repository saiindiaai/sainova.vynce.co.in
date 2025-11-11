import { Id } from "../../convex/_generated/dataModel";

interface Message {
  _id: Id<"messages">;
  type: "text" | "image" | "video" | "audio" | "file" | "system";
  content?: string;
  mediaUrl?: string | null;
  mediaMetadata?: {
    fileName?: string;
    fileSize?: number;
    mimeType?: string;
    duration?: number;
    dimensions?: { width: number; height: number };
  };
  sender?: {
    displayName: string;
    avatar?: Id<"_storage">;
  } | null;
  _creationTime: number;
  editedAt?: number;
  isDeleted: boolean;
  reactions?: Array<{
    emoji: string;
    userId: Id<"users">;
  }>;
}

interface MessageListProps {
  messages: Message[];
}

export function MessageList({ messages }: MessageListProps) {
  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString([], { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  const shouldShowDateSeparator = (currentMessage: Message, previousMessage?: Message) => {
    if (!previousMessage) return true;
    
    const currentDate = new Date(currentMessage._creationTime).toDateString();
    const previousDate = new Date(previousMessage._creationTime).toDateString();
    
    return currentDate !== previousDate;
  };

  const renderMediaMessage = (message: Message) => {
    if (!message.mediaUrl) return null;

    switch (message.type) {
      case "image":
        return (
          <div className="max-w-sm">
            <img
              src={message.mediaUrl}
              alt="Shared image"
              className="rounded-lg max-w-full h-auto"
              style={{ 
                maxHeight: message.mediaMetadata?.dimensions?.height 
                  ? Math.min(message.mediaMetadata.dimensions.height, 400) 
                  : 400 
              }}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case "video":
        return (
          <div className="max-w-sm">
            <video
              src={message.mediaUrl}
              controls
              className="rounded-lg max-w-full h-auto"
              style={{ maxHeight: 400 }}
            />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case "audio":
        return (
          <div className="max-w-sm">
            <audio src={message.mediaUrl} controls className="w-full" />
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      case "file":
        return (
          <div className="max-w-sm">
            <a
              href={message.mediaUrl}
              download={message.mediaMetadata?.fileName}
              className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-sm">{message.mediaMetadata?.fileName || "File"}</p>
                {message.mediaMetadata?.fileSize && (
                  <p className="text-xs text-gray-500">
                    {(message.mediaMetadata.fileSize / 1024 / 1024).toFixed(2)} MB
                  </p>
                )}
              </div>
            </a>
            {message.content && (
              <p className="mt-2 text-sm">{message.content}</p>
            )}
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="p-4 space-y-4">
      {messages.map((message, index) => {
        const previousMessage = index > 0 ? messages[index - 1] : undefined;
        const showDateSeparator = shouldShowDateSeparator(message, previousMessage);
        
        return (
          <div key={message._id}>
            {showDateSeparator && (
              <div className="flex items-center justify-center my-6">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {formatDate(message._creationTime)}
                </div>
              </div>
            )}
            
            <div className="flex space-x-3">
              {/* Avatar */}
              <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                {message.sender?.displayName?.charAt(0).toUpperCase() || "U"}
              </div>
              
              {/* Message content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline space-x-2">
                  <span className="font-medium text-sm text-gray-900">
                    {message.sender?.displayName || "Unknown User"}
                  </span>
                  <span className="text-xs text-gray-500">
                    {formatTime(message._creationTime)}
                    {message.editedAt && (
                      <span className="ml-1 text-gray-400">(edited)</span>
                    )}
                  </span>
                </div>
                
                <div className="mt-1">
                  {message.isDeleted ? (
                    <p className="text-gray-500 italic text-sm">This message was deleted</p>
                  ) : message.type === "text" ? (
                    <p className="text-gray-900 text-sm whitespace-pre-wrap break-words">
                      {message.content}
                    </p>
                  ) : (
                    renderMediaMessage(message)
                  )}
                </div>
                
                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {Object.entries(
                      message.reactions.reduce((acc, reaction) => {
                        acc[reaction.emoji] = (acc[reaction.emoji] || 0) + 1;
                        return acc;
                      }, {} as Record<string, number>)
                    ).map(([emoji, count]) => (
                      <span
                        key={emoji}
                        className="inline-flex items-center px-2 py-1 text-xs bg-gray-100 rounded-full"
                      >
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
      
      {messages.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <p>No messages yet</p>
          <p className="text-sm">Start the conversation!</p>
        </div>
      )}
    </div>
  );
}

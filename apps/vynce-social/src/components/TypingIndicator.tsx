interface Profile {
  displayName: string;
}

interface TypingIndicatorProps {
  users: Profile[];
}

export function TypingIndicator({ users }: TypingIndicatorProps) {
  if (users.length === 0) return null;

  const getTypingText = () => {
    if (users.length === 1) {
      return `${users[0].displayName} is typing...`;
    } else if (users.length === 2) {
      return `${users[0].displayName} and ${users[1].displayName} are typing...`;
    } else {
      return `${users[0].displayName} and ${users.length - 1} others are typing...`;
    }
  };

  return (
    <div className="px-4 py-2">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 flex items-center justify-center">
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
          </div>
        </div>
        <span className="text-sm text-gray-500 italic">{getTypingText()}</span>
      </div>
    </div>
  );
}

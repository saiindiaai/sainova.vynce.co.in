import { useState, useRef, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: (isTyping: boolean) => void;
  roomId: Id<"rooms">;
}

export function MessageInput({ value, onChange, onSend, onTyping, roomId }: MessageInputProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const generateUploadUrl = useMutation(api.messages.generateUploadUrl);
  const sendMediaMessage = useMutation(api.messages.sendMediaMessage);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    // Handle typing indicator
    if (newValue.trim()) {
      onTyping(true);
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator
      typingTimeoutRef.current = setTimeout(() => {
        onTyping(false);
      }, 3000);
    } else {
      onTyping(false);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    
    try {
      // Generate upload URL
      const uploadUrl = await generateUploadUrl();
      
      // Upload file
      const result = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      
      if (!result.ok) {
        throw new Error("Upload failed");
      }
      
      const { storageId } = await result.json();
      
      // Determine message type based on file type
      let messageType: "image" | "video" | "audio" | "file" = "file";
      if (file.type.startsWith("image/")) {
        messageType = "image";
      } else if (file.type.startsWith("video/")) {
        messageType = "video";
      } else if (file.type.startsWith("audio/")) {
        messageType = "audio";
      }
      
      // Get file dimensions for images/videos
      let dimensions;
      if (messageType === "image") {
        dimensions = await getImageDimensions(file);
      }
      
      // Send media message
      await sendMediaMessage({
        roomId,
        mediaId: storageId,
        type: messageType,
        metadata: {
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          dimensions,
        },
      });
      
    } catch (error) {
      console.error("Failed to upload file:", error);
      alert("Failed to upload file. Please try again.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(file);
    });
  };

  return (
    <div className="flex items-end space-x-3">
      {/* File upload button */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
        title="Attach file"
      >
        {isUploading ? (
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-500"></div>
        ) : (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        )}
      </button>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        className="hidden"
        accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
      />

      {/* Message input */}
      <div className="flex-1 relative">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a message..."
          className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none max-h-32"
          rows={1}
        />
      </div>

      {/* Send button */}
      <button
        onClick={onSend}
        disabled={!value.trim() || isUploading}
        className="p-3 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        title="Send message"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      </button>
    </div>
  );
}

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Users table (extends auth users)
  profiles: defineTable({
    userId: v.id("users"),
    displayName: v.string(),
    avatar: v.optional(v.id("_storage")),
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
    lastSeen: v.number(),
    isTyping: v.optional(v.boolean()),
    typingInRoom: v.optional(v.id("rooms")),
  })
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // Rooms table (supports both 1-to-1 and group chats)
  rooms: defineTable({
    type: v.union(v.literal("direct"), v.literal("group")),
    name: v.optional(v.string()), // Only for group chats
    description: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    createdBy: v.id("users"),
    isActive: v.boolean(),
    lastMessageAt: v.optional(v.number()),
    lastMessage: v.optional(v.string()),
    // For direct messages, store participant IDs for easy lookup
    participants: v.array(v.id("users")),
    participantCount: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_participants", ["participants"])
    .index("by_last_message", ["lastMessageAt"])
    .index("by_created_by", ["createdBy"]),

  // Room memberships
  roomMembers: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    role: v.union(v.literal("admin"), v.literal("member")),
    joinedAt: v.number(),
    lastReadAt: v.optional(v.number()),
    unreadCount: v.number(),
    isMuted: v.boolean(),
    isActive: v.boolean(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_room_and_user", ["roomId", "userId"]),

  // Messages table
  messages: defineTable({
    roomId: v.id("rooms"),
    senderId: v.id("users"),
    type: v.union(
      v.literal("text"),
      v.literal("image"),
      v.literal("video"),
      v.literal("audio"),
      v.literal("file"),
      v.literal("system")
    ),
    content: v.optional(v.string()), // Text content or system message
    mediaId: v.optional(v.id("_storage")), // For media messages
    mediaMetadata: v.optional(v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      duration: v.optional(v.number()), // For audio/video
      dimensions: v.optional(v.object({
        width: v.number(),
        height: v.number(),
      })), // For images/videos
    })),
    replyTo: v.optional(v.id("messages")), // For message replies
    editedAt: v.optional(v.number()),
    isDeleted: v.boolean(),
    deliveryStatus: v.union(
      v.literal("sending"),
      v.literal("sent"),
      v.literal("delivered"),
      v.literal("failed")
    ),
  })
    .index("by_room", ["roomId"])
    .index("by_sender", ["senderId"])
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["roomId", "type"],
    }),

  // Message reactions
  messageReactions: defineTable({
    messageId: v.id("messages"),
    userId: v.id("users"),
    emoji: v.string(),
  })
    .index("by_message", ["messageId"])
    .index("by_message_and_user", ["messageId", "userId"]),

  // Typing indicators
  typingIndicators: defineTable({
    roomId: v.id("rooms"),
    userId: v.id("users"),
    expiresAt: v.number(),
  })
    .index("by_room", ["roomId"])
    .index("by_user", ["userId"])
    .index("by_expires", ["expiresAt"]),

  // Push notification tokens
  pushTokens: defineTable({
    userId: v.id("users"),
    token: v.string(),
    platform: v.union(v.literal("ios"), v.literal("android"), v.literal("web")),
    isActive: v.boolean(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});

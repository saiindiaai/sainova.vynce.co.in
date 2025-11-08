import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { paginationOptsValidator } from "convex/server";

// Send a text message
export const sendMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    content: v.string(),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is a member of the room
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      throw new Error("Not a member of this room");
    }

    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: userId,
      type: "text",
      content: args.content,
      replyTo: args.replyTo,
      isDeleted: false,
      deliveryStatus: "sent",
    });

    // Update room's last message
    await ctx.db.patch(args.roomId, {
      lastMessageAt: Date.now(),
      lastMessage: args.content.substring(0, 100),
    });

    // Update unread counts for other members
    const otherMembers = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => 
        q.and(
          q.neq(q.field("userId"), userId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    for (const member of otherMembers) {
      await ctx.db.patch(member._id, {
        unreadCount: member.unreadCount + 1,
      });
    }

    return messageId;
  },
});

// Send a media message
export const sendMediaMessage = mutation({
  args: {
    roomId: v.id("rooms"),
    mediaId: v.id("_storage"),
    type: v.union(v.literal("image"), v.literal("video"), v.literal("audio"), v.literal("file")),
    metadata: v.optional(v.object({
      fileName: v.optional(v.string()),
      fileSize: v.optional(v.number()),
      mimeType: v.optional(v.string()),
      duration: v.optional(v.number()),
      dimensions: v.optional(v.object({
        width: v.number(),
        height: v.number(),
      })),
    })),
    caption: v.optional(v.string()),
    replyTo: v.optional(v.id("messages")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Verify user is a member of the room
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      throw new Error("Not a member of this room");
    }

    const messageId = await ctx.db.insert("messages", {
      roomId: args.roomId,
      senderId: userId,
      type: args.type,
      content: args.caption,
      mediaId: args.mediaId,
      mediaMetadata: args.metadata,
      replyTo: args.replyTo,
      isDeleted: false,
      deliveryStatus: "sent",
    });

    // Update room's last message
    const lastMessageText = args.caption || `${args.type} message`;
    await ctx.db.patch(args.roomId, {
      lastMessageAt: Date.now(),
      lastMessage: lastMessageText.substring(0, 100),
    });

    // Update unread counts for other members
    const otherMembers = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => 
        q.and(
          q.neq(q.field("userId"), userId),
          q.eq(q.field("isActive"), true)
        )
      )
      .collect();

    for (const member of otherMembers) {
      await ctx.db.patch(member._id, {
        unreadCount: member.unreadCount + 1,
      });
    }

    return messageId;
  },
});

// Get messages for a room (paginated)
export const getMessages = query({
  args: {
    roomId: v.id("rooms"),
    paginationOpts: paginationOptsValidator,
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { page: [], isDone: true, continueCursor: "" };

    // Verify user is a member of the room
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      return { page: [], isDone: true, continueCursor: "" };
    }

    const result = await ctx.db
      .query("messages")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .order("desc")
      .paginate(args.paginationOpts);

    // Enrich messages with sender profiles and media URLs
    const enrichedMessages = await Promise.all(
      result.page.map(async (message) => {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();

        let mediaUrl = null;
        if (message.mediaId) {
          mediaUrl = await ctx.storage.getUrl(message.mediaId);
        }

        // Get reply message if exists
        let replyMessage = null;
        if (message.replyTo) {
          replyMessage = await ctx.db.get(message.replyTo);
        }

        // Get reactions
        const reactions = await ctx.db
          .query("messageReactions")
          .withIndex("by_message", (q) => q.eq("messageId", message._id))
          .collect();

        return {
          ...message,
          sender: senderProfile,
          mediaUrl,
          replyMessage,
          reactions,
        };
      })
    );

    return {
      ...result,
      page: enrichedMessages,
      continueCursor: result.continueCursor || "",
    };
  },
});

// Mark messages as read
export const markAsRead = mutation({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership) {
      throw new Error("Not a member of this room");
    }

    await ctx.db.patch(membership._id, {
      lastReadAt: Date.now(),
      unreadCount: 0,
    });

    return true;
  },
});

// Edit a message
export const editMessage = mutation({
  args: {
    messageId: v.id("messages"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== userId) {
      throw new Error("Can only edit your own messages");
    }

    if (message.type !== "text") {
      throw new Error("Can only edit text messages");
    }

    await ctx.db.patch(args.messageId, {
      content: args.content,
      editedAt: Date.now(),
    });

    return true;
  },
});

// Delete a message
export const deleteMessage = mutation({
  args: { messageId: v.id("messages") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const message = await ctx.db.get(args.messageId);
    if (!message) throw new Error("Message not found");

    if (message.senderId !== userId) {
      throw new Error("Can only delete your own messages");
    }

    await ctx.db.patch(args.messageId, {
      isDeleted: true,
      content: undefined,
    });

    return true;
  },
});

// Add reaction to message
export const addReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Check if reaction already exists
    const existingReaction = await ctx.db
      .query("messageReactions")
      .withIndex("by_message_and_user", (q) => 
        q.eq("messageId", args.messageId).eq("userId", userId)
      )
      .filter((q) => q.eq(q.field("emoji"), args.emoji))
      .unique();

    if (existingReaction) {
      // Remove reaction if it exists
      await ctx.db.delete(existingReaction._id);
    } else {
      // Add new reaction
      await ctx.db.insert("messageReactions", {
        messageId: args.messageId,
        userId,
        emoji: args.emoji,
      });
    }

    return true;
  },
});

// Search messages
export const searchMessages = query({
  args: {
    roomId: v.optional(v.id("rooms")),
    query: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    let searchQuery = ctx.db
      .query("messages")
      .withSearchIndex("search_content", (q) => q.search("content", args.query));

    if (args.roomId) {
      searchQuery = searchQuery.filter((q) => q.eq(q.field("roomId"), args.roomId));
    }

    const messages = await searchQuery.take(50);

    // Filter messages from rooms user has access to
    const accessibleMessages = [];
    for (const message of messages) {
      const membership = await ctx.db
        .query("roomMembers")
        .withIndex("by_room_and_user", (q) => 
          q.eq("roomId", message.roomId).eq("userId", userId)
        )
        .unique();

      if (membership && membership.isActive) {
        const senderProfile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", message.senderId))
          .unique();

        accessibleMessages.push({
          ...message,
          sender: senderProfile,
        });
      }
    }

    return accessibleMessages;
  },
});

// Generate upload URL for media
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    return await ctx.storage.generateUploadUrl();
  },
});

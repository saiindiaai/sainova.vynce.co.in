import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Create a new room (group chat)
export const createRoom = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    participants: v.array(v.id("users")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Include creator in participants
    const allParticipants = [...new Set([userId, ...args.participants])];

    const roomId = await ctx.db.insert("rooms", {
      type: "group",
      name: args.name,
      description: args.description,
      createdBy: userId,
      isActive: true,
      participants: allParticipants,
      participantCount: allParticipants.length,
    });

    // Add all participants as members
    for (const participantId of allParticipants) {
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: participantId,
        role: participantId === userId ? "admin" : "member",
        joinedAt: Date.now(),
        unreadCount: 0,
        isMuted: false,
        isActive: true,
      });
    }

    return roomId;
  },
});

// Create or get direct message room
export const createDirectMessage = mutation({
  args: { otherUserId: v.id("users") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (userId === args.otherUserId) {
      throw new Error("Cannot create DM with yourself");
    }

    // Check if DM already exists
    const existingRooms = await ctx.db
      .query("rooms")
      .withIndex("by_type", (q) => q.eq("type", "direct"))
      .filter((q) => q.eq(q.field("participantCount"), 2))
      .collect();

    const existingRoom = existingRooms.find(room => 
      room.participants.includes(userId) && room.participants.includes(args.otherUserId)
    );

    if (existingRoom) {
      return existingRoom._id;
    }

    // Create new DM room
    const participants = [userId, args.otherUserId].sort();
    const roomId = await ctx.db.insert("rooms", {
      type: "direct",
      createdBy: userId,
      isActive: true,
      participants,
      participantCount: 2,
    });

    // Add both users as members
    for (const participantId of participants) {
      await ctx.db.insert("roomMembers", {
        roomId,
        userId: participantId,
        role: "member",
        joinedAt: Date.now(),
        unreadCount: 0,
        isMuted: false,
        isActive: true,
      });
    }

    return roomId;
  },
});

// Get user's rooms
export const getUserRooms = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const rooms = await Promise.all(
      memberships.map(async (membership) => {
        const room = await ctx.db.get(membership.roomId);
        if (!room) return null;

        // For direct messages, get the other user's profile
        let displayName = room.name;
        let avatar = room.avatar;
        let avatarUrl = room.avatar ? await ctx.storage.getUrl(room.avatar) : null;

        if (room.type === "direct") {
          const otherUserId = room.participants.find(id => id !== userId);
          if (otherUserId) {
            const otherProfile = await ctx.db
              .query("profiles")
              .withIndex("by_user", (q) => q.eq("userId", otherUserId))
              .unique();
            
            if (otherProfile) {
              displayName = otherProfile.displayName;
              avatar = otherProfile.avatar;
              avatarUrl = otherProfile.avatar ? await ctx.storage.getUrl(otherProfile.avatar) : null;
            }
          }
        }

        return {
          ...room,
          displayName,
          avatar,
          avatarUrl,
          unreadCount: membership.unreadCount,
          isMuted: membership.isMuted,
          lastReadAt: membership.lastReadAt,
        };
      })
    );

    return rooms
      .filter(room => room !== null)
      .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0));
  },
});

// Get room details
export const getRoom = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    // Check if user is a member
    const membership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", userId)
      )
      .unique();

    if (!membership || !membership.isActive) {
      return null;
    }

    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    // Get all members with their profiles
    const memberships = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const members = await Promise.all(
      memberships.map(async (membership) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", membership.userId))
          .unique();

        return {
          userId: membership.userId,
          role: membership.role,
          joinedAt: membership.joinedAt,
          profile,
        };
      })
    );

    return {
      ...room,
      members,
      currentUserRole: membership.role,
    };
  },
});

// Add user to room
export const addUserToRoom = mutation({
  args: {
    roomId: v.id("rooms"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUserId = await getAuthUserId(ctx);
    if (!currentUserId) throw new Error("Not authenticated");

    const room = await ctx.db.get(args.roomId);
    if (!room || room.type !== "group") {
      throw new Error("Room not found or not a group");
    }

    // Check if current user is admin
    const currentMembership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", currentUserId)
      )
      .unique();

    if (!currentMembership || currentMembership.role !== "admin") {
      throw new Error("Not authorized");
    }

    // Check if user is already a member
    const existingMembership = await ctx.db
      .query("roomMembers")
      .withIndex("by_room_and_user", (q) => 
        q.eq("roomId", args.roomId).eq("userId", args.userId)
      )
      .unique();

    if (existingMembership) {
      if (existingMembership.isActive) {
        throw new Error("User is already a member");
      }
      // Reactivate membership
      await ctx.db.patch(existingMembership._id, {
        isActive: true,
        joinedAt: Date.now(),
      });
    } else {
      // Add new member
      await ctx.db.insert("roomMembers", {
        roomId: args.roomId,
        userId: args.userId,
        role: "member",
        joinedAt: Date.now(),
        unreadCount: 0,
        isMuted: false,
        isActive: true,
      });
    }

    // Update room participants
    const updatedParticipants = [...room.participants, args.userId];
    await ctx.db.patch(args.roomId, {
      participants: updatedParticipants,
      participantCount: updatedParticipants.length,
    });

    return true;
  },
});

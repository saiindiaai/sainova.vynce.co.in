import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Update user presence
export const updatePresence = mutation({
  args: {
    status: v.union(v.literal("online"), v.literal("offline"), v.literal("away")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        status: args.status,
        lastSeen: Date.now(),
      });
    }

    return true;
  },
});

// Get online users in a room
export const getOnlineUsers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Get room members
    const members = await ctx.db
      .query("roomMembers")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get their profiles and filter online users
    const onlineUsers = [];
    for (const member of members) {
      const profile = await ctx.db
        .query("profiles")
        .withIndex("by_user", (q) => q.eq("userId", member.userId))
        .unique();

      if (profile && profile.status === "online") {
        onlineUsers.push({
          userId: member.userId,
          profile,
        });
      }
    }

    return onlineUsers;
  },
});

// Heartbeat to maintain online status
export const heartbeat = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (profile) {
      await ctx.db.patch(profile._id, {
        lastSeen: Date.now(),
        status: "online",
      });
    }

    return true;
  },
});

// Set users offline if they haven't been seen recently
export const cleanupOfflineUsers = internalMutation({
  args: {},
  handler: async (ctx) => {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    const staleProfiles = await ctx.db
      .query("profiles")
      .withIndex("by_status", (q) => q.eq("status", "online"))
      .filter((q) => q.lt(q.field("lastSeen"), fiveMinutesAgo))
      .collect();

    for (const profile of staleProfiles) {
      await ctx.db.patch(profile._id, {
        status: "offline",
      });
    }
  },
});

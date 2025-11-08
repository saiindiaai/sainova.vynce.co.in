import { v } from "convex/values";
import { query, mutation, internalMutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

// Set typing indicator
export const setTyping = mutation({
  args: {
    roomId: v.id("rooms"),
    isTyping: v.boolean(),
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

    if (args.isTyping) {
      // Set typing indicator with 5-second expiry
      const expiresAt = Date.now() + 5000;
      
      const existingIndicator = await ctx.db
        .query("typingIndicators")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .unique();

      if (existingIndicator) {
        await ctx.db.patch(existingIndicator._id, { expiresAt });
      } else {
        await ctx.db.insert("typingIndicators", {
          roomId: args.roomId,
          userId,
          expiresAt,
        });
      }

      // Schedule cleanup
      await ctx.scheduler.runAfter(5000, internal.typing.cleanupExpiredIndicators, {});
    } else {
      // Remove typing indicator
      const indicator = await ctx.db
        .query("typingIndicators")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .filter((q) => q.eq(q.field("roomId"), args.roomId))
        .unique();

      if (indicator) {
        await ctx.db.delete(indicator._id);
      }
    }

    return true;
  },
});

// Get typing users for a room
export const getTypingUsers = query({
  args: { roomId: v.id("rooms") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const now = Date.now();
    const indicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_room", (q) => q.eq("roomId", args.roomId))
      .filter((q) => 
        q.and(
          q.gt(q.field("expiresAt"), now),
          q.neq(q.field("userId"), userId)
        )
      )
      .collect();

    // Get profiles for typing users
    const typingUsers = await Promise.all(
      indicators.map(async (indicator) => {
        const profile = await ctx.db
          .query("profiles")
          .withIndex("by_user", (q) => q.eq("userId", indicator.userId))
          .unique();
        
        return profile;
      })
    );

    return typingUsers.filter(profile => profile !== null);
  },
});

// Internal function to cleanup expired typing indicators
export const cleanupExpiredIndicators = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const expiredIndicators = await ctx.db
      .query("typingIndicators")
      .withIndex("by_expires", (q) => q.lt("expiresAt", now))
      .collect();

    for (const indicator of expiredIndicators) {
      await ctx.db.delete(indicator._id);
    }
  },
});

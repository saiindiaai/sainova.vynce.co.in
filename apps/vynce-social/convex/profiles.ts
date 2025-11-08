import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;

const sanitizeDisplayName = (name?: string | null) => {
  if (name === undefined || name === null) {
    return undefined;
  }
  const trimmed = name.trim();
  if (trimmed.length < 2) {
    throw new Error("Display name must be at least 2 characters long");
  }
  if (trimmed.length > 50) {
    throw new Error("Display name must be 50 characters or fewer");
  }
  return trimmed;
};

const withAvatarUrl = async (ctx: any, profile: any | null) => {
  if (!profile) return null;
  const avatarUrl = profile.avatar ? await ctx.storage.getUrl(profile.avatar) : null;
  return { ...profile, avatarUrl };
};

// Get current user's profile
export const getCurrentProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    return await withAvatarUrl(ctx, profile);
  },
});

export const ensureProfile = mutation({
  args: {},
  returns: v.id("profiles"),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Not authenticated");
    }

    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      await ctx.db.patch(existingProfile._id, {
        lastSeen: Date.now(),
        status: "online",
      });
      return existingProfile._id;
    }

    const userRecord = await ctx.db.get(userId);
    const rawName = typeof (userRecord as any)?.name === "string" ? (userRecord as any).name : null;
    const rawEmail = typeof (userRecord as any)?.email === "string" ? (userRecord as any).email : null;

    const fallbackName = rawName?.trim().length
      ? rawName.trim()
      : rawEmail?.split("@")[0] ?? "New user";
    const displayName = sanitizeDisplayName(fallbackName) ?? "New user";

    const profileId = await ctx.db.insert("profiles", {
      userId,
      displayName,
      status: "online",
      lastSeen: Date.now(),
    });

    return profileId;
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    displayName: v.optional(v.string()),
    avatar: v.optional(v.id("_storage")),
    status: v.optional(v.union(v.literal("online"), v.literal("offline"), v.literal("away"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    const sanitizedDisplayName = sanitizeDisplayName(args.displayName);

    if (args.avatar) {
      const metadata = await ctx.storage.getMetadata(args.avatar);
      if (!metadata) {
        throw new Error("Uploaded image not found. Please try again.");
      }

      if (!metadata.contentType || !ALLOWED_IMAGE_TYPES.includes(metadata.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
        await ctx.storage.delete(args.avatar);
        throw new Error("Unsupported image format. Please upload JPG, PNG, or WEBP.");
      }

      if (metadata.size > MAX_IMAGE_SIZE_BYTES) {
        await ctx.storage.delete(args.avatar);
        throw new Error("Image is too large. Maximum size is 5MB.");
      }
    }

    if (!profile) {
      // Create new profile
      const newProfileId = await ctx.db.insert("profiles", {
        userId,
        displayName: sanitizedDisplayName || "User",
        avatar: args.avatar,
        status: args.status || "online",
        lastSeen: Date.now(),
      });

      const insertedProfile = await ctx.db.get(newProfileId);
      return await withAvatarUrl(ctx, insertedProfile);
    }

    // Update existing profile
    const updatePayload: Record<string, any> = {
      lastSeen: Date.now(),
    };

    if (sanitizedDisplayName !== undefined) {
      updatePayload.displayName = sanitizedDisplayName;
    }

    if (args.avatar) {
      updatePayload.avatar = args.avatar;
    }

    if (args.status) {
      updatePayload.status = args.status;
    }

    await ctx.db.patch(profile._id, updatePayload);

    const updatedProfile = await ctx.db.get(profile._id);
    return await withAvatarUrl(ctx, updatedProfile);
  },
});

export const generateAvatarUploadUrl = mutation({
  args: {
    contentType: v.string(),
    contentLength: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    if (!ALLOWED_IMAGE_TYPES.includes(args.contentType as (typeof ALLOWED_IMAGE_TYPES)[number])) {
      throw new Error("Unsupported image format. Please upload JPG, PNG, or WEBP.");
    }

    if (args.contentLength > MAX_IMAGE_SIZE_BYTES) {
      throw new Error("Image is too large. Maximum size is 5MB.");
    }

    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl, maxSize: MAX_IMAGE_SIZE_BYTES };
  },
});

// Get profile by user ID
export const getProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .unique();

    return await withAvatarUrl(ctx, profile);
  },
});

// Search users by display name
export const searchUsers = query({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const profiles = await ctx.db.query("profiles").collect();
    
    return profiles
      .filter(profile => 
        profile.userId !== userId &&
        profile.displayName.toLowerCase().includes(args.query.toLowerCase())
      )
      .slice(0, 20);
  },
});

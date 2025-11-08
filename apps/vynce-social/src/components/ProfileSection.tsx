import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { toast } from "sonner";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

interface ProfileSectionProps {
  profile: {
    _id: Id<"profiles">;
    userId: Id<"users">;
    displayName: string;
    status?: "online" | "offline" | "away";
    avatar?: Id<"_storage">;
    avatarUrl?: string | null;
  };
}

export function ProfileSection({ profile }: ProfileSectionProps) {
  const updateProfile = useMutation(api.profiles.updateProfile);
  const generateUploadUrl = useMutation(api.profiles.generateAvatarUploadUrl);

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(profile.displayName);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);

  const currentAvatar = useMemo(() => {
    if (localPreviewUrl) {
      return localPreviewUrl;
    }
    return profile.avatarUrl ?? null;
  }, [localPreviewUrl, profile.avatarUrl]);

  useEffect(() => {
    setUsername(profile.displayName);
  }, [profile.displayName, profile._id]);

  useEffect(() => {
    return () => {
      if (localPreviewUrl) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  const handleUsernameSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = username.trim();

    if (!trimmed || trimmed === profile.displayName) {
      setIsEditing(false);
      setUsername(profile.displayName);
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({ displayName: trimmed });
      toast.success("Profile updated");
      setIsEditing(false);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not update profile";
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      toast.error("Unsupported image type. Use JPG, PNG, or WEBP.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("Image is too large. Max size is 5MB.");
      event.target.value = "";
      return;
    }

    setIsUploading(true);
    try {
      const { uploadUrl } = await generateUploadUrl({
        contentType: file.type,
        contentLength: file.size,
      });

      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": file.type,
        },
        body: file,
      });

      if (!response.ok) {
        throw new Error("Upload failed");
      }

      const { storageId } = (await response.json()) as { storageId: Id<"_storage"> };
      await updateProfile({ avatar: storageId });

      const preview = URL.createObjectURL(file);
      setLocalPreviewUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return preview;
      });

      toast.success("Profile image updated");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not upload image";
      toast.error(message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative">
          {currentAvatar ? (
            <img
              src={currentAvatar}
              alt={`${profile.displayName}'s avatar`}
              className="w-14 h-14 rounded-full object-cover border border-gray-200"
            />
          ) : (
            <div className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center text-xl font-semibold">
              {profile.displayName.charAt(0).toUpperCase()}
            </div>
          )}
          <label className="absolute bottom-0 right-0 bg-white border border-gray-200 rounded-full p-1 shadow cursor-pointer hover:bg-gray-50">
            <input
              type="file"
              accept={ALLOWED_IMAGE_TYPES.join(",")}
              className="hidden"
              onChange={handleImageChange}
              disabled={isUploading}
            />
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-2.586-2.586a2 2 0 00-1.414-.586H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9a2 2 0 00-.586-1.414L17 7h-1.828z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11a3 3 0 100 6 3 3 0 000-6z" />
            </svg>
          </label>
        </div>
        <div>
          <div className="font-semibold text-gray-900">{profile.displayName}</div>
          <div className="text-sm text-gray-500 capitalize">{profile.status ?? "online"}</div>
        </div>
      </div>

      <button
        type="button"
        className="text-sm font-medium text-primary hover:text-primary-hover"
        onClick={() => setIsEditing((prev) => !prev)}
      >
        {isEditing ? "Close profile editor" : "Edit profile"}
      </button>

      {isEditing && (
        <form className="space-y-3" onSubmit={handleUsernameSubmit}>
          <div>
            <label htmlFor="profile-username" className="block text-sm font-medium text-gray-700">
              Username
            </label>
            <input
              id="profile-username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              maxLength={50}
            />
            <p className="mt-1 text-xs text-gray-500">Between 2 and 50 characters. Visible to other users.</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="px-3 py-2 bg-primary text-white rounded-md shadow-sm hover:bg-primary-hover disabled:opacity-60"
              disabled={isSaving || username.trim() === profile.displayName}
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="px-3 py-2 text-sm text-gray-600 hover:text-gray-800"
              onClick={() => {
                setIsEditing(false);
                setUsername(profile.displayName);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}


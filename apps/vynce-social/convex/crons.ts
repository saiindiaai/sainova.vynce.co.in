import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Clean up expired typing indicators every minute
crons.interval(
  "cleanup typing indicators",
  { minutes: 1 },
  internal.typing.cleanupExpiredIndicators,
  {}
);

// Set offline users who haven't been seen in 5 minutes
crons.interval(
  "cleanup offline users",
  { minutes: 2 },
  internal.presence.cleanupOfflineUsers,
  {}
);

export default crons;

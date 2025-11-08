/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as auth from "../auth.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as messages from "../messages.js";
import type * as presence from "../presence.js";
import type * as profiles from "../profiles.js";
import type * as rooms from "../rooms.js";
import type * as router from "../router.js";
import type * as typing from "../typing.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  crons: typeof crons;
  http: typeof http;
  messages: typeof messages;
  presence: typeof presence;
  profiles: typeof profiles;
  rooms: typeof rooms;
  router: typeof router;
  typing: typeof typing;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

"use server";

import { getServerAgent } from "@/app/discover/authActions";

// export async function searchActors(query: string) {
//   const agent = await getServerAgent();
//   if (!agent) {
//     throw new Error("Not authenticated");
//   }

//   const response = await agent.searchActorsTypeahead({
//     term: query,
//     limit: 30,
//   });

//   return response.data.actors.map((actor) => ({
//     did: actor.did,
//     handle: actor.handle,
//     displayName: actor.displayName,
//     avatar: actor.avatar,
//   }));
// }

// export async function getFeedInfo(uri: string) {
//   const agent = await getServerAgent();
//   if (!agent) {
//     throw new Error("Not authenticated");
//   }

//   try {
//     // Log the normalized URI for debugging
//     console.log("Fetching feed info for:", uri);

//     const response = await agent.app.bsky.feed.getFeedGenerator({
//       feed: uri,
//     });
//     console.log("Response:", response);

//     if (!response.success) {
//       throw new Error("Failed to fetch feed");
//     }

//     return {
//       uri: response.data.view.uri,
//       name: response.data.view.displayName,
//       description: response.data.view.description,
//       avatar: response.data.view.avatar,
//       likeCount: response.data.view.likeCount,
//       creator: {
//         did: response.data.view.creator.did,
//         handle: response.data.view.creator.handle,
//         displayName: response.data.view.creator.displayName,
//       },
//     };
//   } catch (error) {
//     console.error("Error fetching feed:", error);
//     throw new Error("Failed to fetch feed information");
//   }
// }

// async function resolveHandle(handle: string): Promise<string> {
//   const agent = await getServerAgent();
//   if (!agent) {
//     throw new Error("Not authenticated");
//   }

//   const response = await agent.resolveHandle({ handle });
//   if (!response.success) {
//     throw new Error(`Could not resolve handle: ${handle}`);
//   }
//   return response.data.did;
// }

// async function normalizeFeedUrl(url: string): Promise<string> {
//   // If it's already in the correct format, return as is
//   if (url.startsWith("at://")) {
//     return url;
//   }

//   // Handle bsky.app URLs
//   if (url.includes("bsky.app/profile/")) {
//     const match = url.match(
//       /bsky\.app\/profile\/(did:[^/]+|[^/]+)\/feed\/([^/?]+)/
//     );
//     if (match) {
//       const [, identifier, feedName] = match;
//       // If it's a DID, we can construct the AT URI directly
//       if (identifier.startsWith("did:")) {
//         return `at://${identifier}/app.bsky.feed.generator/${feedName}`;
//       }
//       // Resolve handle to DID
//       const did = await resolveHandle(identifier);
//       return `at://${did}/app.bsky.feed.generator/${feedName}`;
//     }
//   }

//   throw new Error(
//     "Please enter a valid feed URI (at://did:plc:.../app.bsky.feed.generator/...)"
//   );
// }

// export async function addNewFeed(prevState: any, formData: FormData) {
//   const rawUrl = formData.get("feedUrl") as string;
//   const feedUrl = await normalizeFeedUrl(rawUrl);

//   const feedInfo = await getFeedInfo(feedUrl);

//   return {
//     success: true,
//     feed: {
//       id: crypto.randomUUID(),
//       url: feedUrl,
//       ...feedInfo,
//     },
//   };
// }

// Add a new function to get fresh profile info
export async function getProfileInfo(did: string) {
  const agent = await getServerAgent();
  if (!agent) {
    throw new Error("Not authenticated");
  }

  const response = await agent.getProfile({
    actor: did,
  });

  if (!response.success) {
    throw new Error("Failed to fetch profile");
  }

  return {
    did: response.data.did,
    handle: response.data.handle,
    displayName: response.data.displayName,
    avatar: response.data.avatar,
  };
}

// Update FeedHeader to use this function
export async function getFeedHeaderInfo(creatorDid: string) {
  try {
    const profile = await getProfileInfo(creatorDid);
    return {
      avatar: profile.avatar,
      displayName: profile.displayName,
      handle: profile.handle,
    };
  } catch (error) {
    console.error("Error fetching profile:", error);
    return null;
  }
}

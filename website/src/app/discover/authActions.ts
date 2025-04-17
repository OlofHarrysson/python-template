"use server";

import { AtpAgent } from "@atproto/api";
import { cookies } from "next/headers";
const identifier = process.env.BSKY_IDENTIFIER!;
const password = process.env.BSKY_PASSWORD!;
// TODO: login and password not set atm

export async function getServerAgent() {
  const cookieStore = await cookies();
  const authCookie = cookieStore.get("bsky_auth");

  const agent = new AtpAgent({ service: "https://bsky.social" });

  try {
    // First try to resume from cookie if available
    if (authCookie?.value) {
      const session = JSON.parse(authCookie.value);
      try {
        await agent.resumeSession({
          accessJwt: session.accessJwt,
          refreshJwt: session.refreshJwt,
          handle: session.handle,
          did: session.did,
          active: true,
        });
        return agent;
      } catch (error) {
        console.log(
          "Resume session failed, falling back to env credentials. Error:",
          error
        );
        cookieStore.delete("bsky_auth");
      }
    }

    const response = await agent.login({
      identifier,
      password,
    });

    // Save the new session in cookie
    const sessionData = {
      accessJwt: response.data.accessJwt,
      refreshJwt: response.data.refreshJwt,
      handle: response.data.handle,
      did: response.data.did,
    };

    cookieStore.set("bsky_auth", JSON.stringify(sessionData), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
    });

    return agent;
  } catch (error) {
    console.error("Server agent error:", error);
    throw new Error("Failed to create bluesky agent");
  }
}

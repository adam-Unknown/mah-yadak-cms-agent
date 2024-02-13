import { agentSession, sessionOptions } from "@/session.config";
import { getIronSession } from "iron-session";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const session = await getIronSession<agentSession>(
      cookies(),
      sessionOptions
    );

    session.destroy();
  } catch (e) {
    return new Response("Failed!", {
      status: 500,
    });
  }
  return new Response("Done!", {
    status: 200,
  });
}

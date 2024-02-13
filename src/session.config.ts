export const sessionOptions = {
  cookieName: "agent",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
  },
};

export type agentSession = { verified: boolean };

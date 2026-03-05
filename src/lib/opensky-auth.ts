const TOKEN_URL =
  "/api/opensky-auth/auth/realms/opensky-network/protocol/openid-connect/token";

const CLIENT_ID = import.meta.env.VITE_OPENSKY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_OPENSKY_CLIENT_SECRET;

let cachedToken: string | null = null;
let tokenExpiresAt = 0;

/**
 * Returns a valid Bearer token for the OpenSky API.
 * Caches the token and refreshes 60s before expiry.
 * Returns null if credentials are not configured.
 */
export async function getOpenSkyToken(): Promise<string | null> {
  if (!CLIENT_ID || !CLIENT_SECRET) return null;

  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && Date.now() < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    console.error("OpenSky auth failed:", res.status, await res.text());
    return null;
  }

  const data = await res.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + data.expires_in * 1000;
  return cachedToken;
}

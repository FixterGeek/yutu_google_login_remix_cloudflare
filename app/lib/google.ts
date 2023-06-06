declare global {
  const GOOGLE_SECRET: string;
  const GOOGLE_CLIENT_ID: string;
  const ENV: string;
}

const prodURL = "https://remix-cloudflare-workers.blissmo.workers.dev";

export const getExtraData = (
  access_token: string
): Promise<Record<string, any>> => {
  const url = "https://www.googleapis.com/oauth2/v2/userinfo";
  return fetch(url, {
    headers: {
      Authorization: "Bearer " + access_token,
    },
  })
    .then((r) => r.json())
    .catch((e) => ({ ok: false, error: e })) as Promise<Record<string, any>>;
};

export const getAccessToken = async (
  code: string
): Promise<Record<string, any>> => {
  if (!GOOGLE_SECRET || !GOOGLE_CLIENT_ID)
    return new Error("missing env object");
  const url =
    "https://oauth2.googleapis.com/token?" +
    new URLSearchParams({
      code,
      client_secret: GOOGLE_SECRET,
      grant_type: "authorization_code",
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: ENV === "development" ? "http://localhost:8787" : prodURL,
      scope: "https://www.googleapis.com/auth/userinfo.email",
    });
  return fetch(url, {
    method: "post",
    headers: { "content-type": "application/json" },
  })
    .then((r) => r.json())
    .catch((e) => ({ ok: false, error: e })) as Promise<Record<string, any>>;
};

export function redirectToGoogle<Redirect extends (arg0: string) => Response>(
  redirect: Redirect
): Response {
  if (!GOOGLE_SECRET || !GOOGLE_CLIENT_ID) {
    throw new Error("Missing env variables");
  }
  const obj = {
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: ENV === "development" ? "http://localhost:8787" : prodURL,
    response_type: "code",
    scope: "https://www.googleapis.com/auth/userinfo.email",
  };
  const url =
    "https://accounts.google.com/o/oauth2/auth?" + new URLSearchParams(obj);
  return redirect(url);
}

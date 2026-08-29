export async function getReaderId(request: Request) {
  const identity = request.headers.get("oai-authenticated-user-email") ?? "private-site-reader";
  const bytes = new TextEncoder().encode(identity.toLowerCase());
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return "reader_" + Array.from(new Uint8Array(digest)).slice(0, 10).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function requireSiteUser(request: Request) {
  if (!request.headers.get("oai-authenticated-user-email")) {
    return Response.json({ error: "Admin access requires the authenticated Site owner." }, { status: 403 });
  }
  return null;
}

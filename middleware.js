// Vercel runs this before every request, so the whole site, pictures
// included, sits behind a browser username/password prompt. The details
// live in the Vercel project's environment variables, not here, because
// this repository is public.
const USER = process.env.BASIC_AUTH_USER;
const PASSWORD = process.env.BASIC_AUTH_PASSWORD;

const challenge = () =>
  new Response("Authentication required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="DeOne", charset="UTF-8"' },
  });

export default function middleware(request) {
  // Stay locked rather than open if the variables were never set.
  if (!USER || !PASSWORD) {
    return new Response("Site login is not configured", { status: 503 });
  }

  const [scheme, encoded] = (request.headers.get("authorization") ?? "").split(" ");
  if (scheme !== "Basic" || !encoded) return challenge();

  let decoded;
  try {
    decoded = atob(encoded);
  } catch {
    return challenge();
  }

  // Split on the first colon only; a password may contain one.
  const i = decoded.indexOf(":");
  if (i === -1 || decoded.slice(0, i) !== USER || decoded.slice(i + 1) !== PASSWORD) {
    return challenge();
  }

  // Returning nothing lets the request carry on to the page.
}

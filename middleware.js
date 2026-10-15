// Vercel runs this before every request. While the site is private, anyone who hasn't
// signed in is sent to the sign-in page (src/pages/access.astro), and this checks what
// its form posts back. The username and password live in the Vercel project's
// environment variables, not here, because this repository is public.
const USER = process.env.BASIC_AUTH_USER;
const PASSWORD = process.env.BASIC_AUTH_PASSWORD;

const ACCESS_PAGE = "/access";
const COOKIE = "deone_access";
const THIRTY_DAYS = 60 * 60 * 24 * 30;

const isAccessPage = (path) => path === ACCESS_PAGE || path === `${ACCESS_PAGE}/`;

// What the sign-in page needs before anyone has signed in: the site's built styles and
// scripts, its tab icon and the pattern behind it.
const isPublic = (path) =>
  isAccessPage(path) ||
  /^\/_astro\/[^/]+\.(css|js)$/.test(path) ||
  path === "/logo.svg" ||
  path === "/footer-pattern.svg";

// The cookie holds a digest of the username and password, so it can't be made up without
// them, and changing either signs everyone out.
async function accessToken() {
  const bytes = new TextEncoder().encode(`deone-access:${USER}:${PASSWORD}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function readCookie(request, name) {
  for (const part of (request.headers.get("cookie") ?? "").split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return value.join("=");
  }
}

// Only ever send people on to a page of this site. The address is read as a browser would
// read it, which ignores tabs and treats \ as /, so nothing can sneak "//elsewhere" past.
function safeNext(value, origin) {
  if (typeof value !== "string") return "/";
  try {
    const target = new URL(value, origin);
    if (target.origin === origin) return `/${target.pathname.replace(/^\/+/, "")}${target.search}`;
  } catch {}
  return "/";
}

const redirect = (location, status = 302, headers = {}) =>
  new Response(null, { status, headers: { Location: location, ...headers } });

export default async function middleware(request) {
  // Stay locked rather than open if the variables were never set.
  if (!USER || !PASSWORD) {
    return new Response("Site login is not configured", { status: 503 });
  }

  const url = new URL(request.url);
  const token = await accessToken();

  if (request.method === "POST" && isAccessPage(url.pathname)) {
    let form;
    try {
      form = await request.formData();
    } catch {
      return redirect(`${ACCESS_PAGE}?error=1`, 303);
    }
    const next = safeNext(form.get("next"), url.origin);
    if (form.get("username") !== USER || form.get("password") !== PASSWORD) {
      return redirect(`${ACCESS_PAGE}?error=1&next=${encodeURIComponent(next)}`, 303);
    }
    return redirect(next, 303, {
      "Set-Cookie": `${COOKIE}=${token}; Path=/; Max-Age=${THIRTY_DAYS}; HttpOnly; Secure; SameSite=Lax`,
    });
  }

  if (readCookie(request, COOKIE) === token) {
    // Someone already signed in has no need of the sign-in page.
    if (isAccessPage(url.pathname)) return redirect(safeNext(url.searchParams.get("next"), url.origin));
    return; // Returning nothing lets the request carry on to the page.
  }

  if (isPublic(url.pathname)) return;

  // Pages go to the sign-in page, which remembers where they were headed; anything else,
  // such as a picture, is simply refused.
  if ((request.headers.get("accept") ?? "").includes("text/html")) {
    return redirect(`${ACCESS_PAGE}?next=${encodeURIComponent(url.pathname + url.search)}`);
  }
  return new Response("Sign in required", { status: 401 });
}

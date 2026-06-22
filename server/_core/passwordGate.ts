/**
 * Password Gate Middleware
 * Protects the entire site with a simple access password.
 * The password is stored in the SITE_PASSWORD env var.
 * Once entered correctly, a cookie is set for 30 days.
 */
import express, { Request, Response, NextFunction } from "express";
import crypto from "crypto";

const GATE_COOKIE = "cepho_gate";
const GATE_COOKIE_MAX_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days

function getPassword(): string {
  return process.env.SITE_PASSWORD ?? "123$4@";
}

function makeToken(password: string): string {
  return crypto.createHash("sha256").update(`cepho:${password}`).digest("hex");
}

/** HTML for the password gate page */
function gateHtml(error?: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>CEPHO — Access</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      min-height: 100vh;
      background: #000;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    }
    .card {
      background: #0d0d0d;
      border: 1px solid #1f1f1f;
      border-radius: 16px;
      padding: 48px 40px;
      width: 100%;
      max-width: 380px;
      text-align: center;
    }
    .brain {
      width: 64px;
      height: 64px;
      margin: 0 auto 24px;
      position: relative;
    }
    .brain svg { width: 100%; height: 100%; }
    .brand {
      font-size: 22px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      margin-bottom: 8px;
    }
    .subtitle {
      font-size: 13px;
      color: #555;
      margin-bottom: 36px;
      letter-spacing: 0.02em;
    }
    .field {
      position: relative;
      margin-bottom: 16px;
    }
    input[type="password"] {
      width: 100%;
      background: #111;
      border: 1px solid #2a2a2a;
      border-radius: 10px;
      color: #fff;
      font-size: 15px;
      padding: 14px 48px 14px 16px;
      outline: none;
      transition: border-color 0.2s;
      letter-spacing: 0.1em;
    }
    input[type="password"]:focus { border-color: #ff2d78; }
    .toggle-pw {
      position: absolute;
      right: 14px;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      cursor: pointer;
      color: #555;
      font-size: 16px;
      padding: 0;
      line-height: 1;
    }
    .toggle-pw:hover { color: #aaa; }
    .error {
      background: rgba(255, 45, 120, 0.1);
      border: 1px solid rgba(255, 45, 120, 0.3);
      border-radius: 8px;
      color: #ff2d78;
      font-size: 13px;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    button[type="submit"] {
      width: 100%;
      background: #ff2d78;
      border: none;
      border-radius: 10px;
      color: #fff;
      font-size: 15px;
      font-weight: 600;
      padding: 14px;
      cursor: pointer;
      transition: background 0.2s, transform 0.1s;
      letter-spacing: 0.03em;
    }
    button[type="submit"]:hover { background: #e0256a; }
    button[type="submit"]:active { transform: scale(0.98); }
    .footer {
      margin-top: 28px;
      font-size: 11px;
      color: #333;
      letter-spacing: 0.04em;
    }
  </style>
</head>
<body>
  <div class="card">
    <div class="brain">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="30" stroke="#ff2d78" stroke-width="1.5" opacity="0.3"/>
        <circle cx="32" cy="32" r="20" stroke="#ff2d78" stroke-width="1" opacity="0.5"/>
        <circle cx="32" cy="32" r="6" fill="#ff2d78"/>
        <line x1="32" y1="12" x2="32" y2="26" stroke="#ff2d78" stroke-width="1.5" opacity="0.7"/>
        <line x1="32" y1="38" x2="32" y2="52" stroke="#ff2d78" stroke-width="1.5" opacity="0.7"/>
        <line x1="12" y1="32" x2="26" y2="32" stroke="#ff2d78" stroke-width="1.5" opacity="0.7"/>
        <line x1="38" y1="32" x2="52" y2="32" stroke="#ff2d78" stroke-width="1.5" opacity="0.7"/>
        <line x1="18" y1="18" x2="27" y2="27" stroke="#ff2d78" stroke-width="1" opacity="0.5"/>
        <line x1="37" y1="37" x2="46" y2="46" stroke="#ff2d78" stroke-width="1" opacity="0.5"/>
        <line x1="46" y1="18" x2="37" y2="27" stroke="#ff2d78" stroke-width="1" opacity="0.5"/>
        <line x1="27" y1="37" x2="18" y2="46" stroke="#ff2d78" stroke-width="1" opacity="0.5"/>
        <circle cx="32" cy="12" r="2.5" fill="#ff2d78" opacity="0.8"/>
        <circle cx="32" cy="52" r="2.5" fill="#ff2d78" opacity="0.8"/>
        <circle cx="12" cy="32" r="2.5" fill="#ff2d78" opacity="0.8"/>
        <circle cx="52" cy="32" r="2.5" fill="#ff2d78" opacity="0.8"/>
        <circle cx="18" cy="18" r="2" fill="#ff2d78" opacity="0.6"/>
        <circle cx="46" cy="46" r="2" fill="#ff2d78" opacity="0.6"/>
        <circle cx="46" cy="18" r="2" fill="#ff2d78" opacity="0.6"/>
        <circle cx="18" cy="46" r="2" fill="#ff2d78" opacity="0.6"/>
      </svg>
    </div>
    <div class="brand">CEPHO</div>
    <div class="subtitle">Executive Intelligence Platform</div>
    ${error ? `<div class="error">${error}</div>` : ""}
    <form method="POST" action="/__gate">
      <div class="field">
        <input
          type="password"
          name="password"
          id="pw"
          placeholder="Access key"
          autofocus
          autocomplete="current-password"
        />
        <button type="button" class="toggle-pw" onclick="togglePw()" title="Show/hide">
          <span id="eye">👁</span>
        </button>
      </div>
      <button type="submit">Enter</button>
    </form>
    <div class="footer">CEPHO &copy; 2025 — Restricted Access</div>
  </div>
  <script>
    function togglePw() {
      const inp = document.getElementById('pw');
      inp.type = inp.type === 'password' ? 'text' : 'password';
    }
    // Pulse animation on nodes
    const circles = document.querySelectorAll('circle');
    circles.forEach((c, i) => {
      setInterval(() => {
        const op = 0.4 + Math.random() * 0.6;
        c.style.opacity = op.toString();
      }, 800 + i * 200);
    });
  </script>
</body>
</html>`;
}

/** Register the password gate on the Express app */
export function registerPasswordGate(app: ReturnType<typeof import("express").default>) {
  const password = getPassword();
  const validToken = makeToken(password);

  // POST handler — check submitted password
  app.post("/__gate", express.urlencoded({ extended: false }), (req: Request, res: Response) => {
    const submitted = (req.body?.password ?? "").trim();
    if (submitted === password) {
      res.cookie(GATE_COOKIE, validToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: GATE_COOKIE_MAX_AGE,
        path: "/",
      });
      const redirect = (req.query.next as string) || "/";
      return res.redirect(302, redirect);
    }
    return res.status(401).send(gateHtml("Incorrect access key. Please try again."));
  });

  // Middleware — check cookie on every request
  app.use((req: Request, res: Response, next: NextFunction) => {
    // Always allow: the gate page itself, static assets needed by the gate
    const path = req.path;
    if (
      path === "/__gate" ||
      path.startsWith("/api/") ||
      path.startsWith("/manus-storage/") ||
      path.startsWith("/@") ||
      path.startsWith("/node_modules/") ||
      path.match(/\.(ico|png|svg|webp|jpg|jpeg|gif|woff2?|ttf|eot)$/)
    ) {
      return next();
    }

    const cookies = parseCookies(req.headers.cookie ?? "");
    if (cookies[GATE_COOKIE] === validToken) {
      return next();
    }

    // Not authenticated — show gate
    return res.status(200).send(gateHtml());
  });
}

function parseCookies(cookieHeader: string): Record<string, string> {
  const result: Record<string, string> = {};
  cookieHeader.split(";").forEach(part => {
    const [key, ...vals] = part.trim().split("=");
    if (key) result[key.trim()] = decodeURIComponent(vals.join("="));
  });
  return result;
}

import type { CookieOptions, Request } from "express";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);

function isIpAddress(host: string) {
  // Basic IPv4 check and IPv6 presence detection.
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return true;
  return host.includes(":");
}

function isSecureRequest(req: Request) {
  if (req.protocol === "https") return true;

  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;

  const protoList = Array.isArray(forwardedProto)
    ? forwardedProto
    : forwardedProto.split(",");

  return protoList.some(proto => proto.trim().toLowerCase() === "https");
}

export function getSessionCookieOptions(
  req: Request
): Pick<CookieOptions, "domain" | "httpOnly" | "path" | "sameSite" | "secure"> {
  const hostname = req.hostname;

  // Determine if we should set a domain
  const shouldSetDomain =
    hostname &&
    !LOCAL_HOSTS.has(hostname) &&
    !isIpAddress(hostname) &&
    hostname !== "127.0.0.1" &&
    hostname !== "::1";

  // For production domains like cepho.ai or subdomains, set the domain
  // This allows the cookie to work across the entire domain
  let domain: string | undefined = undefined;
  if (shouldSetDomain) {
    // If hostname is cepho.ai or *.cepho.ai, set domain to .cepho.ai
    if (hostname.endsWith('cepho.ai')) {
      domain = '.cepho.ai';
    }
    // If hostname is *.onrender.com, set domain to the full hostname
    else if (hostname.endsWith('.onrender.com')) {
      domain = hostname;
    }
    // For other domains, use the hostname as-is
    else {
      domain = hostname;
    }
  }

  const isSecure = isSecureRequest(req);

  return {
    domain,
    httpOnly: true,
    path: "/",
    // Use "lax" for better compatibility while maintaining security
    // "none" requires secure=true and can cause issues in some browsers
    sameSite: "lax",
    secure: isSecure,
  };
}

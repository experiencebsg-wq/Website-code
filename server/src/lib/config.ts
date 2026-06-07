// Centralized config + fail-fast on required secrets.
// Importing this module throws at startup if a required secret is missing,
// so the server can never silently fall back to a guessable default.

function required(name: string): string {
  const value = process.env[name];
  if (!value || !value.trim()) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in the server environment (see server/.env.example).`
    );
  }
  return value;
}

// JWT secret used to sign/verify admin tokens. No insecure fallback.
export const JWT_SECRET = required('JWT_SECRET');

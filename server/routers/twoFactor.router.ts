/**
 * Two-Factor Authentication Router (Remediation Task 1.9)
 *
 * Implements TOTP-based 2FA for admin accounts using speakeasy.
 * Flow:
 *   1. POST /setup    → generate secret + QR code URI
 *   2. POST /verify   → confirm TOTP token, enable 2FA + issue backup codes
 *   3. POST /validate → verify token during login (called after password check)
 *   4. POST /disable  → disable 2FA (requires current TOTP token)
 */

import { z } from "zod";
import * as speakeasy from "speakeasy";
import * as QRCode from "qrcode";
import * as crypto from "crypto";
import { eq } from "drizzle-orm";
import { router, protectedProcedure } from "../_core/trpc";
import { db } from "../db";
import { users } from "../../drizzle/schema";

const APP_NAME = "CEPHO Brain";

/** Hash a backup code for storage */
function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code).digest("hex");
}

/** Generate 8 random backup codes */
function generateBackupCodes(): string[] {
  return Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString("hex").toUpperCase()
  );
}

export const twoFactorRouter = router({
  /**
   * Step 1: Generate a TOTP secret and return a QR code data URI.
   * The secret is stored (unverified) until the user confirms with a valid token.
   */
  setup: protectedProcedure.mutation(async ({ ctx }) => {
    const userId = ctx.user.id;

    // Generate a new TOTP secret
    const secret = speakeasy.generateSecret({
      name: `${APP_NAME} (${ctx.user.email ?? ctx.user.name ?? "Admin"})`,
      issuer: APP_NAME,
      length: 32,
    });

    // Store the secret (not yet enabled — user must verify first)
    await db
      .update(users)
      .set({ totpSecret: secret.base32, totpEnabled: false })
      .where(eq(users.id, userId));

    // Generate QR code as a data URI
    const qrCodeDataUri = await QRCode.toDataURL(secret.otpauth_url ?? "");

    return {
      secret: secret.base32,
      qrCode: qrCodeDataUri,
      otpauthUrl: secret.otpauth_url,
    };
  }),

  /**
   * Step 2: Verify the first TOTP token to confirm setup, then enable 2FA.
   * Returns 8 backup codes the user must save.
   */
  verify: protectedProcedure
    .input(z.object({ token: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.totpSecret) {
        throw new Error("2FA setup not initiated. Call setup first.");
      }
      if (user.totpEnabled) {
        throw new Error("2FA is already enabled.");
      }

      const isValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: input.token,
        window: 1,
      });

      if (!isValid) {
        throw new Error("Invalid token. Please check your authenticator app.");
      }

      // Generate backup codes
      const plainCodes = generateBackupCodes();
      const hashedCodes = plainCodes.map(hashCode);

      // Enable 2FA and store hashed backup codes
      await db
        .update(users)
        .set({
          totpEnabled: true,
          totpVerifiedAt: new Date(),
          backupCodes: JSON.stringify(hashedCodes),
        })
        .where(eq(users.id, userId));

      return {
        success: true,
        backupCodes: plainCodes, // Show once — user must save these
        message:
          "2FA enabled successfully. Save your backup codes in a secure location.",
      };
    }),

  /**
   * Validate a TOTP token (or backup code) during login.
   * Called after password authentication succeeds.
   */
  validate: protectedProcedure
    .input(
      z.object({
        token: z.string().min(6).max(8), // 6-digit TOTP or 8-char backup code
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.totpEnabled || !user.totpSecret) {
        throw new Error("2FA is not enabled for this account.");
      }

      // Try TOTP first
      const isValidTotp = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: input.token,
        window: 1,
      });

      if (isValidTotp) {
        return { success: true, method: "totp" };
      }

      // Try backup codes
      if (user.backupCodes) {
        const storedHashes: string[] = JSON.parse(user.backupCodes);
        const inputHash = hashCode(input.token.toUpperCase());
        const codeIndex = storedHashes.indexOf(inputHash);

        if (codeIndex !== -1) {
          // Remove used backup code
          storedHashes.splice(codeIndex, 1);
          await db
            .update(users)
            .set({ backupCodes: JSON.stringify(storedHashes) })
            .where(eq(users.id, userId));

          return {
            success: true,
            method: "backup_code",
            remainingCodes: storedHashes.length,
          };
        }
      }

      throw new Error("Invalid token. Please try again.");
    }),

  /**
   * Disable 2FA — requires a valid current TOTP token as confirmation.
   */
  disable: protectedProcedure
    .input(z.object({ token: z.string().length(6) }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, userId))
        .limit(1);

      if (!user?.totpEnabled || !user.totpSecret) {
        throw new Error("2FA is not enabled for this account.");
      }

      const isValid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: "base32",
        token: input.token,
        window: 1,
      });

      if (!isValid) {
        throw new Error("Invalid token. 2FA has not been disabled.");
      }

      await db
        .update(users)
        .set({
          totpSecret: null,
          totpEnabled: false,
          totpVerifiedAt: null,
          backupCodes: null,
        })
        .where(eq(users.id, userId));

      return { success: true, message: "2FA has been disabled." };
    }),

  /**
   * Get 2FA status for the current user.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const [user] = await db
      .select({
        totpEnabled: users.totpEnabled,
        totpVerifiedAt: users.totpVerifiedAt,
        backupCodesCount: users.backupCodes,
      })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    const backupCodesCount = user?.backupCodesCount
      ? (JSON.parse(user.backupCodesCount) as string[]).length
      : 0;

    return {
      enabled: user?.totpEnabled ?? false,
      verifiedAt: user?.totpVerifiedAt ?? null,
      backupCodesRemaining: backupCodesCount,
    };
  }),
});

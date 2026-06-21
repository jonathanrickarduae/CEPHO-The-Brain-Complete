import type { Meta, StoryObj } from "@storybook/react";

// Lightweight mock for the 2FA settings component
// (avoids tRPC dependency in Storybook)
const TwoFactorSettingsMock = ({
  enabled = false,
  backupCodesRemaining = 8,
}: {
  enabled?: boolean;
  backupCodesRemaining?: number;
}) => (
  <div className="card bg-base-100 border border-base-300 shadow-sm max-w-lg">
    <div className="card-body gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-base-content">
            Two-Factor Authentication
          </h3>
          <p className="text-sm text-base-content/60">
            {enabled
              ? `Enabled · ${backupCodesRemaining} backup codes remaining`
              : "Add an extra layer of security to your account"}
          </p>
        </div>
        <span
          className={`badge badge-lg ${enabled ? "badge-success" : "badge-ghost"}`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      </div>
      <div className="flex gap-2">
        {!enabled ? (
          <button className="btn btn-primary btn-sm">Enable 2FA</button>
        ) : (
          <button className="btn btn-error btn-sm btn-outline">
            Disable 2FA
          </button>
        )}
      </div>
    </div>
  </div>
);

const meta: Meta<typeof TwoFactorSettingsMock> = {
  title: "Settings/TwoFactorSettings",
  component: TwoFactorSettingsMock,
  tags: ["autodocs"],
  argTypes: {
    enabled: { control: "boolean" },
    backupCodesRemaining: { control: { type: "range", min: 0, max: 8 } },
  },
};

export default meta;
type Story = StoryObj<typeof TwoFactorSettingsMock>;

export const Disabled: Story = {
  args: { enabled: false },
};

export const Enabled: Story = {
  args: { enabled: true, backupCodesRemaining: 8 },
};

export const LowBackupCodes: Story = {
  args: { enabled: true, backupCodesRemaining: 2 },
};

export const NoBackupCodes: Story = {
  args: { enabled: true, backupCodesRemaining: 0 },
};

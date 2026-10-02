import { useId, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import ConfirmDialog from "@/components/common/confirm-dialog";
import GlassCard from "@/components/common/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { toastError, toastInfo, toastSuccess } from "@/hooks/use-toast";

const PROFILE_EMAIL = "ambrish.s@example.com";
const PROFILE_ROLE = "Premium User";
const MIN_PASSWORD_LENGTH = 6;

const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

function Field({ label, children }: { label: string; children: (id: string) => ReactNode }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium mb-2">
        {label}
      </label>
      {children(id)}
    </div>
  );
}

export function ProfileSummary() {
  const { profileName } = useAuth();
  return (
    <GlassCard className="p-6">
      <div className="flex items-center gap-6">
        <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center" aria-hidden>
          <span className="text-2xl font-bold text-muted-foreground">{initials(profileName)}</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold">{profileName}</h2>
          <p className="text-muted-foreground">{PROFILE_EMAIL}</p>
          <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">{PROFILE_ROLE}</span>
        </div>
      </div>
    </GlassCard>
  );
}

export function EditProfileForm() {
  const { profileName, setProfileName } = useAuth();
  const [draftName, setDraftName] = useState<string | null>(null);
  const isEditing = draftName !== null;

  const save = (e: FormEvent) => {
    e.preventDefault();
    if (!draftName?.trim()) {
      toastError("Invalid name", "Name cannot be empty.");
      return;
    }
    setProfileName(draftName.trim());
    setDraftName(null);
    toastSuccess("Saved", "Profile updated successfully.");
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
      <form onSubmit={save} className="space-y-4">
        <Field label="Name">
          {(id) => (
            <Input id={id} value={draftName ?? profileName} onChange={(e) => setDraftName(e.target.value)} disabled={!isEditing} />
          )}
        </Field>
        <Field label="Email">{(id) => <Input id={id} type="email" value={PROFILE_EMAIL} disabled readOnly />}</Field>
        <div className="flex gap-3">
          {isEditing ? (
            <>
              <Button type="submit">Save Changes</Button>
              <Button type="button" variant="secondary" onClick={() => setDraftName(null)}>
                Cancel
              </Button>
            </>
          ) : (
            <Button type="button" onClick={() => setDraftName(profileName)}>
              Edit Profile
            </Button>
          )}
        </div>
      </form>
    </GlassCard>
  );
}

const EMPTY_PASSWORDS = { oldPassword: "", newPassword: "", confirmPassword: "" };

export function ChangePasswordForm() {
  const [passwords, setPasswords] = useState(EMPTY_PASSWORDS);
  const [error, setError] = useState("");

  const update = (key: keyof typeof EMPTY_PASSWORDS) => (e: ChangeEvent<HTMLInputElement>) =>
    setPasswords((prev) => ({ ...prev, [key]: e.target.value }));

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (passwords.newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters`);
      return;
    }
    setError("");
    setPasswords(EMPTY_PASSWORDS);
    toastSuccess("Password changed", "Your password was updated.");
  };

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4">Change Password</h3>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Old Password">
          {(id) => <Input id={id} type="password" autoComplete="current-password" value={passwords.oldPassword} onChange={update("oldPassword")} />}
        </Field>
        <Field label="New Password">
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={passwords.newPassword} onChange={update("newPassword")} />}
        </Field>
        <Field label="Confirm Password">
          {(id) => <Input id={id} type="password" autoComplete="new-password" value={passwords.confirmPassword} onChange={update("confirmPassword")} />}
        </Field>
        {error && (
          <p role="alert" className="text-red-500 text-sm">
            {error}
          </p>
        )}
        <Button type="submit">Change Password</Button>
      </form>
    </GlassCard>
  );
}

export function ActivitySummary({ totalSessions, streakDays }: { totalSessions: number; streakDays: number }) {
  const cards = [
    { title: "Total Sessions", value: totalSessions, caption: "All time sessions completed" },
    { title: "Practice Streak", value: `${streakDays} day${streakDays === 1 ? "" : "s"}`, caption: "Current streak" },
  ];

  return (
    <section>
      <h3 className="text-xl font-semibold mb-4">Activity Summary</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(({ title, value, caption }) => (
          <GlassCard key={title} className="p-6">
            <h4 className="text-lg font-medium mb-2">{title}</h4>
            <p className="text-3xl font-bold text-primary">{value}</p>
            <p className="text-sm text-muted-foreground mt-2">{caption}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export function DangerZone() {
  const [confirming, setConfirming] = useState(false);

  return (
    <GlassCard className="p-6">
      <h3 className="text-xl font-semibold mb-4 text-red-500">Danger Zone</h3>
      <p className="text-muted-foreground mb-4">Once you delete your account, there is no going back. Please be certain.</p>
      <Button variant="destructive" onClick={() => setConfirming(true)}>
        Delete Account
      </Button>
      <ConfirmDialog
        open={confirming}
        title="Delete account?"
        message="Are you sure you want to delete your account? This action cannot be undone."
        confirmLabel="Delete"
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          setConfirming(false);
          toastInfo("Coming soon", "Account deletion isn't available yet.");
        }}
      />
    </GlassCard>
  );
}

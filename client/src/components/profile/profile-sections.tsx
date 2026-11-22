import { useState, type FormEvent } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { toastError, toastSuccess } from "@/hooks/use-toast";
export function ProfileSummary() {
  const { user, profileName } = useAuth();
  return (
    <Card className="p-6 flex items-center gap-5">
      <span className="h-16 w-16 rounded-full bg-blue-50 text-primary text-2xl font-medium flex items-center justify-center">
        {profileName.slice(0, 1).toUpperCase()}
      </span>
      <div>
        <h2 className="text-xl font-semibold">{profileName}</h2>
        <p className="text-sm text-muted-foreground mt-1">@{user?.username}</p>
      </div>
    </Card>
  );
}
export function EditProfileForm() {
  const { user, profileName, setProfileName } = useAuth();
  const [draft, setDraft] = useState(profileName);
  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!draft.trim()) return;
    try {
      setProfileName(draft.trim());
      toastSuccess(
        "Name saved",
        "Your display name was saved in this browser.",
      );
    } catch (e) {
      toastError(
        "Couldn’t save",
        e instanceof Error ? e.message : "Please try again.",
      );
    }
  };
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Your details</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-6">
        Display names are saved locally. Your sign-in username stays the same.
      </p>
      <form onSubmit={submit} className="space-y-4 max-w-lg">
        <div className="space-y-2">
          <label htmlFor="display-name" className="text-sm font-medium">
            Display name
          </label>
          <Input
            id="display-name"
            required
            maxLength={80}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="profile-username" className="text-sm font-medium">
            Username
          </label>
          <Input id="profile-username" value={user?.username ?? ""} readOnly />
        </div>
        <Button type="submit" disabled={!draft.trim() || draft === profileName}>
          Save changes
        </Button>
      </form>
    </Card>
  );
}
export function ChangePasswordForm() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Password & security</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        Password changes and recovery are not available yet.
      </p>
      <Button variant="outline" disabled>
        Change password
      </Button>
    </Card>
  );
}
export function ActivitySummary({
  totalSessions,
  streakDays,
}: {
  totalSessions: number;
  streakDays: number;
}) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      {[
        ["Completed sessions", totalSessions],
        ["Current practice streak", `${streakDays} days`],
      ].map(([label, value]) => (
        <Card className="p-6" key={label}>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold mt-2">{value}</p>
        </Card>
      ))}
    </div>
  );
}
export function DangerZone() {
  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold">Account deletion</h2>
      <p className="text-sm text-muted-foreground mt-2 mb-4">
        Account deletion is not available yet. Clearing browser data removes
        locally saved practice history, but does not delete your account.
      </p>
      <Button variant="outline" disabled>
        Delete account
      </Button>
    </Card>
  );
}

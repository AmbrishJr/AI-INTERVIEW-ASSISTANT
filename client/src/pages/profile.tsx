import { useMemo } from "react";
import { computeTotals, loadDashboardSessions } from "@/components/dashboard/dashboard-data";
import {
  ActivitySummary,
  ChangePasswordForm,
  DangerZone,
  EditProfileForm,
  ProfileSummary,
} from "@/components/profile/profile-sections";

export default function Profile() {
  const totals = useMemo(() => computeTotals(loadDashboardSessions()), []);

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-8">
      <h1 className="text-3xl font-bold">Profile</h1>
      <ProfileSummary />
      <EditProfileForm />
      <ChangePasswordForm />
      <ActivitySummary totalSessions={totals.completedSessions} streakDays={totals.streakDays} />
      <DangerZone />
    </div>
  );
}

import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuthState } from "@/contexts/AuthStateContext";

interface ProfileProps {
  profileName: string;
  setProfileName: (name: string) => void;
}

const Profile = ({ profileName, setProfileName }: ProfileProps) => {
  const [, setLocation] = useLocation();
  const { isLoggedIn } = useAuthState();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoggedIn) {
      setLocation('/login');
    }
  }, [isLoggedIn, setLocation]);
  
  // Don't render if not logged in
  if (!isLoggedIn) {
    return null;
  }
  
  const [userInfo, setUserInfo] = useState({
    name: profileName,
    email: "alex.johnson@example.com",
    role: "Premium User"
  });

  const [editMode, setEditMode] = useState(false);
  const [tempUserInfo, setTempUserInfo] = useState(userInfo);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const [passwordError, setPasswordError] = useState("");

  // Update userInfo when profileName prop changes
  useEffect(() => {
    setUserInfo(prev => ({ ...prev, name: profileName }));
    setTempUserInfo(prev => ({ ...prev, name: profileName }));
  }, [profileName]);

  const handleEditProfile = () => {
    setEditMode(true);
    setTempUserInfo(userInfo);
    setShowSuccess(false);
  };

  const handleSaveProfile = () => {
    if (!tempUserInfo.name.trim()) {
      alert("Name cannot be empty!");
      return;
    }
    
    setIsSaving(true);
    
    // Simulate save operation
    setTimeout(() => {
      setUserInfo(tempUserInfo);
      setProfileName(tempUserInfo.name);
      setEditMode(false);
      setIsSaving(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    }, 500);
  };

  const handleCancelEdit = () => {
    setTempUserInfo(userInfo);
    setEditMode(false);
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    alert("Password changed successfully!");
    setPasswordData({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setPasswordError("");
  };

  const handleDeleteAccount = () => {
    if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      alert("Account deleted successfully!");
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Profile Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-muted-foreground">
                {userInfo.name.split(' ').map((n: string) => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="text-2xl font-semibold">{userInfo.name}</h2>
              <p className="text-muted-foreground">{userInfo.email}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">
                {userInfo.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Message */}
      <div className="relative mb-6 h-12">
        {showSuccess && (
          <div 
            className="absolute inset-0 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-center font-medium transition-all duration-400 ease-out"
            style={{
              opacity: showSuccess ? 1 : 0,
              transform: showSuccess ? 'translateY(0)' : 'translateY(-10px)',
            }}
          >
            Profile updated successfully
          </div>
        )}
      </div>

      {/* Edit Profile Form */}
      <div className="mb-8">
        <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                value={tempUserInfo.name}
                onChange={(e) => setTempUserInfo({ ...tempUserInfo, name: e.target.value })}
                disabled={!editMode}
                className="w-full p-2 border border-border rounded-md bg-background disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={tempUserInfo.email}
                onChange={(e) => setTempUserInfo({ ...tempUserInfo, email: e.target.value })}
                disabled={!editMode}
                className="w-full p-2 border border-border rounded-md bg-background disabled:opacity-50"
              />
            </div>
            <div className="flex gap-3">
              {!editMode ? (
                <button
                  onClick={handleEditProfile}
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
                >
                  Edit Profile
                </button>
              ) : (
                <>
                  <button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-200"
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </button>
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-muted/80"
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Section */}
      <div className="mb-8">
        <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Change Password</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Old Password</label>
              <input
                type="password"
                value={passwordData.oldPassword}
                onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Confirm Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                className="w-full p-2 border border-border rounded-md bg-background"
              />
            </div>
            {passwordError && (
              <div className="text-red-500 text-sm">{passwordError}</div>
            )}
            <button
              onClick={handlePasswordChange}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Activity Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
            <h4 className="text-lg font-medium mb-2">Total Sessions</h4>
            <p className="text-3xl font-bold text-primary">127</p>
            <p className="text-sm text-muted-foreground mt-2">All time sessions completed</p>
          </div>
          <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
            <h4 className="text-lg font-medium mb-2">Productivity Streak</h4>
            <p className="text-3xl font-bold text-primary">15 days</p>
            <p className="text-sm text-muted-foreground mt-2">Current streak</p>
          </div>
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="bg-card/40 backdrop-blur-md border-white/5 rounded-lg p-6">
        <h3 className="text-xl font-semibold mb-4 text-red-500">Danger Zone</h3>
        <p className="text-muted-foreground mb-4">
          Once you delete your account, there is no going back. Please be certain.
        </p>
        <button
          onClick={handleDeleteAccount}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Profile;

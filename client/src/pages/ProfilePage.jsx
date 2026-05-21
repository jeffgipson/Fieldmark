import { useCallback, useEffect, useState } from "react";
import { Copy, LogOut, Mail, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import * as profileApi from "../api/profile";
import UserAvatarUpload from "../components/profile/UserAvatarUpload";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input, { Label } from "../components/ui/Input";
import LoadingDale from "../components/ui/LoadingDale";
import { INVITATION_STATUS_LABELS, SOCIAL_PLATFORMS } from "../constants/profile";
import PlanBillingSection from "../components/profile/PlanBillingSection";
import FarmPrioritiesEditor from "../components/priorities/FarmPrioritiesEditor";
import { useAuth } from "../contexts/AuthContext";
import { useFarm } from "../contexts/FarmContext";
import { friendlyError } from "../utils/errors";

function formatDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

function ProfileSection({ title, description, children }) {
  return (
    <Card className="mb-6">
      <div className="mb-5 border-b border-fm-gray-light/80 pb-4">
        <h2 className="font-display text-lg font-bold text-fm-ink">{title}</h2>
        {description && <p className="mt-1 text-sm text-fm-gray-medium">{description}</p>}
      </div>
      {children}
    </Card>
  );
}

export default function ProfilePage() {
  const navigate = useNavigate();
  const { user, setUserFromProfile, logout } = useAuth();
  const { farm, priorities, setPriorities, refresh: refreshFarm, setSubscription } = useFarm();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [personal, setPersonal] = useState({ first_name: "", last_name: "", bio: "", phone: "" });
  const [social, setSocial] = useState({});
  const [credentials, setCredentials] = useState({
    current_password: "",
    email: "",
    password: "",
    password_confirmation: ""
  });
  const [invitations, setInvitations] = useState([]);
  const [inviteForm, setInviteForm] = useState({ email: "", message: "" });
  const [saving, setSaving] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [data, invites] = await Promise.all([
        profileApi.getProfile(),
        profileApi.listInvitations()
      ]);
      setProfile(data);
      setPersonal({
        first_name: data.first_name || "",
        last_name: data.last_name || "",
        bio: data.bio || "",
        phone: data.phone || ""
      });
      setSocial(data.social_links || {});
      setCredentials((c) => ({ ...c, email: data.email || "" }));
      setInvitations(Array.isArray(invites) ? invites : []);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  function handleProfileUpdated(updated) {
    setProfile(updated);
    setUserFromProfile?.(updated);
  }

  async function savePersonal(e) {
    e.preventDefault();
    setSaving("personal");
    try {
      const updated = await profileApi.updateProfile({
        first_name: personal.first_name,
        last_name: personal.last_name,
        bio: personal.bio,
        phone: personal.phone,
        social_links: social
      });
      handleProfileUpdated(updated);
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  async function saveCredentials(e) {
    e.preventDefault();
    const changingPassword = Boolean(credentials.password);
    const changingEmail = credentials.email !== profile?.email;
    if (!changingPassword && !changingEmail) return;

    setSaving("credentials");
    try {
      const updated = await profileApi.updateCredentials({
        current_password: credentials.current_password,
        ...(changingEmail ? { email: credentials.email } : {}),
        ...(changingPassword
          ? {
              password: credentials.password,
              password_confirmation: credentials.password_confirmation
            }
          : {})
      });
      handleProfileUpdated(updated);
      setCredentials({
        current_password: "",
        email: updated.email,
        password: "",
        password_confirmation: ""
      });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  async function sendInvite(e) {
    e.preventDefault();
    setSaving("invite");
    try {
      const created = await profileApi.createInvitation(inviteForm);
      setInvitations((prev) => [created, ...prev]);
      setInviteForm({ email: "", message: "" });
    } catch (err) {
      setError(friendlyError(err));
    } finally {
      setSaving(null);
    }
  }

  async function revokeInvite(id) {
    try {
      const updated = await profileApi.revokeInvitation(id);
      setInvitations((prev) => prev.map((i) => (i.id === id ? updated : i)));
    } catch (err) {
      setError(friendlyError(err));
    }
  }

  async function copyInviteLink(url, id) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setError("Could not copy link to clipboard.");
    }
  }

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  if (loading) return <LoadingDale message="Loading your profile..." />;

  return (
    <div>
      {error && (
        <p className="mb-6 rounded-lg bg-[#FFF5F5] px-4 py-3 text-sm text-fm-alert">{error}</p>
      )}

      <ProfileSection
        title="Plan & billing"
        description="Your Fieldmark subscription controls how many farms and fields you can manage."
      >
        <PlanBillingSection
          subscription={profile?.subscription || null}
          onUpdated={async (billing) => {
            setProfile((p) => (p ? { ...p, subscription: billing } : p));
            setSubscription(billing);
            await refreshFarm();
          }}
        />
      </ProfileSection>

      {farm?.id && (
        <ProfileSection
          title="Season priorities"
          description="What you are working through on the farm this year. Dale and Resources use these to focus recommendations."
        >
          <FarmPrioritiesEditor
            farmId={farm.id}
            priorities={priorities}
            onChange={setPriorities}
          />
        </ProfileSection>
      )}

      <ProfileSection title="Photo" description="Shown on your account and in the sidebar.">
        <UserAvatarUpload profile={profile} onUpdated={handleProfileUpdated} />
      </ProfileSection>

      <ProfileSection
        title="About you"
        description="Your name and a short bio help advisors and lenders know who they are working with."
      >
        <form onSubmit={savePersonal} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label>First name</Label>
            <Input
              value={personal.first_name}
              onChange={(e) => setPersonal({ ...personal, first_name: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>Last name</Label>
            <Input
              value={personal.last_name}
              onChange={(e) => setPersonal({ ...personal, last_name: e.target.value })}
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Phone</Label>
            <Input
              type="tel"
              value={personal.phone}
              onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
              placeholder="573-555-0100"
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Bio</Label>
            <textarea
              className="w-full rounded-lg border-[1.5px] border-fm-input-border bg-white px-4 py-3 text-base text-fm-charcoal focus:border-fm-teal focus:outline-none focus:ring-[3px] focus:ring-fm-teal/15"
              rows={4}
              maxLength={500}
              value={personal.bio}
              onChange={(e) => setPersonal({ ...personal, bio: e.target.value })}
              placeholder="Corn and soybean operation in southeast Missouri..."
            />
            <p className="mt-1 text-xs text-fm-gray-medium">{personal.bio.length}/500</p>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" disabled={saving === "personal"}>
              {saving === "personal" ? "Saving..." : "Save profile"}
            </Button>
          </div>
        </form>
      </ProfileSection>

      <ProfileSection
        title="Social profiles"
        description="Optional links you can share with lenders or peers. We never post on your behalf."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          {SOCIAL_PLATFORMS.map(({ key, label, placeholder }) => (
            <div key={key} className={key === "website" ? "sm:col-span-2" : ""}>
              <Label>{label}</Label>
              <Input
                type="url"
                value={social[key] || ""}
                onChange={(e) => setSocial({ ...social, [key]: e.target.value })}
                placeholder={placeholder}
              />
            </div>
          ))}
        </div>
        <Button type="button" className="mt-4" onClick={savePersonal} disabled={saving === "personal"}>
          Save social links
        </Button>
      </ProfileSection>

      <ProfileSection
        title="Login & security"
        description="Update your email or password. You will need your current password to confirm changes."
      >
        <form onSubmit={saveCredentials} className="grid max-w-lg gap-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={credentials.email}
              onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>New password</Label>
            <Input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              placeholder="Leave blank to keep current password"
              autoComplete="new-password"
            />
          </div>
          {credentials.password && (
            <div>
              <Label>Confirm new password</Label>
              <Input
                type="password"
                value={credentials.password_confirmation}
                onChange={(e) =>
                  setCredentials({ ...credentials, password_confirmation: e.target.value })
                }
                autoComplete="new-password"
              />
            </div>
          )}
          <div>
            <Label>Current password</Label>
            <Input
              type="password"
              value={credentials.current_password}
              onChange={(e) => setCredentials({ ...credentials, current_password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <Button type="submit" disabled={saving === "credentials"}>
            {saving === "credentials" ? "Updating..." : "Update login"}
          </Button>
        </form>
      </ProfileSection>

      <ProfileSection
        title="Invite others"
        description="We will email them an invite link. They must sign up with the same email address. You can still copy the link as a backup."
      >
        <form onSubmit={sendInvite} className="mb-6 grid gap-4 sm:grid-cols-2">
          <div>
            <Label>Email address</Label>
            <Input
              type="email"
              value={inviteForm.email}
              onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
              placeholder="neighbor@example.com"
              required
            />
          </div>
          <div className="sm:col-span-2">
            <Label>Personal message (optional)</Label>
            <Input
              value={inviteForm.message}
              onChange={(e) => setInviteForm({ ...inviteForm, message: e.target.value })}
              placeholder="Thought you might want to plan margins with me."
            />
          </div>
          <div>
            <Button type="submit" disabled={saving === "invite"}>
              <UserPlus size={16} className="mr-2 inline" />
              {saving === "invite" ? "Sending..." : "Send invite email"}
            </Button>
          </div>
        </form>

        {invitations.length === 0 ? (
          <p className="text-sm text-fm-gray-medium">No invitations sent yet.</p>
        ) : (
          <ul className="divide-y divide-fm-gray-light/80">
            {invitations.map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center justify-between gap-3 py-4">
                <div>
                  <p className="font-medium text-fm-charcoal">{inv.email}</p>
                  <p className="text-xs text-fm-gray-medium">
                    {INVITATION_STATUS_LABELS[inv.status] || inv.status}
                    {inv.expires_at && inv.status === "pending"
                      ? ` · expires ${formatDate(inv.expires_at)}`
                      : ""}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {inv.status === "pending" && inv.invite_url && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => copyInviteLink(inv.invite_url, inv.id)}
                    >
                      <Copy size={14} className="mr-1" />
                      {copiedId === inv.id ? "Copied" : "Copy link"}
                    </Button>
                  )}
                  {inv.status === "pending" && (
                    <Button type="button" variant="ghost" onClick={() => revokeInvite(inv.id)}>
                      Revoke
                    </Button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </ProfileSection>

      <ProfileSection title="Account">
        <dl className="grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-fm-gray-medium">Member since</dt>
            <dd className="font-medium text-fm-charcoal">{formatDate(profile?.created_at)}</dd>
          </div>
          <div>
            <dt className="text-fm-gray-medium">Role</dt>
            <dd className="font-medium capitalize text-fm-charcoal">{profile?.role || "farmer"}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-fm-gray-medium">Signed in as</dt>
            <dd className="flex items-center gap-2 font-medium text-fm-charcoal">
              <Mail size={14} className="text-fm-teal" />
              {user?.email || profile?.email}
            </dd>
          </div>
        </dl>
        <div className="mt-6 border-t border-fm-gray-light/80 pt-6">
          <Button type="button" variant="ghost" onClick={handleLogout}>
            <LogOut size={16} className="mr-2 inline" />
            Sign out
          </Button>
        </div>
      </ProfileSection>
    </div>
  );
}

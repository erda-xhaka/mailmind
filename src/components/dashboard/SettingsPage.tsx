import { useState, useEffect } from "react";
import { User, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const SettingsPage = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasGoogle, setHasGoogle] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      setEmail(user.email || "");
      setHasGoogle(
        user.app_metadata?.providers?.includes("google") ||
        user.identities?.some((i) => i.provider === "google") || false
      );

      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .maybeSingle();

      if (data) {
        setFullName(data.full_name || "");
        setAvatarUrl(data.avatar_url || "");
      }
      setLoading(false);
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, avatar_url: avatarUrl })
      .eq("id", user.id);

    if (error) {
      toast.error("Dështoi ruajtja e profilit");
    } else {
      toast.success("Profili u ruajt me sukses");
    }
    setSaving(false);
  };

  const handleGoogleConnect = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard/settings`,
        scopes: "https://www.googleapis.com/auth/gmail.readonly",
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) toast.error(error.message);
  };

  const handleDisconnectGmail = async () => {
    const { error } = await supabase.functions.invoke("disconnect-gmail");
    if (error) {
      toast.error("Dështoi shkëputja e Gmail-it");
    } else {
      setHasGoogle(false);
      toast.success("Gmail u shkëput me sukses");
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="max-w-2xl">
        <div className="mb-6">
          <h1 className="font-heading text-2xl font-bold">Cilësimet</h1>
          <p className="text-muted-foreground text-sm mt-1">Duke ngarkuar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Cilësimet</h1>
        <p className="text-muted-foreground text-sm mt-1">Menaxhoni llogarinë dhe preferencat tuaja</p>
      </div>

      <div className="space-y-6">
        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold flex items-center gap-2 mb-4">
            <User className="h-4 w-4 text-primary" /> Profili
          </h3>
          <div className="grid gap-4">
            <div>
              <label className="text-sm text-muted-foreground">Emri i Plotë</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 bg-muted/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <Input
                value={email}
                disabled
                className="mt-1 bg-muted/50 border-border/50 opacity-60"
              />
            </div>
          </div>
        </div>

        <div className="glass-card p-6">
          <h3 className="font-heading font-semibold flex items-center gap-2 mb-4">
            <Mail className="h-4 w-4 text-primary" /> Integrimi i Email-it
          </h3>
          <p className="text-sm text-muted-foreground mb-3">Lidhni Gmail-in tuaj për përpunim me AI</p>
          {hasGoogle ? (
            <div className="flex items-center gap-3">
              <span className="category-badge bg-category-personal/20 text-category-personal">✓ Gmail i Lidhur</span>
              <Button variant="destructive" size="sm" onClick={handleDisconnectGmail}>
                Shkëput
              </Button>
            </div>
          ) : (
            <Button variant="outline" onClick={handleGoogleConnect}>Lidh Gmail-in</Button>
          )}
        </div>

        <div className="flex gap-3">
          <Button className="flex-1" onClick={handleSave} disabled={saving}>
            {saving ? "Duke ruajtur..." : "Ruaj Ndryshimet"}
          </Button>
          <Button variant="destructive" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" /> Dil
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;

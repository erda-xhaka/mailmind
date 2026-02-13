import { User, Bell, Shield, Palette, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SettingsPage = () => (
  <div className="max-w-2xl">
    <div className="mb-6">
      <h1 className="font-heading text-2xl font-bold">Settings</h1>
      <p className="text-muted-foreground text-sm mt-1">Manage your account and preferences</p>
    </div>

    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold flex items-center gap-2 mb-4"><User className="h-4 w-4 text-primary" /> Profile</h3>
        <div className="grid gap-4">
          <div>
            <label className="text-sm text-muted-foreground">Full Name</label>
            <Input defaultValue="John Doe" className="mt-1 bg-muted/50 border-border/50" />
          </div>
          <div>
            <label className="text-sm text-muted-foreground">Email</label>
            <Input defaultValue="john@example.com" className="mt-1 bg-muted/50 border-border/50" />
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold flex items-center gap-2 mb-4"><Mail className="h-4 w-4 text-primary" /> Email Integration</h3>
        <p className="text-sm text-muted-foreground mb-3">Connect your email accounts for AI processing</p>
        <Button variant="outline">Connect Gmail</Button>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-heading font-semibold flex items-center gap-2 mb-4"><Bell className="h-4 w-4 text-primary" /> Notifications</h3>
        <p className="text-sm text-muted-foreground">Notification preferences will be configurable here.</p>
      </div>

      <Button className="w-full">Save Changes</Button>
    </div>
  </div>
);

export default SettingsPage;

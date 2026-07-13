import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  Settings as SettingsIcon, Moon, Sun, Bell, Shield,
  LogOut, Trash2, Mail, Lock,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { PageHeader } from '@/components/shared/PageHeader';
import { FadeIn } from '@/components/shared/Animations';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ email: true, weekly: true, alerts: false });
  const [units, setUnits] = useState('metric');

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out');
    navigate('/');
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" description="Manage your preferences and account" icon={<SettingsIcon className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Appearance */}
        <FadeIn>
          <Card className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Moon className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Appearance</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Theme</Label>
                  <p className="text-xs text-muted-foreground">Choose light or dark mode</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={theme === 'light' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('light')}>
                    <Sun className="mr-1 h-4 w-4" /> Light
                  </Button>
                  <Button variant={theme === 'dark' ? 'default' : 'outline'} size="sm" onClick={() => setTheme('dark')}>
                    <Moon className="mr-1 h-4 w-4" /> Dark
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Measurement units</Label>
                  <p className="text-xs text-muted-foreground">Metric or imperial</p>
                </div>
                <div className="flex gap-2">
                  <Button variant={units === 'metric' ? 'default' : 'outline'} size="sm" onClick={() => setUnits('metric')}>Metric</Button>
                  <Button variant={units === 'imperial' ? 'default' : 'outline'} size="sm" onClick={() => setUnits('imperial')}>Imperial</Button>
                </div>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Notifications */}
        <FadeIn delay={0.1}>
          <Card className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Notifications</h3>
            </div>
            <div className="space-y-4">
              {[
                { key: 'email', label: 'Email notifications', desc: 'Receive updates about your analyses' },
                { key: 'weekly', label: 'Weekly summary', desc: 'Get a weekly impact digest' },
                { key: 'alerts', label: 'Threshold alerts', desc: 'Notify when emissions exceed targets' },
              ].map((n) => (
                <div key={n.key} className="flex items-center justify-between">
                  <div>
                    <Label>{n.label}</Label>
                    <p className="text-xs text-muted-foreground">{n.desc}</p>
                  </div>
                  <Switch
                    checked={notifications[n.key as keyof typeof notifications]}
                    onCheckedChange={(v) => setNotifications((prev) => ({ ...prev, [n.key]: v }))}
                  />
                </div>
              ))}
            </div>
          </Card>
        </FadeIn>

        {/* Account */}
        <FadeIn delay={0.2}>
          <Card className="glass-card p-6">
            <div className="mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Account</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{user?.email}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/40 p-3">
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Password: ********</span>
              </div>
              <Button variant="outline" className="w-full" onClick={() => navigate('/forgot-password')}>
                Change password
              </Button>
            </div>
          </Card>
        </FadeIn>

        {/* Danger zone */}
        <FadeIn delay={0.3}>
          <Card className="glass-card border-destructive/20 p-6">
            <div className="mb-4 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              <h3 className="font-semibold">Danger Zone</h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                <div>
                  <Label>Sign out</Label>
                  <p className="text-xs text-muted-foreground">End your current session</p>
                </div>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="mr-1 h-4 w-4" /> Sign out
                </Button>
              </div>
              <AlertDialog>
                <div className="flex items-center justify-between rounded-lg bg-destructive/5 p-3">
                  <div>
                    <Label>Delete account</Label>
                    <p className="text-xs text-muted-foreground">Permanently remove all data</p>
                  </div>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm">
                      <Trash2 className="mr-1 h-4 w-4" /> Delete
                    </Button>
                  </AlertDialogTrigger>
                </div>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete your account?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete your account and all associated analyses. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Delete forever
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

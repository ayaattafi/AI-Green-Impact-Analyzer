import { useState } from 'react';
import { toast } from 'sonner';
import { User, Mail, MapPin, Building2, Calendar, Save, Leaf, Award, Activity } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { PageHeader } from '@/components/shared/PageHeader';
import { FadeIn } from '@/components/shared/Animations';
import { useAuth } from '@/contexts/AuthContext';
import { useAnalyses } from '@/hooks/useAnalyses';
import { formatDate, formatNumber } from '@/lib/format';
import { supabase } from '@/lib/supabase';

export function ProfilePage() {
  const { user } = useAuth();
  const { analyses } = useAnalyses();
  const [fullName, setFullName] = useState((user?.user_metadata?.full_name as string) ?? '');
  const [organization, setOrganization] = useState((user?.user_metadata?.organization as string) ?? '');
  const [location, setLocation] = useState((user?.user_metadata?.location as string) ?? '');
  const [saving, setSaving] = useState(false);

  const totalCo2 = analyses.reduce((s, a) => s + (a.co2e ?? 0), 0);
  const avgScore = analyses.length ? Math.round(analyses.reduce((s, a) => s + a.green_score, 0) / analyses.length) : 0;

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName, organization, location },
    });
    setSaving(false);
    if (error) toast.error('Failed to update profile');
    else toast.success('Profile updated');
  };

  const initials = (user?.email ?? 'U').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-6">
      <PageHeader title="Profile" description="Manage your account information" icon={<User className="h-5 w-5" />} />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Profile card */}
        <FadeIn>
          <Card className="glass-card p-6 text-center">
            <Avatar className="mx-auto h-24 w-24">
              <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                {initials}
              </AvatarFallback>
            </Avatar>
            <h3 className="mt-4 text-lg font-semibold">{fullName || user?.email?.split('@')[0]}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <Badge variant="secondary" className="mt-3 bg-primary/10 text-primary">Free Plan</Badge>
            <Separator className="my-4" />
            <div className="space-y-2 text-left text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4" /> {user?.email}
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" /> Joined {formatDate(user?.created_at ?? new Date())}
              </div>
              {location && <div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" /> {location}</div>}
            </div>
          </Card>
        </FadeIn>

        {/* Stats */}
        <FadeIn delay={0.1}>
          <Card className="glass-card p-6">
            <h3 className="mb-4 font-semibold">Your Impact</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-xl bg-primary/5 p-4">
                <Leaf className="mb-2 h-6 w-6 text-primary" />
                <p className="text-2xl font-bold">{avgScore}</p>
                <p className="text-xs text-muted-foreground">Avg Green Score</p>
              </div>
              <div className="rounded-xl bg-accent/5 p-4">
                <Activity className="mb-2 h-6 w-6 text-accent" />
                <p className="text-2xl font-bold">{analyses.length}</p>
                <p className="text-xs text-muted-foreground">Analyses Run</p>
              </div>
              <div className="rounded-xl bg-emerald-500/5 p-4">
                <Award className="mb-2 h-6 w-6 text-emerald-500" />
                <p className="text-2xl font-bold">{formatNumber(totalCo2)}</p>
                <p className="text-xs text-muted-foreground">kg CO₂ Tracked</p>
              </div>
              <div className="rounded-xl bg-lime-500/5 p-4">
                <Leaf className="mb-2 h-6 w-6 text-lime-500" />
                <p className="text-2xl font-bold">{Math.ceil(totalCo2 / 21)}</p>
                <p className="text-xs text-muted-foreground">Trees Equivalent</p>
              </div>
            </div>
          </Card>
        </FadeIn>

        {/* Edit form */}
        <FadeIn delay={0.2}>
          <Card className="glass-card p-6">
            <h3 className="mb-4 font-semibold">Edit Profile</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Your name" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Organization</Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={organization} onChange={(e) => setOrganization(e.target.value)} placeholder="Company name" className="pl-9" />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City, Country" className="pl-9" />
                </div>
              </div>
              <Button className="w-full" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save changes'}
              </Button>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}

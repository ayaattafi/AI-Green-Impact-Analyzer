import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Lock, ArrowRight } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({
  password: z.string().min(6, 'At least 6 characters'),
  confirmPassword: z.string().min(6, 'At least 6 characters'),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type FormValues = z.infer<typeof schema>;

export function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const { error } = await updatePassword(values.password);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      toast.success('Password updated successfully');
      navigate('/app/dashboard');
    }
  };

  return (
    <AuthLayout
      title="Set a new password"
      subtitle="Choose a strong password for your account"
      footer={<>Back to <Link to="/login" className="font-medium text-primary hover:underline">sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">New password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="password" type="password" placeholder="••••••••" className="pl-9" {...register('password')} />
          </div>
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="confirmPassword" type="password" placeholder="••••••••" className="pl-9" {...register('confirmPassword')} />
          </div>
          {errors.confirmPassword && <p className="text-xs text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Updating...' : 'Update password'}
          {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
        </Button>
      </form>
    </AuthLayout>
  );
}

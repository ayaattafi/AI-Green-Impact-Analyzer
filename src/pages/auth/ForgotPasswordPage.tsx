import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';

const schema = z.object({ email: z.string().email('Enter a valid email') });
type FormValues = z.infer<typeof schema>;

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setLoading(true);
    const { error } = await resetPassword(values.email);
    setLoading(false);
    if (error) {
      toast.error(error);
    } else {
      setSent(true);
      toast.success('Reset link sent to your email');
    }
  };

  if (sent) {
    return (
      <AuthLayout title="Check your email" subtitle="We've sent you a password reset link">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <p className="text-sm text-muted-foreground">
            We sent a password reset link to your email. Click the link to set a new password.
            The link expires in 1 hour.
          </p>
          <Button variant="outline" className="mt-6" onClick={() => setSent(false)}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Try a different email
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link to="/login" className="font-medium text-primary hover:underline">Back to sign in</Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot password?"
      subtitle="Enter your email and we'll send you a reset link"
      footer={<>Remember your password? <Link to="/login" className="font-medium text-primary hover:underline">Sign in</Link></>}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input id="email" type="email" placeholder="you@example.com" className="pl-9" {...register('email')} />
          </div>
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Sending...' : 'Send reset link'}
        </Button>
      </form>
    </AuthLayout>
  );
}

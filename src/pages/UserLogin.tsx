import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { authApi } from '@/lib/api';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { getUser, setUser, userLogout } from '@/store/userStore';
import { Home } from 'lucide-react';

const UserLogin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);
  const [sendingOtp, setSendingOtp] = useState(false);

  useEffect(() => {
    if (otpTimer <= 0) return;
    const timer = setInterval(() => {
      setOtpTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [otpTimer]);

  if (getUser()) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        if (!mobile.trim()) throw new Error('Mobile number is required');
        if (!otp.trim()) throw new Error('OTP is required');
      }
      const res = isRegister
        ? await authApi.register(email.trim(), password, name.trim(), mobile.trim(), otp.trim())
        : await authApi.login(email.trim(), password);
      localStorage.setItem('token', res.token);
      setUser({ email: res.user.email, name: res.user.name, mobile: res.user.mobile });
      toast({ title: isRegister ? 'Account created!' : 'Signed in' });
      navigate('/', { replace: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sign in';
      toast({ title: message || 'Failed to sign in', variant: 'destructive' });
    }
  };

  const handleSendOtp = async () => {
    if (!email.trim()) {
      toast({ title: 'Enter email first', variant: 'destructive' });
      return;
    }
    try {
      setSendingOtp(true);
      const response = await authApi.sendOtp(email.trim());
      setOtpSent(true);
      const expiresInSeconds = Math.round((response?.expiresInMs ?? 60000) / 1000);
      setOtpTimer(expiresInSeconds);
      if (response?.previewCode) {
        setOtp(response.previewCode);
      }
      toast({
        title: 'OTP sent',
        description: response?.previewCode ? `Dev preview OTP: ${response.previewCode}` : 'Check your email for the verification code',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      toast({ title: message || 'Failed to send OTP', variant: 'destructive' });
    } finally {
      setSendingOtp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative">
      <div className="absolute top-20 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>User Sign in</CardTitle>
          <CardDescription>Sign in to personalize your experience</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {isRegister && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g., +91 98765 43210" required />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            {isRegister && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="otp">OTP</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSendOtp}
                    disabled={sendingOtp || !email.trim() || otpTimer > 0}
                  >
                    {sendingOtp ? 'Sending...' : otpTimer > 0 ? `Resend in ${otpTimer}s` : otpSent ? 'Resend OTP' : 'Send OTP'}
                  </Button>
                </div>
                <Input
                  id="otp"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="Enter 6-digit code"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">Verify your email with the OTP before completing signup.</p>
              </div>
            )}
            <Button className="w-full" type="submit">{isRegister ? 'Create Account' : 'Sign in'}</Button>
            <div className="text-center text-sm">
              <button type="button" onClick={() => setIsRegister(!isRegister)} className="text-primary hover:underline">
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;



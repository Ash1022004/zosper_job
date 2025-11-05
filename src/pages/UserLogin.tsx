import { useState } from 'react';
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

  if (getUser()) return <Navigate to="/" replace />;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Name is required');
        if (!mobile.trim()) throw new Error('Mobile number is required');
      }
      const res = isRegister
        ? await authApi.register(email.trim(), password, name.trim(), mobile.trim())
        : await authApi.login(email.trim(), password);
      localStorage.setItem('token', res.token);
      setUser({ email: res.user.email, name: res.user.name, mobile: res.user.mobile });
      toast({ title: isRegister ? 'Account created!' : 'Signed in' });
      navigate('/', { replace: true });
    } catch (error: any) {
      toast({ title: error.message || 'Failed to sign in', variant: 'destructive' });
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
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required={isRegister} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile</Label>
                  <Input id="mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} placeholder="e.g., +91 98765 43210" required={isRegister} />
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



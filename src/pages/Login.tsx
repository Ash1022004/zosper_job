import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiLogin, apiMe } from '@/lib/api';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [checking, setChecking] = useState(true);
  useEffect(() => {
    (async () => {
      try {
        const me = await apiMe();
        if (me?.user && me.user.role === 'admin') {
          navigate('/admin', { replace: true });
        }
      } catch (error) {
        // User is not authenticated, show login form
      } finally {
        setChecking(false);
      }
    })();
  }, [navigate]);
  
  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await apiLogin(email.trim(), password);
      if (response.user?.isAdmin) {
        toast({ title: 'Welcome' });
        navigate('/admin', { replace: true });
      } else {
        toast({ title: 'Access denied. Admin privileges required.', variant: 'destructive' });
      }
    } catch (e) {
      toast({ title: 'Invalid credentials', variant: 'destructive' });
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
          <CardTitle>Admin Login</CardTitle>
          <CardDescription>Sign in to manage job postings</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;



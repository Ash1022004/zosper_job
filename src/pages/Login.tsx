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
        // Only auto-redirect if we have a valid admin session
        if (me?.user && (me.user.role === 'admin' || me.user.isAdmin === true)) {
          console.log('[Login] Already logged in as admin, redirecting...');
          navigate('/admin', { replace: true });
        } else {
          // Clear any stale tokens if not authenticated
          localStorage.removeItem('admin_token');
        }
      } catch (error) {
        // User is not authenticated, clear any stale tokens
        localStorage.removeItem('admin_token');
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
    e.stopPropagation();
    
    if (!email.trim() || !password) {
      toast({ title: 'Please enter email and password', variant: 'destructive' });
      return;
    }
    
    try {
      console.log('[Login] Attempting login...');
      const response = await apiLogin(email.trim(), password);
      console.log('[Login] Response:', response);
      
      // Check both isAdmin and role for compatibility
      const isAdmin = response.user?.isAdmin === true || response.user?.role === 'admin';
      
      if (isAdmin) {
        console.log('[Login] Admin login successful');
        console.log('[Login] Response token:', response.token);
        // Store token in localStorage as backup
        if (response.token) {
          localStorage.setItem('admin_token', response.token);
        }
        toast({ title: 'Welcome, Admin!' });
        // Use window.location for full page reload to ensure cookie is sent
        // Wait a bit longer to ensure cookie is set
        setTimeout(() => {
          console.log('[Login] Navigating to /admin...');
          window.location.href = '/admin';
        }, 500);
      } else {
        console.log('[Login] Not an admin user');
        toast({ title: 'Access denied. Admin privileges required.', variant: 'destructive' });
      }
    } catch (e: any) {
      console.error('[Login] Login error:', e);
      const errorMessage = e?.message || 'Invalid credentials';
      toast({ 
        title: errorMessage.includes('CORS') || errorMessage.includes('fetch') 
          ? 'Connection error. Please check your network.' 
          : 'Invalid credentials', 
        variant: 'destructive' 
      });
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
          <form className="space-y-4" onSubmit={onSubmit} autoComplete="off">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="off"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="off"
              />
            </div>
            <Button className="w-full" type="submit">Sign in</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;



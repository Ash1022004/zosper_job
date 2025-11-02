import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { getUser, userLogout } from '@/store/userStore';
import { useEffect, useState } from 'react';
import { apiLogout, apiMe } from '@/lib/api';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [admin, setAdmin] = useState<any>(null);
  const user = getUser();
  useEffect(() => {
    (async () => {
      const me = await apiMe();
      setAdmin(me?.user || null);
    })();
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold">
          <img src="/JOB_VAULTlogo.png" alt="Job Vault" className="h-6 w-6" />
          <span>Job vault</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link to="/" className={`hover:text-primary transition-colors ${location.pathname === '/' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>Home</Link>
          {admin?.role === 'admin' ? (
            <Button size="sm" onClick={async () => { await apiLogout(); navigate('/', { replace: true }); }}>Admin logout</Button>
          ) : user ? (
            <div className="flex items-center gap-3">
              <span className="text-muted-foreground text-xs">Hi, {user.name || user.email.split('@')[0]}</span>
              <Button size="sm" variant="outline" onClick={() => { userLogout(); localStorage.removeItem('token'); navigate('/', { replace: true }); }}>Logout</Button>
            </div>
          ) : (
            <Button size="sm" variant="outline" onClick={() => navigate('/user-login')}>Sign in</Button>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;


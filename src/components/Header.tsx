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
      try {
        const me = await apiMe();
        // Only set admin if user is actually an admin
        if (me?.user && (me.user.role === 'admin' || me.user.isAdmin === true)) {
          setAdmin(me.user);
        } else {
          setAdmin(null);
          // Clear stale token if not authenticated
          localStorage.removeItem('admin_token');
        }
      } catch {
        // Not authenticated or request failed
        setAdmin(null);
        localStorage.removeItem('admin_token');
      }
    })();
  }, [location.pathname]);

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold"
          onClick={async (e) => {
            if (admin?.role === 'admin') {
              e.preventDefault();
              try {
                await apiLogout();
                localStorage.removeItem('admin_token'); // Clear token from localStorage
              } finally {
                setAdmin(null);
                navigate('/', { replace: true });
                window.location.reload(); // Force refresh
              }
            }
          }}
        >
          {/* <img src="/JOB_VAULTlogo.png" alt="Job Vault" className="h-6 w-6" /> */}
          <span>Job vault</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            to="/"
            className={`hover:text-primary transition-colors ${location.pathname === '/' ? 'font-semibold text-primary' : 'text-muted-foreground'}`}
            onClick={async (e) => {
              if (admin?.role === 'admin') {
                e.preventDefault();
                try {
                  await apiLogout();
                  localStorage.removeItem('admin_token'); // Clear token from localStorage
                } finally {
                  setAdmin(null);
                  navigate('/', { replace: true });
                  window.location.reload(); // Force refresh
                }
              }
            }}
          >
            Home
          </Link>
          {admin?.role === 'admin' ? (
            <Button size="sm" onClick={async () => { 
              await apiLogout(); 
              localStorage.removeItem('admin_token'); // Clear token from localStorage
              setAdmin(null); 
              navigate('/', { replace: true });
              // Force refresh to clear any cached state
              window.location.reload();
            }}>Admin logout</Button>
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


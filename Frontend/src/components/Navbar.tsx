import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ShoppingBag, User, Menu, X, LogOut, Store, Search, Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useShopContext } from '@/context/ShopContext';
import { useTheme } from '@/context/ThemeContext';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NavbarProps { onCartClick: () => void; }

const Navbar: React.FC<NavbarProps> = ({ onCartClick }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();
  const { isAuthenticated, user, logout, isAdmin } = useAuth();
  const { hasShops, isLoadingShop, clearShops } = useShopContext();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Add shadow on scroll
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setIsMobileMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    clearShops();
    logout();
    navigate('/');
  };

  const shopNavItem = isAuthenticated && !isAdmin
    ? isLoadingShop ? null
      : hasShops
        ? <NavLink to="/my-shops" active={location.pathname.startsWith('/my-shop')}>Manage Shops</NavLink>
        : <NavLink to="/create-shop" active={location.pathname === '/create-shop'}>Create Shop</NavLink>
    : !isAuthenticated
      ? <NavLink to="/create-shop" active={location.pathname === '/create-shop'}>Create Shop</NavLink>
      : null;

  const shopMobileItem = isAuthenticated && !isAdmin
    ? isLoadingShop ? null
      : hasShops
        ? <MobileNavLink to="/my-shops">Manage Shops</MobileNavLink>
        : <MobileNavLink to="/create-shop">Create Shop</MobileNavLink>
    : !isAuthenticated
      ? <MobileNavLink to="/create-shop">Create Shop</MobileNavLink>
      : null;

  const userInitials = user?.studentName
    ? user.studentName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : '';

  return (
    <header className={cn(
      'sticky top-0 z-50 transition-all duration-300',
      isScrolled
        ? 'bg-white/95 dark:bg-[hsl(20,14%,9%)]/95 backdrop-blur-md shadow-sm border-b border-border/50'
        : 'bg-white/90 dark:bg-[hsl(20,14%,9%)]/90 backdrop-blur-sm border-b border-transparent'
    )}>
      <div className="container mx-auto px-4 lg:px-6 flex items-center justify-between h-16">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-1 flex-shrink-0">
          <span className="font-serif text-2xl text-duwaz-brown leading-none">Duwaz</span>
          <span className="text-duwaz-brown text-2xl font-light leading-none">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          <NavLink to="/" active={location.pathname === '/'}>Home</NavLink>
          <NavLink to="/marketplace" active={location.pathname === '/marketplace'}>Marketplace</NavLink>
          {shopNavItem}
          <NavLink to="/about" active={location.pathname === '/about'}>About</NavLink>
        </nav>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Search icon */}
          <Button
            variant="ghost" size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-duwaz-cream/60 dark:hover:bg-white/10"
            onClick={() => navigate('/marketplace')}
            aria-label="Search"
          >
            <Search className="h-4.5 w-4.5" />
          </Button>

          {/* Dark / Light toggle */}
          <Button
            variant="ghost" size="icon"
            className="rounded-full text-muted-foreground hover:text-foreground hover:bg-duwaz-cream/60 dark:hover:bg-white/10 transition-all duration-200"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              <Sun className="h-4.5 w-4.5 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          {/* Cart */}
          <Button
            variant="ghost" size="icon"
            className="rounded-full relative text-muted-foreground hover:text-foreground hover:bg-duwaz-cream/60"
            onClick={onCartClick}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-duwaz-brown text-white text-[10px] font-bold rounded-full h-4.5 w-4.5 flex items-center justify-center min-w-[18px] px-1">
                {totalItems}
              </span>
            )}
          </Button>

          {/* User */}
          {isAuthenticated ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-duwaz-brown focus-visible:ring-offset-2">
                  <Avatar className="h-8 w-8 ring-2 ring-duwaz-brown/20 hover:ring-duwaz-brown/50 transition-all">
                    {user?.profileImage && (
                      <AvatarImage src={user.profileImage} alt={user.studentName} className="object-cover" />
                    )}
                    <AvatarFallback className="bg-duwaz-brown text-white text-xs font-semibold">
                      {userInitials || <User className="h-3.5 w-3.5" />}
                    </AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl shadow-lg border-border/60 p-1">
                <DropdownMenuLabel className="font-semibold text-sm px-3 py-2">
                  {user?.studentName}
                  <p className="text-xs font-normal text-muted-foreground truncate">{user?.email}</p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {isAdmin && (
                  <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                    <Link to="/admin">Admin Dashboard</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link to="/account">My Account</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                  <Link to="/my-orders">My Orders</Link>
                </DropdownMenuItem>
                {!isAdmin && !isLoadingShop && (
                  hasShops ? (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/my-shops">
                        <Store className="mr-2 h-4 w-4" />Manage Shops
                      </Link>
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem asChild className="rounded-xl cursor-pointer">
                      <Link to="/create-shop">
                        <Store className="mr-2 h-4 w-4" />Create Shop
                      </Link>
                    </DropdownMenuItem>
                  )
                )}
                <DropdownMenuSeparator className="my-1" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-xl cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50"
                >
                  <LogOut className="mr-2 h-4 w-4" />Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              asChild
              size="sm"
              className="rounded-full bg-duwaz-brown hover:bg-duwaz-brown/90 text-white px-5 shadow-sm"
            >
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {/* Mobile: cart + hamburger */}
        <div className="flex items-center gap-1 md:hidden">
          <Button
            variant="ghost" size="icon"
            className="rounded-full relative"
            onClick={onCartClick}
            aria-label="Open cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-duwaz-brown text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </Button>
          <Button
            variant="ghost" size="icon"
            className="rounded-full"
            onClick={() => setIsMobileMenuOpen(v => !v)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={cn(
        'md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white dark:bg-[hsl(20,14%,11%)] border-t border-border/50',
        isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
      )}>
        <div className="container mx-auto px-4 py-4 flex flex-col gap-1">
          <MobileNavLink to="/">Home</MobileNavLink>
          <MobileNavLink to="/marketplace">Marketplace</MobileNavLink>
          {shopMobileItem}
          <MobileNavLink to="/about">About</MobileNavLink>
          <div className="my-1 border-t border-border/50" />
          {isAuthenticated ? (
            <>
              <MobileNavLink to="/account">My Account</MobileNavLink>
              <MobileNavLink to="/my-orders">My Orders</MobileNavLink>
              {isAdmin && <MobileNavLink to="/admin">Admin Dashboard</MobileNavLink>}
              <button
                onClick={handleLogout}
                className="text-left px-3 py-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="mx-3 my-1 btn-primary text-center text-sm"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

const NavLink = ({ to, active, children }: { to: string; active?: boolean; children: React.ReactNode }) => (
  <Link
    to={to}
    className={cn(
      'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
      active
        ? 'text-duwaz-brown bg-duwaz-brown/10 dark:text-[hsl(25,65%,65%)] dark:bg-duwaz-brown/20'
        : 'text-foreground/80 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/10'
    )}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, children }: { to: string; children: React.ReactNode }) => {
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <Link
      to={to}
      className={cn(
        'px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
        active
          ? 'text-duwaz-brown bg-duwaz-cream/70'
          : 'text-foreground/80 hover:text-foreground hover:bg-muted/60'
      )}
    >
      {children}
    </Link>
  );
};

export default Navbar;

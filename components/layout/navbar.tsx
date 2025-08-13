'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LogOut, Settings, LayoutDashboard, Shield, Menu, X, Car, Heart, Bell, TrendingUp, ChevronRight } from 'lucide-react';
import { ROUTES } from '@/lib/constants';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Profile } from '@/lib/types/database';
import { cn } from '@/lib/utils';

interface NavbarProps {
  user: { email?: string; user_metadata?: { avatar_url?: string } } | null;
  profile: Profile | null;
}

export default function Navbar({ user, profile }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push(ROUTES.HOME);
    router.refresh();
  };

  const navLinks = [
    { 
      href: ROUTES.AUCTIONS.LIVE, 
      label: 'Live Auctions',
      badge: 'Live',
      badgeColor: 'bg-green-500/10 text-green-600 border-green-500/20'
    },
    { href: ROUTES.AUCTIONS.UPCOMING, label: 'Upcoming' },
    { href: ROUTES.AUCTIONS.ENDED, label: 'Results' },
  ];

  return (
    <nav 
      className={cn(
        'sticky top-0 z-50 transition-all duration-300',
        isScrolled 
          ? 'bg-background/95 backdrop-blur-md border-b shadow-sm' 
          : 'bg-background border-b border-transparent'
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Desktop Nav */}
          <div className="flex items-center gap-8">
            <Link 
              href={ROUTES.HOME} 
              className="flex items-center gap-2 group"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center group-hover:shadow-lg transition-all">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold">
                Jap<span className="text-primary">DEAL</span>
              </span>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200',
                    pathname === link.href
                      ? 'text-primary bg-primary/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {link.label}
                    {link.badge && (
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs px-1.5 py-0", link.badgeColor)}
                      >
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1 animate-pulse" />
                        {link.badge}
                      </Badge>
                    )}
                  </span>
                  {pathname === link.href && (
                    <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-primary rounded-full" />
                  )}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-3">
            {user ? (
              <>
                {/* Quick Actions */}
                <div className="hidden md:flex items-center gap-2">
                  <Link href={ROUTES.DASHBOARD + '/watchlist'}>
                    <Button variant="ghost" size="icon" className="relative">
                      <Heart className="h-4 w-4" />
                      <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-4 w-4" />
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-destructive rounded-full" />
                  </Button>
                </div>

                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="relative h-9 px-2 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8 border-2 border-primary/20">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:block text-left">
                          <p className="text-sm font-medium leading-none">
                            {profile?.display_name || 'User'}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {profile?.role === 'admin' ? 'Administrator' : 'Member'}
                          </p>
                        </div>
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={user.user_metadata?.avatar_url} />
                          <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
                            {profile?.display_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {profile?.display_name || 'User'}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={ROUTES.DASHBOARD} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <LayoutDashboard className="mr-3 h-4 w-4" />
                          Dashboard
                        </span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={ROUTES.DASHBOARD + '/bids/active'} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <TrendingUp className="mr-3 h-4 w-4" />
                          My Bids
                        </span>
                        <Badge variant="secondary" className="text-xs">3 Active</Badge>
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href={ROUTES.DASHBOARD + '/watchlist'} className="flex items-center justify-between">
                        <span className="flex items-center">
                          <Heart className="mr-3 h-4 w-4" />
                          Watchlist
                        </span>
                        <Badge variant="secondary" className="text-xs">5 Items</Badge>
                      </Link>
                    </DropdownMenuItem>
                    
                    {profile?.role === 'admin' && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild className="cursor-pointer">
                          <Link href={ROUTES.ADMIN.BASE} className="flex items-center">
                            <Shield className="mr-3 h-4 w-4 text-primary" />
                            <span className="text-primary font-medium">Admin Panel</span>
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild className="cursor-pointer">
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-3 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="cursor-pointer text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-3 h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href={ROUTES.AUTH.SIGN_IN}>
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Sign in
                  </Button>
                </Link>
                <Link href={ROUTES.AUTH.SIGN_UP}>
                  <Button size="sm" className="btn-gradient">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col gap-4 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                        pathname === link.href
                          ? 'text-primary bg-primary/10'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      )}
                    >
                      <span>{link.label}</span>
                      {link.badge && (
                        <Badge 
                          variant="secondary" 
                          className={cn("text-xs", link.badgeColor)}
                        >
                          {link.badge}
                        </Badge>
                      )}
                    </Link>
                  ))}
                  
                  {user && (
                    <>
                      <div className="border-t pt-4 mt-2">
                        <Link
                          href={ROUTES.DASHBOARD}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center">
                            <LayoutDashboard className="mr-3 h-4 w-4" />
                            Dashboard
                          </span>
                        </Link>
                        <Link
                          href={ROUTES.DASHBOARD + '/watchlist'}
                          onClick={() => setMobileMenuOpen(false)}
                          className="flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg hover:bg-muted transition-colors"
                        >
                          <span className="flex items-center">
                            <Heart className="mr-3 h-4 w-4" />
                            Watchlist
                          </span>
                        </Link>
                      </div>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
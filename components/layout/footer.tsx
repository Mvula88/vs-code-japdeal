'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function Footer() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  // If user is authenticated, only show contact info
  if (isAuthenticated) {
    return (
      <footer className="border-t bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h3 className="font-bold text-lg mb-4">JapDEAL</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Your trusted platform for Japanese car imports to Namibia
            </p>
            <div className="flex justify-center items-center gap-4 text-sm text-muted-foreground">
              <Link href="/contact" className="hover:text-primary">
                Contact Us
              </Link>
              <span>•</span>
              <a href="mailto:japdeal@gmail.com" className="hover:text-primary">
                japdeal@gmail.com
              </a>
              <span>•</span>
              <a href="tel:+264813214813" className="hover:text-primary">
                +264 081 321 4813
              </a>
            </div>
            <div className="mt-6 text-sm text-muted-foreground">
              <p>&copy; 2025 JapDEAL. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show full footer for non-authenticated users
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="font-bold text-lg mb-4">JapDEAL</h3>
            <p className="text-sm text-muted-foreground">
              Your trusted platform for Japanese car imports to Namibia
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Auctions</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={ROUTES.AUCTIONS.LIVE} className="text-muted-foreground hover:text-primary">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUCTIONS.UPCOMING} className="text-muted-foreground hover:text-primary">
                  Upcoming Auctions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUCTIONS.ENDED} className="text-muted-foreground hover:text-primary">
                  Ended Auctions
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/how-it-works" className="text-muted-foreground hover:text-primary">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-muted-foreground hover:text-primary">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-3">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/terms" className="text-muted-foreground hover:text-primary">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground hover:text-primary">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>&copy; 2025 JapDEAL. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
'use client';

import Link from 'next/link';
import { ROUTES } from '@/lib/constants';
import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Car, Mail, Phone, MapPin } from 'lucide-react';

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
      <footer className="border-t bg-slate-900 text-slate-100">
        <div className="container mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Car className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-2xl">JapDEAL</h3>
            </div>
            <p className="text-slate-400 mb-6 max-w-md mx-auto">
              Your trusted platform for Japanese car imports to Namibia
            </p>
            <div className="flex flex-wrap justify-center items-center gap-6 text-sm">
              <Link href="/contact" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                Contact Us
              </Link>
              <a href="mailto:japdealnamibia@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                japdealnamibia@gmail.com
              </a>
              <a href="tel:+264813214813" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +264 081 321 4813
              </a>
            </div>
            <div className="mt-8 pt-8 border-t border-slate-800 text-sm text-slate-500">
              <p>&copy; 2025 JapDEAL. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    );
  }

  // Show full footer for non-authenticated users
  return (
    <footer className="bg-slate-900 text-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          <div className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <Car className="h-8 w-8 text-primary" />
              <h3 className="font-bold text-2xl">JapDEAL</h3>
            </div>
            <p className="text-slate-400 mb-6 max-w-md">
              Your trusted platform for Japanese car imports to Namibia. Quality vehicles, transparent pricing, and professional service.
            </p>
            <div className="space-y-2 text-sm">
              <a href="mailto:japdealnamibia@gmail.com" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                japdealnamibia@gmail.com
              </a>
              <a href="tel:+264813214813" className="flex items-center gap-2 text-slate-400 hover:text-primary transition-colors">
                <Phone className="h-4 w-4" />
                +264 081 321 4813
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <MapPin className="h-4 w-4" />
                Windhoek, Namibia
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Auctions</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href={ROUTES.AUCTIONS.LIVE} className="text-slate-400 hover:text-primary transition-colors">
                  Live Auctions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUCTIONS.UPCOMING} className="text-slate-400 hover:text-primary transition-colors">
                  Upcoming Auctions
                </Link>
              </li>
              <li>
                <Link href={ROUTES.AUCTIONS.ENDED} className="text-slate-400 hover:text-primary transition-colors">
                  Ended Auctions
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Support</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/how-it-works" className="text-slate-400 hover:text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-slate-400 hover:text-primary transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-slate-400 hover:text-primary transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link href="/terms" className="text-slate-400 hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-400 hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-400 hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">
              &copy; 2025 JapDEAL. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm text-slate-500">
              <span>Built with quality and trust</span>
              <span>•</span>
              <span>Serving Namibia since 2025</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
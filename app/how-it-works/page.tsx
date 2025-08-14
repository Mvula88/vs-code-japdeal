import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, Search, Gavel, Trophy, Truck, CheckCircle } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Sign Up',
    description: 'Create your free account to start bidding on Japanese import vehicles.',
  },
  {
    icon: Search,
    title: 'Browse Auctions',
    description: 'Explore our selection of quality Japanese vehicles in live and upcoming auctions.',
  },
  {
    icon: Gavel,
    title: 'Place Your Bid',
    description: 'Bid on vehicles you&apos;re interested in. Watch live auctions in real-time.',
  },
  {
    icon: Trophy,
    title: 'Win the Auction',
    description: 'If you have the highest bid when the auction ends, you win the vehicle.',
  },
  {
    icon: Truck,
    title: 'Shipping & Import',
    description: 'We handle all the logistics of shipping your vehicle from Japan to Namibia.',
  },
  {
    icon: CheckCircle,
    title: 'Receive Your Vehicle',
    description: 'Pick up your vehicle at the port or arrange for delivery to your location.',
  },
];

export default function HowItWorksPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">How It Works</h1>
          <p className="text-lg text-muted-foreground">
            Your journey to owning a quality Japanese import vehicle in 6 simple steps
          </p>
        </div>

        <div className="space-y-6">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="text-2xl font-bold text-primary">{index + 1}.</span>
                        {step.title}
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base ml-16">
                    {step.description}
                  </CardDescription>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="mt-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Ready to Get Started?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              Join thousands of satisfied customers who have found their perfect Japanese import vehicle through JapDEAL.
            </p>
            <a href="/auth/sign-up" className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4">
              Create Your Account
            </a>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Cookie, Shield, Settings, Info } from 'lucide-react';

export default function CookiesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <Link href="/">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Button>
      </Link>

      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Cookie className="h-10 w-10 text-primary" />
        </div>
        <h1 className="text-4xl font-bold mb-4">Cookie Policy</h1>
        <p className="text-muted-foreground">
          Last updated: January 2025
        </p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Info className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-3">What Are Cookies?</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Cookies are small text files that are placed on your device when you visit our website. 
                  They help us provide you with a better experience by remembering your preferences and 
                  understanding how you use our platform.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Shield className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4">How We Use Cookies</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2">Essential Cookies</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      These cookies are necessary for the website to function properly. They enable core 
                      functionality such as security, network management, and accessibility. You cannot 
                      opt-out of these cookies as they are essential for the site to work.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Authentication Cookies</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We use these cookies to keep you signed in to your account and maintain your session 
                      security. They help us verify your identity and ensure your account remains secure.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Preference Cookies</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      These cookies remember your settings and preferences, such as your preferred language, 
                      theme (dark/light mode), and other customization options to provide you with a 
                      personalized experience.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-semibold mb-2">Analytics Cookies</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      We use analytics cookies to understand how visitors interact with our website. 
                      This helps us improve our service, fix issues, and develop new features based on 
                      user behavior and preferences.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Settings className="h-6 w-6 text-primary mt-1 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-semibold mb-4">Managing Your Cookie Preferences</h2>
                <div className="space-y-3">
                  <p className="text-muted-foreground leading-relaxed">
                    You have control over the cookies we use. Here's how you can manage them:
                  </p>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong>Browser Settings:</strong> Most web browsers allow you to control cookies 
                        through their settings. You can set your browser to refuse cookies or delete cookies 
                        that have already been set.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong>Essential Cookies:</strong> Please note that blocking essential cookies may 
                        impact the functionality of our website and prevent you from using certain features.
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>
                        <strong>Third-Party Cookies:</strong> We do not use third-party advertising cookies. 
                        All cookies are first-party and used solely for the operation and improvement of our service.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Cookies We Use</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left pb-3 font-semibold">Cookie Name</th>
                    <th className="text-left pb-3 font-semibold">Purpose</th>
                    <th className="text-left pb-3 font-semibold">Duration</th>
                  </tr>
                </thead>
                <tbody className="text-muted-foreground">
                  <tr className="border-b">
                    <td className="py-3">sb-access-token</td>
                    <td className="py-3">Authentication and session management</td>
                    <td className="py-3">Session</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">sb-refresh-token</td>
                    <td className="py-3">Keeps you logged in</td>
                    <td className="py-3">30 days</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">theme</td>
                    <td className="py-3">Stores your theme preference</td>
                    <td className="py-3">1 year</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-3">locale</td>
                    <td className="py-3">Stores your language preference</td>
                    <td className="py-3">1 year</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Updates to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We may update this Cookie Policy from time to time to reflect changes in our practices 
              or for other operational, legal, or regulatory reasons. We will notify you of any 
              material changes by posting the new Cookie Policy on this page and updating the 
              "Last updated" date.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <h2 className="text-2xl font-semibold mb-4">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have any questions about our Cookie Policy or how we handle your data, 
              please contact us:
            </p>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Email:</strong>{' '}
                <a href="mailto:japdealnamibia@gmail.com" className="text-primary hover:underline">
                  japdealnamibia@gmail.com
                </a>
              </p>
              <p>
                <strong>Phone:</strong>{' '}
                <a href="tel:+264813214813" className="text-primary hover:underline">
                  +264 081 321 4813
                </a>
              </p>
              <p>
                <strong>Address:</strong> Windhoek, Namibia
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center">
        <Link href="/">
          <Button>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
}
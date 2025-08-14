import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We collect information you provide directly to us, including:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Billing and shipping addresses</li>
                <li>Payment information (processed securely through third-party providers)</li>
                <li>Bidding history and preferences</li>
                <li>Communications with our support team</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We use the information we collect to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Process your registration and manage your account</li>
                <li>Facilitate bidding and auction transactions</li>
                <li>Process payments and shipping</li>
                <li>Send you important updates about your transactions</li>
                <li>Respond to your comments and questions</li>
                <li>Improve our services and user experience</li>
                <li>Comply with legal obligations</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Information Sharing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>We do not sell, trade, or rent your personal information. We may share your information with:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Service providers who assist in our operations</li>
                <li>Shipping and logistics partners</li>
                <li>Payment processors</li>
                <li>Legal authorities when required by law</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Data Security</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We implement appropriate technical and organizational measures to protect your personal 
                information against unauthorized access, alteration, disclosure, or destruction. However, 
                no internet transmission is completely secure, and we cannot guarantee absolute security.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Cookies and Tracking</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We use cookies and similar tracking technologies to track activity on our website and 
                hold certain information. You can instruct your browser to refuse all cookies or to 
                indicate when a cookie is being sent.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Your Rights</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>You have the right to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Access your personal information</li>
                <li>Correct inaccurate information</li>
                <li>Request deletion of your information</li>
                <li>Object to processing of your information</li>
                <li>Request restriction of processing</li>
                <li>Data portability</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Children&apos;s Privacy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Our service is not directed to individuals under 18. We do not knowingly collect personal 
                information from children under 18. If we become aware that a child under 18 has provided 
                us with personal information, we will take steps to delete such information.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                Your information may be transferred to and maintained on servers located outside of your 
                country. By using our service, you consent to such transfers.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Changes to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by 
                posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>If you have questions about this Privacy Policy, please contact us at:</p>
              <div className="mt-2">
                <p>Email: japdealnamibia@gmail.com</p>
                <p>Phone: +264 081 321 4813</p>
                <p>Address: Windhoek, Namibia</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
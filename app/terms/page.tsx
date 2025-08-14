import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Terms of Service</h1>
          <p className="text-lg text-muted-foreground">
            Last updated: January 2025
          </p>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-gray dark:prose-invert max-w-none">
              <p>
                By accessing and using JapDEAL, you accept and agree to be bound by these Terms of Service 
                and our Privacy Policy. If you do not agree to these terms, please do not use our service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>2. User Accounts</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>To use our services, you must:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Be at least 18 years old</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
                <li>Notify us immediately of any unauthorized use</li>
                <li>Be responsible for all activities under your account</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>3. Bidding Rules</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>When participating in auctions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>All bids are binding and cannot be retracted</li>
                <li>You must have the intention and ability to complete the purchase</li>
                <li>Bid manipulation or fraudulent bidding is strictly prohibited</li>
                <li>Winners must complete payment within 48 hours</li>
                <li>Non-payment may result in account suspension</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>4. Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                While we strive to provide accurate information about vehicles, JapDEAL makes no warranties 
                regarding the condition, quality, or specifications of vehicles. All vehicles are sold 
                &quot;as is&quot; and buyers are responsible for conducting their own due diligence.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>5. Fees and Payment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="list-disc pl-6 space-y-2">
                <li>Service fees are non-refundable once an auction is won</li>
                <li>All prices are displayed in Namibian Dollars (N$)</li>
                <li>Import duties and shipping costs are additional</li>
                <li>Payment must be made through approved methods only</li>
                <li>Late payments may incur additional charges</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>6. Shipping and Delivery</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                JapDEAL facilitates shipping from Japan to Namibia. Delivery times are estimates only 
                and may vary due to factors beyond our control. We are not liable for delays caused by 
                shipping companies, customs, or force majeure events.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                JapDEAL shall not be liable for any indirect, incidental, special, consequential, or 
                punitive damages resulting from your use or inability to use the service, vehicles purchased, 
                or any other matter relating to the service.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                We reserve the right to suspend or terminate your account at our discretion for violation 
                of these terms, fraudulent activity, or any other reason we deem necessary to protect our 
                service and users.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>9. Governing Law</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>
                These Terms of Service are governed by the laws of the Republic of Namibia. Any disputes 
                shall be resolved in the courts of Namibia.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>10. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p>For questions about these Terms of Service, please contact us at:</p>
              <div className="mt-2">
                <p>Email: japdealnamibia@gmail.com</p>
                <p>Phone: +264 081 321 4813</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
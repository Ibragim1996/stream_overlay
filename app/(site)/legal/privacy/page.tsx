export default function Page() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Privacy Policy</h1>
        <p className="text-sm opacity-80">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="mb-3">
              We collect information you provide directly to us, such as when you create an account, 
              subscribe to our service, or contact us for support.
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, display name, and authentication data from Google</li>
              <li><strong>Payment Information:</strong> Billing details processed securely through Stripe</li>
              <li><strong>Usage Data:</strong> How you interact with our overlay and streaming tools</li>
              <li><strong>Stream Data:</strong> Streamer name, tone preferences, and overlay settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="mb-3">We use the information we collect to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide and maintain our streaming overlay service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Generate personalized AI tasks and content for your streams</li>
              <li>Send you technical notices and support messages</li>
              <li>Improve our service and develop new features</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="mb-3">
              We do not sell, trade, or otherwise transfer your personal information to third parties, except:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Service Providers:</strong> Stripe for payments, Firebase for authentication</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger or acquisition</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p>
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. All data is encrypted in transit 
              and at rest.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
            <p className="mb-3">You have the right to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Access and update your account information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of promotional communications</li>
              <li>Request a copy of your personal data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience, analyze usage patterns, 
              and provide personalized content. You can control cookie settings through your browser.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Children's Privacy</h2>
            <p>
              Our service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If you believe we have collected such information, 
              please contact us immediately.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new Privacy Policy on this page and updating the "Last updated" date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-[rgba(10,14,28,.65)] rounded-xl border border-[#243058]">
              <p><strong>Email:</strong> privacy@seeko.ai</p>
              <p><strong>Website:</strong> <a href="/" className="text-[#8bd0ff] hover:underline">seeko.ai</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
export default function Page() {
  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#0b1020_0%,#0c1226_100%)] text-[#e6e9f2]">
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <h1 className="text-3xl font-bold">Terms of Service</h1>
        <p className="text-sm opacity-80">Last updated: {new Date().toLocaleDateString()}</p>
        
        <div className="space-y-6 text-sm leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p>
              By accessing and using Seeko ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, 
              please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
            <p className="mb-3">
              Seeko is an AI-powered streaming overlay service that provides:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Real-time AI-generated tasks and challenges for streamers</li>
              <li>Interactive overlay components for streaming platforms</li>
              <li>Premium features including unlimited usage and priority generation</li>
              <li>Customizable tone settings (Funny, Motivator, Serious, Chill, Street)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. User Accounts</h2>
            <p className="mb-3">
              To access certain features of the Service, you must create an account. You agree to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Maintain the security of your account credentials</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Use the Service for any unlawful purpose or to violate any laws</li>
              <li>Generate or display inappropriate, offensive, or harmful content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Use automated tools to abuse or overload our service</li>
              <li>Violate the terms of service of streaming platforms (Twitch, YouTube, etc.)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Subscription and Billing</h2>
            <p className="mb-3">
              Our Service offers both free and premium subscription tiers:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li><strong>Free Tier:</strong> Basic features with usage limitations</li>
              <li><strong>Premium Monthly:</strong> $24/month for unlimited usage</li>
              <li><strong>Premium Yearly:</strong> $240/year (best value)</li>
            </ul>
            <p className="mt-3">
              Subscriptions automatically renew unless cancelled. You can cancel anytime through 
              your account settings or by contacting support.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Content and Intellectual Property</h2>
            <p className="mb-3">
              You retain ownership of your stream content. By using our Service, you grant us a 
              limited license to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Generate and deliver AI content to your overlay</li>
              <li>Store your preferences and settings</li>
              <li>Analyze usage patterns to improve our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Privacy</h2>
            <p>
              Your privacy is important to us. Please review our Privacy Policy, which explains 
              how we collect, use, and protect your information when you use our Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">8. Disclaimers</h2>
            <p className="mb-3">
              The Service is provided "as is" without warranties of any kind. We disclaim all 
              warranties, express or implied, including but not limited to:
            </p>
            <ul className="list-disc ml-6 space-y-2">
              <li>Merchantability and fitness for a particular purpose</li>
              <li>Accuracy, reliability, or completeness of content</li>
              <li>Uninterrupted or error-free operation</li>
              <li>Security against unauthorized access</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">9. Limitation of Liability</h2>
            <p>
              In no event shall Seeko be liable for any indirect, incidental, special, consequential, 
              or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
              or other intangible losses, resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">10. Termination</h2>
            <p className="mb-3">
              We may terminate or suspend your account immediately, without prior notice, for conduct 
              that we believe violates these Terms or is harmful to other users, us, or third parties.
            </p>
            <p>
              You may terminate your account at any time by contacting us or using the account 
              deletion feature in your settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">11. Changes to Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify users of any 
              material changes via email or through the Service. Your continued use of the Service 
              after such modifications constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">12. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the 
              jurisdiction in which Seeko operates, without regard to conflict of law principles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">13. Contact Information</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="mt-3 p-4 bg-[rgba(10,14,28,.65)] rounded-xl border border-[#243058]">
              <p><strong>Email:</strong> legal@seeko.ai</p>
              <p><strong>Support:</strong> support@seeko.ai</p>
              <p><strong>Website:</strong> <a href="/" className="text-[#8bd0ff] hover:underline">seeko.ai</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
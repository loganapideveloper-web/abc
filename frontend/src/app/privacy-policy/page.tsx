export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-primary-950 to-surface-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="page-container relative py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Privacy <span className="text-primary-400">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Last updated: March 1, 2026</p>
        </div>
      </div>

      <div className="page-container py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Information We Collect</h2>
            <p>When you use AMOHA Mobiles, we may collect the following types of information:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><span className="text-gray-600 dark:text-gray-300">Personal Information:</span> Name, email address, phone number, and shipping address when you create an account or place an order.</li>
              <li><span className="text-gray-600 dark:text-gray-300">Payment Information:</span> Payment method details processed securely through our payment partners.</li>
              <li><span className="text-gray-600 dark:text-gray-300">Usage Data:</span> Browser type, pages visited, and interaction data to improve our services.</li>
              <li><span className="text-gray-600 dark:text-gray-300">Device Information:</span> Device model and brand when you submit a service request.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Process and fulfill your orders and service requests.</li>
              <li>Communicate order status, shipping updates, and support responses.</li>
              <li>Improve our website, products, and customer experience.</li>
              <li>Send promotional communications (only with your consent).</li>
              <li>Prevent fraud and ensure security of our platform.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Information Sharing</h2>
            <p>We do not sell or rent your personal information. We may share your data with:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><span className="text-gray-600 dark:text-gray-300">Logistics Partners:</span> Shipping details with DHL, Professional Courier, or other delivery services to fulfill orders.</li>
              <li><span className="text-gray-600 dark:text-gray-300">Payment Processors:</span> Secure payment processing partners.</li>
              <li><span className="text-gray-600 dark:text-gray-300">Legal Requirements:</span> When required by law or to protect our rights.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Data Security</h2>
            <p>We implement industry-standard security measures including encryption, secure servers, and access controls to protect your personal information. However, no method of transmission over the internet is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. Cookies</h2>
            <p>We use cookies and similar technologies to maintain your session, remember preferences, and analyze site traffic. You can manage cookie preferences through your browser settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Your Rights</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Access, update, or delete your personal information through your account settings.</li>
              <li>Opt out of marketing communications at any time.</li>
              <li>Request a copy of your stored data by contacting us.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Third-Party Links</h2>
            <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices of these external sites.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Children&apos;s Privacy</h2>
            <p>Our services are not directed at children under 13. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. Changes will be posted on this page with a revised &quot;Last updated&quot; date.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">10. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at:</p>
            <div className="mt-2">
              <p className="text-gray-600 dark:text-gray-300">Email: support@amoha.com</p>
              <p className="text-gray-600 dark:text-gray-300">Phone: +91 98765 43210</p>
              <p className="text-gray-600 dark:text-gray-300">Address: MG Road, Mumbai, Maharashtra 400001</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-primary-950 to-surface-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="page-container relative py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Terms of <span className="text-primary-400">Service</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Last updated: March 1, 2026</p>
        </div>
      </div>

      <div className="page-container py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">1. Acceptance of Terms</h2>
            <p>By accessing and using the AMOHA Mobiles website, you agree to comply with and be bound by these Terms of Service. If you do not agree, please do not use our services.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">2. Products & Services</h2>
            <p>We sell smartphones, mobile accessories, and provide mobile repair services. All products are subject to availability. We reserve the right to limit quantities and discontinue products without notice.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">3. Pricing</h2>
            <p>All prices are listed in Indian Rupees (INR) and include applicable taxes unless otherwise stated. We reserve the right to change prices without prior notice. Prices at the time of order placement will be honored.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">4. Orders & Payment</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Orders are subject to acceptance and product availability.</li>
              <li>We accept Cash on Delivery (COD), UPI, credit/debit cards, and net banking.</li>
              <li>We reserve the right to cancel orders due to pricing errors, stock issues, or suspected fraud.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">5. User Accounts</h2>
            <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate information and keep it updated. We may suspend accounts that violate our policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">6. Repair Services</h2>
            <p>Repair estimates are approximate. Final pricing will be communicated before work begins. Warranty on repairs is provided for the specific part repaired (30 days unless stated otherwise). We are not responsible for data loss during repair.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">7. Intellectual Property</h2>
            <p>All content on this website including text, images, logos, and software is the property of AMOHA Mobiles. Unauthorized use is prohibited.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">8. Limitation of Liability</h2>
            <p>AMOHA Mobiles shall not be liable for any indirect, incidental, or consequential damages arising from use of our website or services. Our total liability is limited to the amount paid for the product or service in question.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">9. Governing Law</h2>
            <p>These terms are governed by the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai, Maharashtra.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">10. Contact</h2>
            <p>For questions about these terms, contact us at <span className="text-primary-400">support@amoha.com</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ReturnPolicyPage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-primary-950 to-surface-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="page-container relative py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Return <span className="text-primary-400">Policy</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Last updated: March 1, 2026</p>
        </div>
      </div>

      <div className="page-container py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Return Eligibility</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Products can be returned within <span className="text-gray-600 dark:text-gray-300">7 days</span> of delivery.</li>
              <li>The item must be unused, in original packaging, with all accessories and tags intact.</li>
              <li>Products with physical damage caused by the customer are not eligible.</li>
              <li>SIM cards, tempered glass (once applied), and batteries (once installed) cannot be returned.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">How to Initiate a Return</h2>
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <span className="text-primary-400">My Orders</span> in your account.</li>
              <li>Select the order and click <span className="text-gray-600 dark:text-gray-300">&quot;Cancel Order&quot;</span> (if not shipped) or contact support.</li>
              <li>Our team will arrange pickup or guide you to our nearest store.</li>
            </ol>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Refund Process</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>Refunds are processed within <span className="text-gray-600 dark:text-gray-300">5-7 business days</span> after we receive and inspect the returned item.</li>
              <li>Refunds will be credited to the original payment method.</li>
              <li>COD orders will be refunded via bank transfer (NEFT/IMPS).</li>
              <li>Shipping charges are non-refundable unless the return is due to our error.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Exchange</h2>
            <p>We offer exchanges for defective or damaged products. Contact our support team within 48 hours of delivery with photos of the issue.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Repair Service Returns</h2>
            <p>Repair services carry a <span className="text-gray-600 dark:text-gray-300">30-day warranty</span> on the specific part repaired. If the same issue recurs within warranty, we will re-service at no additional cost.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>For return-related queries, email <span className="text-primary-400">support@amoha.com</span> or call <span className="text-primary-400">+91 98765 43210</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

export default function ShippingInfoPage() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden border-b border-gray-200 dark:border-white/5 bg-gradient-to-b from-primary-950 to-surface-50">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.15),transparent_50%)]" />
        <div className="page-container relative py-12 sm:py-16 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Shipping <span className="text-primary-400">Information</span>
          </h1>
          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Everything you need to know about delivery</p>
        </div>
      </div>

      <div className="page-container py-10 sm:py-14 max-w-3xl mx-auto">
        <div className="glass-card p-6 sm:p-8 space-y-6 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delivery Partners</h2>
            <p>We work with trusted logistics partners to ensure safe and timely delivery:</p>
            <ul className="mt-2 list-disc list-inside space-y-1">
              <li><span className="text-gray-600 dark:text-gray-300">DHL Express</span> — Premium and express deliveries</li>
              <li><span className="text-gray-600 dark:text-gray-300">Professional Courier</span> — Standard domestic shipping</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delivery Timeline</h2>
            <div className="mt-2 overflow-hidden rounded-lg border border-gray-200 dark:border-white/10">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/[0.03]">
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Location</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Standard</th>
                    <th className="px-4 py-2.5 text-xs font-semibold text-gray-600 dark:text-gray-300">Express</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-gray-200 dark:border-white/5">
                    <td className="px-4 py-2.5">Metro Cities</td>
                    <td className="px-4 py-2.5">3-5 days</td>
                    <td className="px-4 py-2.5">1-2 days</td>
                  </tr>
                  <tr className="border-b border-gray-200 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                    <td className="px-4 py-2.5">Tier 2 Cities</td>
                    <td className="px-4 py-2.5">5-7 days</td>
                    <td className="px-4 py-2.5">2-3 days</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-2.5">Other Areas</td>
                    <td className="px-4 py-2.5">7-10 days</td>
                    <td className="px-4 py-2.5">3-5 days</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Shipping Charges</h2>
            <ul className="list-disc list-inside space-y-1">
              <li><span className="text-primary-400 font-medium">Free shipping</span> on orders above ₹999.</li>
              <li>Standard shipping: <span className="text-gray-600 dark:text-gray-300">₹49</span> for orders below ₹999.</li>
              <li>Express shipping charges vary based on location and weight.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Order Tracking</h2>
            <p>Once your order is shipped, you will receive a tracking number via email and SMS. You can also track your order from the <span className="text-primary-400">My Orders</span> page in your account.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Delivery Areas</h2>
            <p>We currently deliver across India. Some remote PIN codes may have longer delivery times or limited courier partner availability.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Undelivered Orders</h2>
            <p>If delivery is unsuccessful after 3 attempts, the order will be returned to us and a refund will be initiated. Contact support to reschedule delivery.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Contact</h2>
            <p>For shipping queries, email <span className="text-primary-400">support@amoha.com</span> or call <span className="text-primary-400">+91 98765 43210</span>.</p>
          </section>
        </div>
      </div>
    </div>
  );
}

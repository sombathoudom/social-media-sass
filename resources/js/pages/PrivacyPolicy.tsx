import { Head } from '@inertiajs/react';

export default function PrivacyPolicy() {
  return (
    <>
      <Head title="Privacy Policy" />

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto bg-white shadow-sm rounded-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="space-y-6 text-gray-700">
            <section>
              <p className="text-sm text-gray-500 mb-6">
                Last Updated: {new Date().toLocaleDateString()}
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p>
                This Privacy Policy describes how our Social Media Management System ("we", "our", or "the Service") 
                collects, uses, and shares information when you use our Facebook integration features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Information We Collect</h2>
              <h3 className="text-xl font-medium text-gray-800 mb-2">2.1 Facebook Account Information</h3>
              <p className="mb-4">When you connect your Facebook account, we collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Your Facebook profile information (name, email, profile picture)</li>
                <li>Facebook Pages you manage</li>
                <li>Page access tokens for automation</li>
                <li>Comments and messages on your Facebook Pages</li>
              </ul>

              <h3 className="text-xl font-medium text-gray-800 mb-2 mt-4">2.2 Usage Data</h3>
              <p className="mb-4">We automatically collect:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Log data (IP address, browser type, access times)</li>
                <li>Campaign performance data</li>
                <li>Comment automation logs</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="mb-4">We use the collected information to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide and maintain the Service</li>
                <li>Automate comment responses on your Facebook Pages</li>
                <li>Send broadcast messages to your audience</li>
                <li>Monitor live video comments</li>
                <li>Manage Facebook Messenger conversations</li>
                <li>Detect and prevent offensive comments</li>
                <li>Improve and optimize our Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Storage and Security</h2>
              <p className="mb-4">
                We implement appropriate security measures to protect your data:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access tokens are encrypted in our database</li>
                <li>Secure HTTPS connections for all data transmission</li>
                <li>Regular security audits and updates</li>
                <li>Limited access to personal data by authorized personnel only</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Sharing</h2>
              <p className="mb-4">
                We do not sell, trade, or rent your personal information to third parties. 
                We only share data with:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Facebook (as required for the integration to function)</li>
                <li>Service providers who assist in operating our Service</li>
                <li>Law enforcement when required by law</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Facebook Platform Policy Compliance</h2>
              <p className="mb-4">
                Our Service complies with Facebook's Platform Policy. We:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Only request necessary permissions</li>
                <li>Use data only for the purposes you authorize</li>
                <li>Respect Facebook's data usage policies</li>
                <li>Allow you to disconnect your Facebook account at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
              <p className="mb-4">You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Access your personal data</li>
                <li>Correct inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Disconnect your Facebook account</li>
                <li>Export your data</li>
                <li>Opt-out of automated processing</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Data Retention</h2>
              <p>
                We retain your data for as long as your account is active or as needed to provide services. 
                When you disconnect your Facebook account, we delete your access tokens immediately. 
                Other data may be retained for up to 90 days for backup and recovery purposes.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children's Privacy</h2>
              <p>
                Our Service is not intended for users under 18 years of age. We do not knowingly 
                collect personal information from children under 18.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy from time to time. We will notify you of any changes 
                by posting the new Privacy Policy on this page and updating the "Last Updated" date.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="mb-4">
                If you have questions about this Privacy Policy, please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="font-medium">Email: privacy@yourdomain.com</p>
                <p className="font-medium">Address: Your Company Address</p>
              </div>
            </section>

            <section className="border-t pt-6 mt-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Deletion Instructions</h2>
              <p className="mb-4">
                To delete your data from our system:
              </p>
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Log in to your account</li>
                <li>Go to Settings → Account</li>
                <li>Click "Delete Account"</li>
                <li>Confirm deletion</li>
              </ol>
              <p className="mt-4">
                Alternatively, you can email us at privacy@yourdomain.com with your deletion request.
              </p>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}

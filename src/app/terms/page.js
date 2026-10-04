'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Home } from 'lucide-react';
import { Button } from '../../components/ui/button';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="neutral" size="sm" className="mb-6">
              <Home className="h-4 w-4 mr-1" />
              Back to Home
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-8">
            <FileText className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Terms of Use</h1>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-neutral-300">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Educational Use</h2>
              <p>
                This platform is provided for educational purposes to support students learning probability and statistics. 
                By using this platform, you agree to use it solely for learning and academic purposes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Academic Integrity</h2>
              <p>
                Users must maintain academic integrity when using this platform. This includes:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Not copying solutions for graded assignments without understanding</li>
                <li>Properly citing this resource when used in academic work</li>
                <li>Following your institution’s academic policies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Content Usage</h2>
              <p>
                All educational content, visualizations, and examples are provided “as is” for learning purposes. 
                While we strive for accuracy, users should verify important calculations independently.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Privacy</h2>
              <p>
                You can use the lessons without an account, and guest progress stays in this browser.
                If email sign-in is available and you choose to use it, the authentication provider receives
                your email address and sign-in information. Completed study records, quiz history and quiz
                preferences can be saved to your account and synchronized across devices; check the progress
                page for pending or failed synchronization. Reading positions and unfinished quizzes stay
                in this browser and are not included in account synchronization.
              </p>
              <p>
                Adding guest records to an account requires your explicit choice. Signing out does not
                delete saved account progress or the guest copy in this browser. Clearing browser data can
                remove guest records, device-only details and account updates that have not synchronized.
                Backups may contain your progress and account identifiers, so keep them confidential.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Disclaimer</h2>
              <p>
                This platform is a supplementary learning tool. It should not replace attending classes, 
                reading textbooks, or seeking help from instructors.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Changes to Terms</h2>
              <p>
                These terms may be updated periodically. Continued use of the platform constitutes 
                acceptance of any changes.
              </p>
            </section>

            <div className="pt-8 mt-8 border-t border-neutral-700 text-sm text-neutral-400">
              <p>Last updated: October 3, 2026</p>
              <p>For questions about these terms, please <a href="mailto:support@problab.com" className="text-teal-400 hover:text-teal-300">contact us</a>.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
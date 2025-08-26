'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, HelpCircle } from 'lucide-react';
import FAQSection from '../../../components/landing/sections/FAQSection';
import { Button } from '../../../components/ui/button';

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-800">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/help" className="text-neutral-400 hover:text-white transition-colors">
              Help Center
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">FAQ</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/help">
            <Button variant="neutral" size="sm" className="mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Help Center
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Frequently Asked Questions</h1>
          </div>
          <p className="text-neutral-400">
            Find answers to common questions about the Probability Lab platform and course content.
          </p>
        </div>
      </section>

      {/* FAQ Component */}
      <FAQSection />

      {/* Additional Help */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Didn&apos;t find your answer?</h2>
          <p className="text-neutral-400 mb-6">
            We&apos;re here to help! Reach out through one of these channels:
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@problab.com">
              <Button variant="primary" size="sm">
                Contact Support
              </Button>
            </a>
            <Link href="/help/office-hours">
              <Button variant="neutral" size="sm">
                Office Hours
              </Button>
            </Link>
            <Link href="/help/getting-started">
              <Button variant="neutral" size="sm">
                Getting Started Guide
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
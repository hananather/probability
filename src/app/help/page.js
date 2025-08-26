'use client';

import React from 'react';
import Link from 'next/link';
import { 
  HelpCircle, 
  MessageCircle, 
  Clock, 
  BookOpen, 
  ArrowRight,
  Mail,
  Users,
  FileText
} from 'lucide-react';
import { Button } from '../../components/ui/button';

const helpSections = [
  {
    icon: MessageCircle,
    title: "Frequently Asked Questions",
    description: "Find answers to common questions about the platform, course content, and technical issues.",
    link: "/help/faq",
    color: "text-blue-400"
  },
  {
    icon: Mail,
    title: "Contact Support",
    description: "Reach out to report technical issues or get help with the platform.",
    link: "mailto:support@problab.com",
    color: "text-green-400"
  },
  {
    icon: Clock,
    title: "Office Hours",
    description: "Check available office hours and schedule one-on-one help sessions.",
    link: "/help/office-hours",
    color: "text-purple-400"
  },
  {
    icon: BookOpen,
    title: "Getting Started Guide",
    description: "New to the platform? Learn how to navigate and make the most of your learning experience.",
    link: "/help/getting-started",
    color: "text-teal-400"
  }
];

const quickLinks = [
  { name: "Prerequisites Check", href: "/prerequisites" },
  { name: "Formula Sheets", href: "/resources/formulas" },
  { name: "Practice Problems", href: "/resources/practice" },
  { name: "Study Tips", href: "/resources/study-tips" },
  { name: "Chapter 1 - Getting Started", href: "/chapter1" },
  { name: "Course Overview", href: "/overview" }
];

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section */}
      <section className="py-12 px-4 bg-gradient-to-b from-neutral-800 to-neutral-900">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-500/10 rounded-full mb-6">
            <HelpCircle className="h-8 w-8 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold mb-4">Help Center</h1>
          <p className="text-xl text-neutral-300">
            Get the support you need to succeed in your probability and statistics journey
          </p>
        </div>
      </section>

      {/* Help Sections Grid */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {helpSections.map((section, index) => {
              const Icon = section.icon;
              const isMailto = section.link.startsWith('mailto:');
              const Wrapper = isMailto ? 'a' : Link;
              const wrapperProps = isMailto ? { href: section.link } : { href: section.link };
              
              return (
                <Wrapper key={index} {...wrapperProps}>
                  <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-all hover:bg-neutral-800/80 cursor-pointer group">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-neutral-700 rounded-lg flex items-center justify-center">
                          <Icon className={`h-6 w-6 ${section.color}`} />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold mb-2 group-hover:text-teal-400 transition-colors">
                          {section.title}
                        </h3>
                        <p className="text-neutral-400 mb-3">
                          {section.description}
                        </p>
                        <div className="flex items-center text-teal-400 text-sm">
                          <span>Learn more</span>
                          <ArrowRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Wrapper>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Links Section */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-teal-400" />
            Quick Links
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {quickLinks.map((link, index) => (
              <Link
                key={index}
                href={link.href}
                className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg hover:bg-neutral-700 transition-colors group"
              >
                <span className="text-neutral-300 group-hover:text-white">
                  {link.name}
                </span>
                <ArrowRight className="h-4 w-4 text-neutral-500 group-hover:text-teal-400 group-hover:translate-x-1 transition-all" />
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Common Issues Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Common Issues & Solutions</h2>
          <div className="space-y-4">
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">
                Visualizations not loading?
              </h3>
              <p className="text-neutral-400 text-sm">
                Try refreshing the page or clearing your browser cache. Ensure you&apos;re using a modern browser (Chrome, Firefox, Safari, or Edge).
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">
                Progress not saving?
              </h3>
              <p className="text-neutral-400 text-sm">
                Your progress is saved locally in your browser. Make sure cookies and local storage are enabled for this site.
              </p>
            </div>
            <div className="bg-neutral-800 rounded-lg p-4 border border-neutral-700">
              <h3 className="font-semibold text-white mb-2">
                Math formulas not displaying correctly?
              </h3>
              <p className="text-neutral-400 text-sm">
                The platform uses MathJax for rendering. If formulas appear as raw text, wait a moment for them to load or refresh the page.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Still Need Help CTA */}
      <section className="py-12 px-4 bg-gradient-to-r from-teal-900/20 to-blue-900/20">
        <div className="max-w-4xl mx-auto text-center">
          <Users className="h-12 w-12 text-teal-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Still Need Help?</h2>
          <p className="text-neutral-300 mb-8 max-w-2xl mx-auto">
            Can&apos;t find what you&apos;re looking for? Our teaching team is here to help you succeed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="mailto:support@problab.com">
              <Button size="lg" variant="primary">
                Contact Support
              </Button>
            </a>
            <Link href="/help/office-hours">
              <Button size="lg" variant="neutral">
                View Office Hours
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
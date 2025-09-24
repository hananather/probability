'use client';

import React from 'react';
import { 
  Brain, 
  Eye, 
  Hand, 
  Lightbulb,
  Target,
  Users,
  BookOpen,
  TrendingUp,
  Sparkles,
  Award,
  Zap,
  Layers,
  Compass,
  Heart,
  Code2,
  GraduationCap
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import TeamSection from '@/components/about/TeamSection';
import HananImage from './Hanan.jpg';
import PatrickImage from './Patrick.png';

const principles = [
  {
    icon: Eye,
    title: "Visual First",
    description: "Abstract concepts become concrete through interactive visualizations. See probability distributions change in real-time as you adjust parameters.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: Hand,
    title: "Learn by Doing",
    description: "No passive watching. Every concept includes hands-on activities where you manipulate variables and observe outcomes immediately.",
    color: "from-purple-500 to-pink-500"
  },
  {
    icon: Brain,
    title: "Build Intuition",
    description: "Move beyond memorization. Our approach helps you develop deep intuition for why formulas work, not just how to use them.",
    color: "from-orange-500 to-red-500"
  },
  {
    icon: Target,
    title: "Focused Practice",
    description: "Targeted exercises that adapt to your understanding. Get more practice where you need it, move quickly through concepts you've mastered.",
    color: "from-green-500 to-emerald-500"
  }
];

const features = [
  {
    icon: Lightbulb,
    title: "Multiple Representations",
    description: "Visual, numerical, and symbolic views of every concept",
    highlight: "yellow"
  },
  {
    icon: TrendingUp,
    title: "Immediate Feedback",
    description: "Learn from mistakes instantly with real-time results",
    highlight: "green"
  },
  {
    icon: Users,
    title: "Self-Paced Learning",
    description: "Go as fast or slow as you need, review anytime",
    highlight: "blue"
  },
  {
    icon: Zap,
    title: "Interactive Simulations",
    description: "Run thousands of experiments with a single click",
    highlight: "purple"
  },
  {
    icon: Layers,
    title: "Layered Complexity",
    description: "Start simple, add complexity as understanding grows",
    highlight: "pink"
  },
  {
    icon: Compass,
    title: "Guided Exploration",
    description: "Structured activities that encourage discovery",
    highlight: "cyan"
  }
];

// Stats removed per request

const teamMembers = [
  {
    name: 'Hanan Ather',
    image: HananImage,
    website: 'https://hananather.com/',
    bio: 'AI Engineer at the Center of Artificial Intelligence Research and Excellence (CAIRE), Statistics Canada, translating advanced research into practical systems for federal agencies. Holds an M.Sc. in Mathematics & Statistics from the University of Ottawa, with research in deep reinforcement learning and function optimization.',
  },
  {
    name: 'Patrick Boily',
    image: PatrickImage,
    website: 'https://www.idlewyldanalytics.com/',
    bio: "Assistant Professor, Department of Mathematics & Statistics, University of Ottawa. Ph.D. in Mathematics (2006) and author of several textbooks in mathematics, statistics, and data science. Work spans academia, public service, and applied analytics; led Carleton University's CQADS, co-founded the Data Action Lab, and consulted for organizations including PHAC, CATSA, and DND. Expertise includes operations research, predictive analytics, stochastic modelling, and simulation.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Hero Section - Enhanced */}
      <section className="relative py-16 px-4 overflow-hidden">
        
        <div className="relative max-w-5xl mx-auto">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/30 rounded-full mb-6">
              <Sparkles className="h-4 w-4 text-teal-400" />
              <span className="text-sm text-teal-300">Interactive Learning Platform</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-blue-400 to-purple-400">
                Probability Lab
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-neutral-300 leading-relaxed max-w-3xl mx-auto">
              Where abstract statistics becomes tangible understanding through 
              <span className="text-teal-400 font-semibold"> interactive exploration</span> and 
              <span className="text-blue-400 font-semibold"> visual discovery</span>
            </p>
          </div>
        </div>
      </section>

      

      {/* Our Story - moved up */}
      <section id="story" className="py-16 px-4 scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-500/10 border border-purple-500/30 rounded-full mb-6">
                <Heart className="h-4 w-4 text-purple-400" />
                <span className="text-sm text-purple-300">Our Story</span>
              </div>
              
              <h2 className="text-4xl font-bold mb-6">
                Built by Learners & Educators,
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400"> For Students</span>
              </h2>
              
              <div className="space-y-4 text-neutral-300">
                <p className="leading-relaxed">
                  We&apos;ve experienced both sides of the classroom—Hanan as a mathematics & statistics student turned AI engineer, and Patrick as a professor of mathematics and statistics. We saw firsthand how abstract formulas can feel disconnected from real understanding.
                </p>
                
                <p className="leading-relaxed">
                  Interactive, visual explorations changed how we learned and taught. That insight shaped Probability Lab: hands-on activities that turn confusion into clarity.
                </p>
                
                <p className="leading-relaxed font-medium text-white">
                  We built the resource we wished we had when we started learning statistics.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              <div className="space-y-5">
                <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-500 shadow-sm">
                    <Code2 className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Interactive Tools</h4>
                  <p className="text-sm text-neutral-400">Hands-on visual explorers that make ideas stick.</p>
                </div>
                
                <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-blue-500 to-cyan-500 shadow-sm">
                    <Eye className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Visual First</h4>
                  <p className="text-sm text-neutral-400">See distributions and ideas evolve in real time.</p>
                </div>

                <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-teal-500 to-emerald-500 shadow-sm">
                    <Zap className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Immediate Feedback</h4>
                  <p className="text-sm text-neutral-400">Learn faster with results and corrections on the spot.</p>
                </div>
              </div>
              
              <div className="space-y-5 mt-10">
                <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-500 shadow-sm">
                    <GraduationCap className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Instructor‑Approved</h4>
                  <p className="text-sm text-neutral-400">Crafted and reviewed by university educators.</p>
                </div>
                
                <div className="bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
                  <div className="w-12 h-12 rounded-lg mb-3 flex items-center justify-center bg-gradient-to-br from-orange-500 to-amber-500 shadow-sm">
                    <BookOpen className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold mb-2">Exam‑Ready Notes</h4>
                  <p className="text-sm text-neutral-400">Clear summaries that bridge concepts to problems.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section - moved up */}
      <TeamSection id="team" members={teamMembers} />

      {/* Philosophy Section - Redesigned */}
      <section id="philosophy" className="py-16 px-4 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-500/10 border border-teal-500/30 rounded-full mb-6 text-teal-300 text-sm">Our Approach</div>
            <h2 className="text-4xl font-bold mb-4">A New Way to Learn Statistics</h2>
            <p className="text-lg text-neutral-400 max-w-3xl mx-auto">
              Traditional education relies on passive consumption. We believe in active construction 
              of knowledge through exploration, experimentation, and immediate feedback.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <div 
                  key={index} 
                  className="group relative bg-neutral-900/60 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className={`pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br ${principle.color} opacity-10 group-hover:opacity-20 transition-opacity`} />
                  <div className="relative">
                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${principle.color} shadow-sm ring-1 ring-white/10`}>
                      <Icon className="h-7 w-7 text-white drop-shadow" />
                    </div>
                    
                    <h3 className="text-xl font-semibold mb-3">{principle.title}</h3>
                    <p className="text-neutral-300 text-sm leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Why It Works - Grid Layout */}
      <section id="why" className="py-16 px-4 bg-neutral-950/50 scroll-mt-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-6">
              Why This Approach Works
            </h2>
            <p className="text-lg text-neutral-400 max-w-2xl mx-auto">
              Research-backed methods that transform how you understand probability
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              const colorMap = {
                yellow: "text-yellow-400 bg-yellow-400/10",
                green: "text-green-400 bg-green-400/10",
                blue: "text-blue-400 bg-blue-400/10",
                purple: "text-purple-400 bg-purple-400/10",
                pink: "text-pink-400 bg-pink-400/10",
                cyan: "text-cyan-400 bg-cyan-400/10"
              };
              const colors = colorMap[feature.highlight];
              
              return (
                <div key={index} className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 ${colors.split(' ')[1]} rounded-lg flex items-center justify-center`}>
                    <Icon className={`h-6 w-6 ${colors.split(' ')[0]}`} />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-neutral-400 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      

      {/* Mission Statement */}
      <section id="mission" className="py-16 px-4 bg-neutral-950/50 scroll-mt-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-neutral-900/70 rounded-2xl p-10 border border-neutral-800">
            <Sparkles className="h-12 w-12 text-teal-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-lg text-neutral-300 leading-relaxed mb-8">
              To make probability and statistics accessible, engaging, and deeply understood 
              by every student. We believe that with the right tools, anyone can master these 
              fundamental concepts that shape our understanding of the world.
            </p>
            <div className="flex justify-center">
              <Link href="/chapter1">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white border-0 shadow-sm"
                >
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

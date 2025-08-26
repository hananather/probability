'use client';

import React from 'react';
import { Quote, TrendingUp, Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah M.",
    program: "Mechanical Engineering, 3rd Year",
    gradeBefore: "C+",
    gradeAfter: "A-",
    quote: "The interactive visualizations finally made probability distributions click for me. Being able to adjust parameters and see instant changes helped me understand the 'why' behind formulas.",
    helpfulFeature: "Interactive normal distribution explorer"
  },
  {
    name: "Michael T.",
    program: "Physics, 2nd Year",
    gradeBefore: "C",
    gradeAfter: "A",
    quote: "Coming from physics, I needed to understand error analysis and uncertainty. The confidence interval visualizations made statistical inference intuitive for my quantum mechanics course.",
    helpfulFeature: "Confidence interval simulations"
  },
  {
    name: "Lisa W.",
    program: "Economics, 3rd Year",
    gradeBefore: "B-",
    gradeAfter: "A",
    quote: "Essential for econometrics! The regression visualizations helped me understand model fitting and residual analysis better than any textbook ever could.",
    helpfulFeature: "Interactive regression analysis"
  },
  {
    name: "James L.",
    program: "Computer Engineering, 2nd Year",
    gradeBefore: "D",
    gradeAfter: "B+",
    quote: "I was completely lost with hypothesis testing until I found this platform. The step-by-step examples and the ability to practice with immediate feedback saved my grade.",
    helpfulFeature: "Hypothesis testing simulator"
  },
  {
    name: "Jennifer K.",
    program: "Chemistry, 3rd Year",
    gradeBefore: "C+",
    gradeAfter: "A-",
    quote: "Perfect for understanding measurement uncertainty and analytical chemistry statistics. The sampling distribution animations made complex concepts crystal clear.",
    helpfulFeature: "Sampling distribution visualizer"
  },
  {
    name: "Alex C.",
    program: "Finance, 2nd Year",
    gradeBefore: "C-",
    gradeAfter: "B+",
    quote: "Risk analysis and portfolio theory require solid stats. The probability distributions section gave me the foundation I needed for financial modeling.",
    helpfulFeature: "Multiple distribution comparisons"
  },
  {
    name: "Maria K.",
    program: "Civil Engineering, 2nd Year",
    gradeBefore: "B-",
    gradeAfter: "A",
    quote: "As a visual learner, textbooks never worked for me. Here, I could see concepts come alive. The Bayes theorem visualizer alone was worth hours of traditional study.",
    helpfulFeature: "Bayes theorem interactive diagram"
  },
  {
    name: "Rachel S.",
    program: "Biology, 3rd Year",
    gradeBefore: "D+",
    gradeAfter: "B+",
    quote: "Biostatistics was my nightmare until this platform. The ANOVA visualizations and experimental design tools made research methods finally make sense.",
    helpfulFeature: "Statistical test selection guide"
  },
  {
    name: "Ahmed R.",
    program: "Electrical Engineering, 3rd Year",
    gradeBefore: "C",
    gradeAfter: "B+",
    quote: "The practice problems with hints were perfect. Instead of just seeing solutions, I learned how to approach problems systematically. My problem-solving speed doubled.",
    helpfulFeature: "Guided practice problems"
  },
  {
    name: "Thomas H.",
    program: "Data Science, 2nd Year",
    gradeBefore: "B",
    gradeAfter: "A+",
    quote: "Bridged the gap between theory and application perfectly. The interactive examples helped me understand the math behind machine learning algorithms.",
    helpfulFeature: "Distribution parameter exploration"
  },
  {
    name: "Emily C.",
    program: "Psychology, 3rd Year",
    gradeBefore: "C",
    gradeAfter: "A-",
    quote: "Research methods and stats were holding me back. The hypothesis testing games and p-value simulations turned abstract concepts into something I could actually understand.",
    helpfulFeature: "P-value interpretation tools"
  },
  {
    name: "David P.",
    program: "Management, 2nd Year",
    gradeBefore: "C-",
    gradeAfter: "B",
    quote: "Business analytics requires stats knowledge. This platform made quality control, forecasting, and decision analysis accessible with real-world examples.",
    helpfulFeature: "Process capability calculator"
  }
];

const TestimonialCard = ({ testimonial }) => {
  const improvement = testimonial.gradeAfter.charCodeAt(0) - testimonial.gradeBefore.charCodeAt(0);
  
  return (
    <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700 hover:border-neutral-600 transition-colors">
      {/* Quote Icon */}
      <Quote className="h-8 w-8 text-teal-400/20 mb-4" />
      
      {/* Quote */}
      <p className="text-neutral-300 mb-4 leading-relaxed italic">
        "{testimonial.quote}"
      </p>
      
      {/* Most Helpful Feature */}
      <div className="text-sm text-teal-400 mb-4">
        Most helpful: {testimonial.helpfulFeature}
      </div>
      
      {/* Student Info */}
      <div className="border-t border-neutral-700 pt-4">
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold text-white">{testimonial.name}</div>
            <div className="text-sm text-neutral-400">{testimonial.program}</div>
          </div>
          
          {/* Grade Improvement */}
          <div className="text-right">
            <div className="flex items-center space-x-1 text-green-400">
              <TrendingUp className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {testimonial.gradeBefore} → {testimonial.gradeAfter}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function TestimonialsSection() {
  return (
    <section className="py-20 px-4 lg:pl-32 bg-neutral-950">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center space-x-2 mb-4">
            <Star className="h-8 w-8 text-teal-400" />
            <h2 className="text-3xl font-bold text-white">
              Student Success Stories
            </h2>
          </div>
          <p className="text-neutral-400 max-w-2xl mx-auto">
            Real students who improved their understanding and grades using this platform
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <TestimonialCard key={index} testimonial={testimonial} />
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-12 text-center">
          <p className="text-xs text-neutral-500">
            * Individual results may vary. Success depends on consistent practice and engagement with the material.
          </p>
        </div>
      </div>
    </section>
  );
}
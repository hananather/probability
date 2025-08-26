'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, 
  Clock, 
  Calendar,
  MapPin,
  User,
  Video,
  Users,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { cn } from '../../../lib/design-system';

const officeHours = [
  {
    day: 'Monday',
    sessions: [
      {
        time: '10:00 AM - 12:00 PM',
        instructor: 'the Professor',
        location: 'Room 312, Math Building',
        type: 'in-person',
        available: true
      },
      {
        time: '2:00 PM - 4:00 PM',
        instructor: 'the Teaching Assistant (TA)',
        location: 'Online (Zoom)',
        type: 'virtual',
        available: true
      }
    ]
  },
  {
    day: 'Tuesday',
    sessions: [
      {
        time: '1:00 PM - 3:00 PM',
        instructor: 'the Teaching Assistant (TA)',
        location: 'Room 210, Math Building',
        type: 'in-person',
        available: true
      }
    ]
  },
  {
    day: 'Wednesday',
    sessions: [
      {
        time: '10:00 AM - 12:00 PM',
        instructor: 'the Professor',
        location: 'Room 312, Math Building',
        type: 'in-person',
        available: true
      },
      {
        time: '3:00 PM - 5:00 PM',
        instructor: 'the Teaching Assistant (TA)',
        location: 'Online (Zoom)',
        type: 'virtual',
        available: true
      }
    ]
  },
  {
    day: 'Thursday',
    sessions: [
      {
        time: '2:00 PM - 4:00 PM',
        instructor: 'the Professor',
        location: 'Online (Zoom)',
        type: 'virtual',
        available: true
      }
    ]
  },
  {
    day: 'Friday',
    sessions: [
      {
        time: '10:00 AM - 12:00 PM',
        instructor: 'the Teaching Assistant (TA)',
        location: 'Room 210, Math Building',
        type: 'in-person',
        available: true
      }
    ]
  }
];

const upcomingSpecialSessions = [
  {
    date: 'March 15, 2024',
    time: '6:00 PM - 8:00 PM',
    title: 'Midterm Review Session',
    instructor: 'the Professor',
    location: 'Lecture Hall A',
    type: 'in-person'
  },
  {
    date: 'April 2, 2024',
    time: '5:00 PM - 7:00 PM',
    title: 'Hypothesis Testing Workshop',
    instructor: 'the Teaching Assistant (TA)',
    location: 'Online (Zoom)',
    type: 'virtual'
  }
];

export default function OfficeHoursPage() {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const currentDaySchedule = officeHours.find(d => d.day === selectedDay);

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Breadcrumb Navigation */}
      <div className="border-b border-neutral-800">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <nav className="flex items-center space-x-2 text-sm">
            <Link href="/help" className="text-neutral-400 hover:text-white transition-colors">
              Help Center
            </Link>
            <span className="text-neutral-500">/</span>
            <span className="text-white">Office Hours</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Link href="/help">
            <Button variant="neutral" size="sm" className="mb-6">
              <ChevronLeft className="h-4 w-4 mr-1" />
              Back to Help Center
            </Button>
          </Link>
          
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-8 w-8 text-teal-400" />
            <h1 className="text-3xl font-bold">Office Hours</h1>
          </div>
          <div className="space-y-2">
            <p className="text-neutral-400">
              Get one-on-one help from instructors and teaching assistants during scheduled office hours.
            </p>
            <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg px-4 py-3">
              <p className="text-yellow-300 text-sm font-medium">
                ⚠️ Experimental Feature: This office hours system is currently being tested and schedules are placeholders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Weekly Schedule */}
      <section className="py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Weekly Schedule</h2>
          
          {/* Day Selector */}
          <div className="flex flex-wrap gap-2 mb-8">
            {officeHours.map((schedule) => (
              <button
                key={schedule.day}
                onClick={() => setSelectedDay(schedule.day)}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all",
                  selectedDay === schedule.day
                    ? "bg-teal-600 text-white"
                    : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"
                )}
              >
                {schedule.day}
              </button>
            ))}
          </div>

          {/* Sessions for Selected Day */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentDaySchedule?.sessions.map((session, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-1">
                      {session.time}
                    </h3>
                    <p className="text-neutral-400">{session.instructor}</p>
                  </div>
                  {session.available ? (
                    <span className="flex items-center text-green-400 text-sm">
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Available
                    </span>
                  ) : (
                    <span className="flex items-center text-red-400 text-sm">
                      <AlertCircle className="h-4 w-4 mr-1" />
                      Cancelled
                    </span>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    {session.type === 'virtual' ? (
                      <Video className="h-4 w-4 text-neutral-400" />
                    ) : (
                      <MapPin className="h-4 w-4 text-neutral-400" />
                    )}
                    <span className="text-neutral-300">{session.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-300">Drop-in (no appointment needed)</span>
                  </div>
                </div>

                {session.type === 'virtual' && (
                  <div className="mt-4 pt-4 border-t border-neutral-700">
                    <Button variant="primary" size="sm" className="w-full">
                      Join Zoom Meeting
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Special Sessions */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 flex items-center">
            <Calendar className="h-6 w-6 mr-2 text-teal-400" />
            Upcoming Special Sessions
          </h2>
          
          <div className="space-y-4">
            {upcomingSpecialSessions.map((session, index) => (
              <div key={index} className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {session.title}
                    </h3>
                    <div className="space-y-1 text-sm text-neutral-400">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>{session.date}</span>
                        <Clock className="h-4 w-4 ml-4" />
                        <span>{session.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4" />
                        <span>{session.instructor}</span>
                        {session.type === 'virtual' ? (
                          <>
                            <Video className="h-4 w-4 ml-4" />
                            <span>{session.location}</span>
                          </>
                        ) : (
                          <>
                            <MapPin className="h-4 w-4 ml-4" />
                            <span>{session.location}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 md:mt-0">
                    <Button variant="neutral" size="sm">
                      Add to Calendar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guidelines */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Office Hours Guidelines</h2>
          <div className="bg-neutral-800 rounded-lg p-6 border border-neutral-700">
            <ul className="space-y-3 text-neutral-300">
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Office hours are first-come, first-served. No appointment necessary.</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Bring specific questions or problems you&apos;re working on.</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Be prepared to show your work and explain what you&apos;ve tried.</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>For virtual sessions, ensure your camera and microphone work beforehand.</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>If office hours are busy, time may be limited to ensure everyone gets help.</span>
              </li>
              <li className="flex items-start">
                <span className="text-teal-400 mr-2">•</span>
                <span>Check your email for any last-minute cancellations or changes.</span>
              </li>
            </ul>
          </div>

          {/* Tips for Success */}
          <div className="mt-8 bg-blue-900/20 border border-blue-600/30 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-300 mb-3">
              Tips for Getting the Most from Office Hours
            </h3>
            <ul className="space-y-2 text-sm text-blue-200">
              <li>• Review your notes and identify specific concepts you&apos;re struggling with</li>
              <li>• Attempt homework problems before coming—we&apos;ll help you understand where you got stuck</li>
              <li>• Bring your textbook, notes, and any relevant materials</li>
              <li>• Don&apos;t wait until the day before an exam—come regularly for best results</li>
              <li>• Consider forming a study group with classmates you meet during office hours</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-12 px-4 bg-neutral-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl font-semibold mb-4">Can&apos;t Make Office Hours?</h2>
          <p className="text-neutral-400 mb-6">
            If the scheduled times don&apos;t work for you, reach out to schedule an appointment.
          </p>
          <a href="mailto:support@problab.com">
            <Button variant="primary" size="sm">
              Contact Support
            </Button>
          </a>
        </div>
      </section>
    </div>
  );
}
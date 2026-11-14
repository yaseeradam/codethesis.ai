'use client';

import React, { useState } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Mail, Phone, MapPin, Send, MessageSquare, Clock, Building } from 'lucide-react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [university, setUniversity] = useState('Federal University of Technology, Akure');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => {
      setSent(false);
      setMessage('');
      alert('Thank you! Your inquiry has been dispatched to the CodeThesis Academic Advisory Team.');
    }, 1000);
  }

  return (
    <AppLayout
      activeItem="support"
      title="Contact CodeThesis AI"
      subtitle="Connect with our institutional campus liaisons, technical researchers, and student support teams"
    >
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Campus Liaisons & Support</h3>
                <p className="text-xs text-slate-500 mt-0.5">Reach out via any of our regional presence desks.</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Lagos Technology Hub</strong>
                    <span className="text-slate-600">Herbert Macaulay Way, Yaba (adjacent UNILAG / YabaTech), Lagos, Nigeria</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Akure Regional Office</strong>
                    <span className="text-slate-600">Ilesha-Owo Expressway, FUTA South Gate Junction, Akure, Ondo State</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Electronic Mail</strong>
                    <span className="text-slate-600">academic@codethesis.com • support@codethesis.com</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Phone className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Direct Telephone & WhatsApp</strong>
                    <span className="text-slate-600">+234 814 555 0192 • +234 803 123 4567</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-slate-900 block">Operating Hours</strong>
                    <span className="text-slate-600">Monday – Saturday: 8:00 AM – 10:00 PM (WAT)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Inquiry Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">Send an Inquiry or Feedback</h3>
                <p className="text-xs text-slate-500 mt-0.5">We respond to student and departmental inquiries within hours.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Your Full Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Adebayo Tunde"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. student@futa.edu.ng"
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">University / Tertiary Institution</label>
                  <input
                    type="text"
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Message or Proposal</label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    placeholder="How can we assist your research or institutional deployment?"
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <button
                  type="submit"
                  disabled={sent}
                  className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold shadow-xs hover:opacity-95 active:scale-95 transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sent ? 'Sending...' : 'Send Message'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

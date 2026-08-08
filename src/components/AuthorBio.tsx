'use client';

import React from 'react';
import { ShieldCheck, Twitter, Linkedin, Award } from 'lucide-react';

interface AuthorBioProps {
  author: string;
  role: string;
  twitter?: string;
  linkedin?: string;
}

export const AuthorBio: React.FC<AuthorBioProps> = ({
  author,
  role,
  twitter = 'https://twitter.com/sarfrajyusuf',
  linkedin = 'https://linkedin.com/in/sarfrajyusuf',
}) => {
  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-200 dark:border-white/10 my-8 bg-gradient-to-r from-slate-900/5 via-slate-900/0 to-emerald-500/5 space-y-4">
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
        {/* Author Avatar */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-indigo-500 p-0.5 shadow-md shrink-0">
          <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center font-extrabold text-white text-xl">
            {author.split(' ').map((n) => n[0]).join('')}
          </div>
        </div>

        {/* Author Metadata */}
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-1.5 font-extrabold text-base text-slate-900 dark:text-white">
                <span>{author}</span>
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                {role}
              </p>
            </div>

            {/* Verified Social Profile Buttons */}
            <div className="flex items-center justify-center gap-2 pt-1 sm:pt-0">
              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg glass-panel hover:border-emerald-500 text-slate-600 dark:text-gray-300 hover:text-emerald-500 transition-all text-xs flex items-center gap-1 font-semibold"
                  title="Verified Twitter / X Profile"
                >
                  <Twitter className="w-3.5 h-3.5" />
                  <span>Twitter</span>
                </a>
              )}

              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg glass-panel hover:border-emerald-500 text-slate-600 dark:text-gray-300 hover:text-emerald-500 transition-all text-xs flex items-center gap-1 font-semibold"
                  title="Verified LinkedIn Profile"
                >
                  <Linkedin className="w-3.5 h-3.5" />
                  <span>LinkedIn</span>
                </a>
              )}
            </div>
          </div>

          <p className="text-xs text-slate-600 dark:text-gray-300 leading-relaxed pt-1">
            <strong>Sarfraj Yusuf</strong> is an SEO strategist and software engineer specializing in high-speed DOM parsing algorithms, semantic N-gram keyword gap extraction, and technical site performance.
          </p>
        </div>
      </div>
    </div>
  );
};

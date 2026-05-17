'use client';
import Link from 'next/link';
import { GraduationCap, BookOpen, MessageSquare, Beaker, Box } from 'lucide-react';

export default function PreparationHub() {
  const cards = [
    {
      href: '/dashboard/student/chapters',
      icon: BookOpen,
      title: 'Reading',
      description: 'Browse chapters and topics to study the material before taking quizzes.',
      color: 'blue',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      href: '/dashboard/ai',
      icon: MessageSquare,
      title: 'AI Prompting',
      description: 'Chat with our AI tutor to clarify concepts and deepen your understanding.',
      color: 'green',
      gradient: 'from-green-500 to-emerald-500',
    },
    {
      href: '/dashboard/student/preparation/sample-quiz',
      icon: Beaker,
      title: 'Sample Quiz',
      description: 'Practice with AI-generated sample quizzes. Ungraded, with instant feedback.',
      color: 'purple',
      gradient: 'from-purple-500 to-pink-500',
    },
    {
      href: '/dashboard/student/preparation/ar-topics',
      icon: Box,
      title: 'AR / 3D Topics',
      description: 'Explore interactive 3D models of pathological specimens for visual learning.',
      color: 'amber',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="animate-in fade-in duration-500">
      <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
        <GraduationCap className="text-blue-400" /> Quiz Preparation
      </h1>
      <p className="text-slate-400 mb-10">Choose a preparation method to get ready for your quizzes.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.href} href={card.href} className="group glass-panel p-8 hover:bg-white/5 transition-all border-t-4"
              style={{ borderTopColor: `var(--tw-gradient-from)` }}>
              <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${card.gradient} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="w-7 h-7 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{card.title}</h2>
              <p className="text-slate-400">{card.description}</p>
              <div className="mt-4 text-sm font-semibold text-blue-400 group-hover:text-blue-300 flex items-center gap-1">
                Get Started →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

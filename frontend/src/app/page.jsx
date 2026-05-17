import Link from 'next/link';
import { BookOpen, BrainCircuit, Activity } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <div className="glass-panel p-12 max-w-3xl w-full">
        <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
          Odontogenic Oral Pathology
        </h1>
        <p className="text-slate-300 text-lg mb-10">
          The ultimate enterprise LMS platform for dental students. Explore interactive 3D models, AI-powered quizzes, and massive analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <BookOpen className="w-10 h-10 text-blue-400 mb-4" />
            <h3 className="font-semibold text-lg">Deep Hierarchies</h3>
            <p className="text-sm text-slate-400 mt-2">Subjects, chapters, and topics linked with precise notes.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <Activity className="w-10 h-10 text-green-400 mb-4" />
            <h3 className="font-semibold text-lg">Advanced Analytics</h3>
            <p className="text-sm text-slate-400 mt-2">Track your progress via heatmaps and radar charts.</p>
          </div>
          <div className="p-6 rounded-xl bg-white/5 border border-white/10 flex flex-col items-center">
            <BrainCircuit className="w-10 h-10 text-purple-400 mb-4" />
            <h3 className="font-semibold text-lg">AI & 3D Integration</h3>
            <p className="text-sm text-slate-400 mt-2">Upload PDFs for auto-generated quizzes and semantic search.</p>
          </div>
        </div>

        <Link href="/login" className="primary-btn inline-block">
          Access the Portal
        </Link>
      </div>
    </main>
  );
}

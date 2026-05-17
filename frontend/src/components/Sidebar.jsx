'use client';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { useState, useEffect } from 'react';
import { 
  Book, LayoutDashboard, BrainCircuit, FileText, Activity, User, LogOut, 
  Upload, ClipboardList, BarChart3, GraduationCap, Beaker, Box, Trophy
} from 'lucide-react';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [userRole, setUserRole] = useState(null);
  const [userName, setUserName] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setUserRole(parsed.role);
        setUserName(parsed.name || '');
      } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    dispatch(logout());
    router.push('/login');
  };

  const isActive = (href) => pathname === href;

  const linkClass = (href, color = 'text-slate-300') => 
    `flex items-center gap-3 ${isActive(href) ? 'text-white bg-white/10' : `${color} hover:text-white hover:bg-white/5`} p-3 rounded-xl transition-all`;

  const studentLinks = [
    { href: '/dashboard', icon: LayoutDashboard, label: 'Progress Dashboard' },
    { href: '/dashboard/student/chapters', icon: Book, label: 'View Chapters' },
    { href: '/dashboard/student/preparation', icon: GraduationCap, label: 'Quiz Preparation' },
    { href: '/dashboard/student/quiz', icon: Beaker, label: 'Take Quiz' },
    { href: '/dashboard/student/tests', icon: Activity, label: 'Take Tests' },
    { href: '/dashboard/student/results', icon: Trophy, label: 'My Results' },
    { href: '/dashboard/profile', icon: User, label: 'Edit Profile' },
  ];

  const facultyLinks = [
    { href: '/dashboard/faculty', icon: LayoutDashboard, label: 'Faculty Dashboard' },
    { href: '/dashboard/faculty/upload-quiz', icon: Upload, label: 'PDF Upload & Quiz Gen' },
    { href: '/dashboard/faculty/quiz-solutions', icon: ClipboardList, label: 'Quiz Solutions' },
    { href: '/dashboard/faculty/reports', icon: BarChart3, label: 'Student Reports' },
    { href: '/dashboard/faculty/chapters', icon: FileText, label: 'Manage Chapters' },
    { href: '/dashboard/faculty/topics', icon: FileText, label: 'Manage Topics' },
    { href: '/dashboard/faculty/tests', icon: BrainCircuit, label: 'Manage Tests' },
  ];

  const links = userRole === 'faculty' ? facultyLinks : studentLinks;
  const roleLabel = userRole === 'faculty' ? 'Faculty' : 'Student';
  const accentColor = userRole === 'faculty' ? 'from-purple-400 to-pink-500' : 'from-blue-400 to-purple-500';

  return (
    <aside className="w-64 bg-secondary/50 backdrop-blur-md border-r border-white/10 h-screen fixed left-0 top-0 p-6 flex flex-col z-50">
      <div className="mb-8">
        <h2 className={`text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r ${accentColor}`}>
          Odontogenic LMS
        </h2>
        {userName && (
          <div className="mt-3 flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${userRole === 'faculty' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'}`}>
              {userName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-sm text-white font-medium truncate max-w-[140px]">{userName}</p>
              <p className={`text-[10px] uppercase tracking-widest font-bold ${userRole === 'faculty' ? 'text-purple-400' : 'text-blue-400'}`}>{roleLabel}</p>
            </div>
          </div>
        )}
      </div>

      <nav className="flex-1 flex flex-col gap-1 overflow-y-auto">
        <p className={`text-xs font-bold uppercase tracking-wider px-3 mb-2 ${userRole === 'faculty' ? 'text-purple-500' : 'text-blue-500'}`}>
          {roleLabel} Portal
        </p>
        
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className={linkClass(link.href, userRole === 'faculty' ? 'text-purple-300/70' : 'text-slate-300')}>
              <Icon className="w-5 h-5 flex-shrink-0" /> <span className="truncate">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto pt-4 border-t border-white/10">
        <button onClick={handleLogout} className="w-full flex items-center gap-3 text-slate-400 hover:text-red-400 p-3 rounded-xl transition-all hover:bg-red-500/10">
          <LogOut className="w-5 h-5" /> Logout
        </button>
      </div>
    </aside>
  );
}

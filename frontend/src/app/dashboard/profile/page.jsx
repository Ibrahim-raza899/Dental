'use client';
import { useState, useEffect } from 'react';
import { User, Save } from 'lucide-react';
import api from '@/lib/api';

export default function EditProfilePage() {
  const [name, setName] = useState('');
  const [university, setUniversity] = useState('');
  const [department, setDepartment] = useState('');
  const [semester, setSemester] = useState('');
  const [studentId, setStudentId] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/auth/me');
        setName(res.data.name || '');
        setUniversity(res.data.profile?.university || '');
        setDepartment(res.data.profile?.department || '');
        setSemester(res.data.profile?.semester || '');
        setStudentId(res.data.profile?.studentId || '');
      } catch (err) {
        console.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    try {
      await api.put('/auth/profile', {
        name,
        profile: { university, department, semester: Number(semester), studentId }
      });
      setMessage('Profile updated successfully!');
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-10 text-center text-slate-400">Loading profile...</div>;

  return (
    <div className="animate-in fade-in duration-500 max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
        <User className="text-blue-400" /> Edit Profile
      </h1>

      {message && (
        <div className={`p-3 rounded-lg mb-6 text-sm ${message.includes('success') ? 'bg-green-500/20 border border-green-500 text-green-300' : 'bg-red-500/20 border border-red-500 text-red-300'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSave} className="glass-panel p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="text-sm text-slate-300 block mb-1">Full Name</label>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-1">Student ID</label>
            <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-1">University</label>
            <input type="text" value={university} onChange={(e) => setUniversity(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-1">Department</label>
            <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
          </div>
          <div>
            <label className="text-sm text-slate-300 block mb-1">Semester</label>
            <input type="number" value={semester} onChange={(e) => setSemester(e.target.value)} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:outline-none focus:border-accent" />
          </div>
        </div>

        <button type="submit" disabled={saving} className="primary-btn flex items-center gap-2">
          <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}

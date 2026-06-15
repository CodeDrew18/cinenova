'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Mail, Lock, User, UserPlus, Eye, EyeOff } from 'lucide-react';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setMessage("Passwords do not match");
      return;
    }

    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username,
        }
      }
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Account created! Please check your email for confirmation.');
      setTimeout(() => router.push('/login'), 3000);
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-950 pt-20 pb-10">
      <div className="bg-neutral-900 p-10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.7)] border border-white/10 max-w-md w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-5xl font-black tracking-tighter text-white uppercase italic">
            CINE<span className="text-red-600">NOVA</span>
          </h1>
          <p className="text-neutral-400 text-sm font-medium uppercase tracking-widest italic">Join the Experience</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-5">
          <div className="space-y-4">
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
            </div>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type="email"
                placeholder="Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-4 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500 group-focus-within:text-red-600 transition-colors" size={20} />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-neutral-800/50 border border-white/5 rounded-xl py-4 pl-12 pr-12 text-white placeholder-neutral-600 focus:outline-none focus:border-red-600/50 focus:ring-4 focus:ring-red-600/10 transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-white transition-colors"
              >
                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-red-600 text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:bg-red-700 transition-all transform active:scale-95 flex items-center justify-center gap-3 shadow-lg shadow-red-600/20"
            disabled={loading}
          >
            {loading ? 'Creating...' : <><UserPlus size={18} /> Sign Up</>}
          </button>
        </form>

        {message && (
          <div className={`p-4 rounded-xl text-center text-xs font-bold uppercase tracking-tight ${message.includes('created') ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
            {message}
          </div>
        )}

        <div className="text-center pt-2">
          <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest italic">
            Already have an account? <Link href="/login" className="text-white hover:text-red-600 transition-colors ml-1 underline decoration-red-600/30 underline-offset-4">Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
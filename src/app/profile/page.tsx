'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (!session) {
        router.push('/login?next=/profile');
        return;
      }

      const currentUser = session.user;
      if (mounted) {
        setUser(currentUser);
        setUsername(currentUser.user_metadata?.username || currentUser.email || '');
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  const handleUpdate = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const { error } = await supabase.auth.updateUser({ data: { username } });
      if (error) {
        setMessage(error.message || 'Update failed');
      } else {
        setMessage('Profile updated');
      }
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : 'Update error');
    }

    setLoading(false);
  };

  if (!user) return null;

  return (
    <div className="min-h-screen pt-24 px-6 md:px-24 bg-white dark:bg-neutral-950 text-neutral-900 dark:text-white">
      <div className="max-w-3xl mx-auto bg-neutral-100 dark:bg-neutral-900 p-8 rounded-xl">
        <h1 className="text-3xl font-black mb-4">Profile</h1>
        <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">Manage your account details.</p>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase">Email</label>
            <div className="mt-1 text-sm">{user.email}</div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase">Username</label>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              className="w-full mt-1 p-3 rounded bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800"
            />
          </div>

          <div>
            <button type="submit" disabled={loading} className="bg-red-600 text-white px-6 py-3 rounded font-black">
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>

        {message && <div className="mt-4 text-sm font-bold">{message}</div>}
      </div>
    </div>
  );
}

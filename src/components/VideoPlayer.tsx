'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { X, Play } from 'lucide-react';

interface VideoPlayerProps {
  videoKey?: string;
  videoUrl?: string;
}

function getYouTubeEmbedFromUrl(url: string) {
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.hostname.includes('youtube.com')) {
      const videoId = parsedUrl.searchParams.get('v');
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`;
      if (parsedUrl.pathname.includes('/embed/')) return url;
    }

    if (parsedUrl.hostname.includes('youtu.be')) {
      const videoId = parsedUrl.pathname.replace(/^\//, '');
      if (videoId) return `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&rel=0&modestbranding=1`;
    }
  } catch {
    return null;
  }

  return null;
}

export default function VideoPlayer({ videoKey, videoUrl }: VideoPlayerProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!videoKey && !videoUrl) return null;

  const isDirectVideo = videoUrl ? /\.(mp4|webm|ogg)(\?.*)?$/i.test(videoUrl) : false;
  const youTubeEmbed = videoUrl ? getYouTubeEmbedFromUrl(videoUrl) : null;

  const openPlayer = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (!session) {
        const next = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/';
        router.push(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      setOpen(true);
    } catch {
      setOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={openPlayer}
        className="bg-red-600 text-white px-10 py-5 rounded-full font-black uppercase tracking-[0.2em] text-[10px] hover:bg-red-700 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 shadow-2xl shadow-red-600/30"
      >
        <Play size={16} /> Start Watching
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="relative w-full max-w-5xl aspect-video bg-black">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-3 right-3 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white"
              aria-label="Close player"
            >
              <X size={20} />
            </button>

            {videoUrl ? (
              isDirectVideo ? (
                <video src={videoUrl} controls autoPlay className="w-full h-full bg-black" />
              ) : youTubeEmbed ? (
                <iframe
                  src={youTubeEmbed}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title="Video Player"
                />
              ) : (
                <iframe
                  src={videoUrl}
                  className="w-full h-full"
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  title="Video Player"
                />
              )
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoKey}?autoplay=1&controls=1&rel=0&modestbranding=1`}
                className="w-full h-full"
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                title="Trailer Player"
              />
            )}
          </div>
        </div>
      )}
    </>
  );
}

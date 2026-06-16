import Image from 'next/image';
import { tmdbService } from '@/lib/tmdb';
import { getImageUrl, buildVidKingEmbedUrl } from '@/lib/media';
import VideoPlayer from '@/components/VideoPlayer';
import MediaRow from '@/components/MediaRow';
import ContentHero from '@/components/ContentHero';

import {
  EpisodeDetails,
  MediaDetails,
  MediaItem,
  MediaType,
  SeasonDetails,
  SeasonSummary,
  TMDBResponse,
  VideoItem,
} from '@/types/tmdb';

interface ContentPageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const emptyResponse = (): TMDBResponse<MediaItem> => ({
  page: 1,
  results: [],
  total_pages: 1,
  total_results: 0,
});

const firstParam = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);

const decodeQueryValue = (value: string | undefined) => {
  if (!value) return undefined;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export default async function ContentPage({ searchParams }: ContentPageProps) {
  const params = await searchParams;
  const id = firstParam(params.id);
  const requestedType = firstParam(params.type);
  const contentType: MediaType = requestedType === 'tv' ? 'tv' : 'movie';
  const streamUrl = decodeQueryValue(firstParam(params.streamUrl));
  const seasonNumber = firstParam(params.season);
  const episodeNumber = firstParam(params.episode);
  const parsedSeasonNumber = seasonNumber ? Number(seasonNumber) : undefined;
  const parsedEpisodeNumber = episodeNumber ? Number(episodeNumber) : undefined;

  if (!id) {
    return (
      <div className="pt-32 px-12 text-center h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Content Not Found</h1>
        <p className="text-neutral-500 mt-4 uppercase tracking-[0.4em] text-[10px]">Invalid or missing content identifier</p>
      </div>
    );
  }

  let details: MediaDetails | null = null;

  try {
    details = await tmdbService.getDetails(contentType, id);
  } catch (error) {
    console.error('[ContentPage] TMDB fetch error:', error);
    return (
      <div className="pt-32 px-12 text-center h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Content Not Found</h1>
        <p className="text-neutral-500 mt-4 uppercase tracking-[0.4em] text-[10px]">Unable to load content details</p>
      </div>
    );
  }

  if (!details) {
    return (
      <div className="pt-32 px-12 text-center h-screen flex flex-col items-center justify-center bg-white dark:bg-neutral-950">
        <h1 className="text-4xl font-black italic uppercase tracking-tighter">Content Not Found</h1>
        <p className="text-neutral-500 mt-4 uppercase tracking-[0.4em] text-[10px]">Invalid or missing content</p>
      </div>
    );
  }

  let defaultSeasonToLoad: number | undefined;

  const recommendations = details.recommendations?.results ?? [];
  const currentIdStr = String(details.id || id);

  let moviesRelated: MediaItem[] = [];
  let tvRelated: MediaItem[] = [];
  let animeRelated: MediaItem[] = [];
  let genreItems: MediaItem[] = [];

  try {
    const genreIds = (details.genres ?? [])
      .slice(0, 2)
      .map((genre) => genre.id)
      .filter((genreId): genreId is number => Number.isFinite(genreId) && genreId > 0);
    const genreParam = genreIds.join(',');

    const [moviesRes, tvRes, animeRes] = await Promise.all([
      genreParam
        ? tmdbService.discover('movie', { with_genres: genreParam, sort_by: 'popularity.desc' })
        : Promise.resolve(emptyResponse()),
      genreParam
        ? tmdbService.discover('tv', { with_genres: genreParam, sort_by: 'popularity.desc' })
        : Promise.resolve(emptyResponse()),
      genreParam
        ? tmdbService.discover('tv', {
            with_genres: `${genreParam},16`,
            with_original_language: 'ja',
            sort_by: 'popularity.desc',
          })
        : tmdbService.getAnime(),
    ]);

    moviesRelated = (moviesRes.results || []).filter((item) => String(item.id) !== currentIdStr);
    tvRelated = (tvRes.results || []).filter((item) => String(item.id) !== currentIdStr);
    animeRelated = (animeRes.results || []).filter((item) => String(item.id) !== currentIdStr);

    if (genreIds.length) {
      const byGenre = await tmdbService.getByGenre(contentType, String(genreIds[0]));
      genreItems = (byGenre.results || []).filter((item) => String(item.id) !== currentIdStr);
    }
  } catch (error) {
    console.error('[ContentPage] Related lists fetch error:', error);
  }

  let seasonsSummary: SeasonSummary[] = [];
  let seasonDetails: SeasonDetails | null = null;
  let episodeDetails: EpisodeDetails | null = null;

  if (contentType === 'tv' && details.number_of_seasons) {
    try {
      seasonsSummary = (details.seasons ?? []).map((season) => ({
        season_number: season.season_number,
        name: season.name,
        episode_count: season.episode_count,
        poster_path: season.poster_path ?? null,
      }));

      const seasonNumbers = (details.seasons ?? [])
        .map((season) => Number(season.season_number))
        .filter((value) => !Number.isNaN(value));

      if (parsedSeasonNumber) {
        defaultSeasonToLoad = parsedSeasonNumber;
      } else if (seasonNumbers.length) {
        const positiveSeasons = seasonNumbers.filter((value) => value > 0);
        defaultSeasonToLoad = positiveSeasons.length ? Math.max(...positiveSeasons) : seasonNumbers[0];
      }

      if (defaultSeasonToLoad) {
        try {
          seasonDetails = await tmdbService.getSeasonDetails(String(id), defaultSeasonToLoad);
        } catch (error) {
          console.error('[ContentPage] Failed to fetch season details:', error);
        }
      }

      if (seasonDetails && parsedEpisodeNumber) {
        try {
          episodeDetails = await tmdbService.getEpisodeDetails(
            String(id),
            seasonDetails.season_number,
            parsedEpisodeNumber
          );
        } catch (error) {
          console.error('[ContentPage] Failed to fetch episode details:', error);
        }
      }
    } catch (error) {
      console.error('[ContentPage] Seasons parse error:', error);
    }
  }

  const trailer = (details.videos?.results ?? []).find(
    (video: VideoItem) => (video.type === 'Trailer' || video.type === 'Teaser') && video.site === 'YouTube'
  );

  const seasonEpisodes = seasonDetails?.episodes ?? [];
  const playbackSeasonNumber =
    contentType === 'tv' ? seasonDetails?.season_number ?? parsedSeasonNumber ?? defaultSeasonToLoad : undefined;
  const playbackEpisodeNumber =
    contentType === 'tv'
      ? episodeDetails?.episode_number ?? parsedEpisodeNumber ?? seasonEpisodes[0]?.episode_number
      : undefined;
  const heroVideoUrl =
    streamUrl ??
    (contentType === 'tv'
      ? buildVidKingEmbedUrl('tv', id, {
          season: playbackSeasonNumber,
          episode: playbackEpisodeNumber,
          autoPlay: true,
          nextEpisode: true,
          episodeSelector: true,
          progress: true,
        })
      : buildVidKingEmbedUrl('movie', id, {
          autoPlay: true,
          progress: true,
        }));

  const buildEpisodeUrl = (season: number, episode: number) =>
    streamUrl ??
    buildVidKingEmbedUrl('tv', id, {
      season,
      episode,
      autoPlay: true,
      nextEpisode: true,
      episodeSelector: true,
      progress: true,
    });

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950 transition-colors duration-500 overflow-x-hidden">
      <ContentHero 
        details={details} 
        trailer={trailer} 
        contentType={contentType} 
        heroVideoUrl={heroVideoUrl} 
      />

      <div className="px-4 md:px-16 py-12">
        {/* {contentType === 'tv' && seasonDetails && seasonEpisodes.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-black mb-4 text-neutral-950 dark:text-white uppercase tracking-[0.3em] px-4 md:px-0 italic">
              Watch - Season {seasonDetails.season_number}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 px-4 md:px-0">
              {seasonEpisodes.slice(0, 8).map((episode) => {
                const episodeProviderUrl = buildEpisodeUrl(seasonDetails.season_number, episode.episode_number);

                return (
                  <div
                    key={`preview-s${seasonDetails.season_number}-e${episode.episode_number}`}
                    className="bg-neutral-100 dark:bg-neutral-900 p-3 rounded-lg flex gap-3"
                  >
                    <div className="relative w-36 h-20 flex-shrink-0 overflow-hidden rounded">
                      {episode.still_path ? (
                        <Image src={getImageUrl(episode.still_path)} alt={episode.name} fill className="object-cover" />
                      ) : (
                        <div className="bg-neutral-200 dark:bg-neutral-800 w-full h-full" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-sm">
                        E{episode.episode_number} - {episode.name}
                      </div>
                      <p className="text-xs text-neutral-500 line-clamp-2 mt-1">{episode.overview}</p>
                      <div className="mt-2 flex items-center gap-2">
                        <VideoPlayer videoUrl={episodeProviderUrl} />
                        <a
                          href={`?id=${id}&type=${contentType}&season=${seasonDetails.season_number}&episode=${episode.episode_number}`}
                          className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors ml-1"
                        >
                          Details
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )} */}

         {seasonsSummary.length > 0 && (
          <section className="mt-8">
            <h2 className="text-xl font-black mb-6 text-neutral-950 dark:text-white uppercase tracking-[0.3em] px-4 md:px-12 italic">
              Seasons
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 px-4 md:px-12">
              {seasonsSummary.map((season) => (
                <div key={season.season_number} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                  <div className="relative aspect-[2/3] rounded overflow-hidden mb-3">
                    <Image src={getImageUrl(season.poster_path)} alt={season.name} fill className="object-cover" />
                  </div>
                  <div className="font-bold">{season.name}</div>
                  <div className="text-sm text-neutral-500">{season.episode_count} episodes</div>
                  <a
                    href={`?id=${id}&type=${contentType}&season=${season.season_number}`}
                    className="inline-block mt-3 bg-red-600 text-white px-3 py-2 rounded-full text-sm"
                  >
                    View Episodes
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        {seasonDetails && (
          <section className="mt-8">
            <h2 className="text-xl font-black mb-6 text-neutral-950 dark:text-white uppercase tracking-[0.3em] px-4 md:px-12 italic">
              Episodes - Season {seasonDetails.season_number}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-4 md:px-12">
              {seasonEpisodes.map((episode) => {
                return (
                  <div key={`s${seasonDetails.season_number}-e${episode.episode_number}`} className="bg-neutral-100 dark:bg-neutral-900 p-4 rounded-lg">
                    <div className="relative aspect-video rounded overflow-hidden mb-3">
                      {episode.still_path ? (
                        <Image src={getImageUrl(episode.still_path)} alt={episode.name} fill className="object-cover" />
                      ) : (
                        <div className="bg-neutral-200 dark:bg-neutral-800 w-full h-full" />
                      )}
                    </div>
                    <div className="font-bold">
                      Episode {episode.episode_number}: {episode.name}
                    </div>
                    <p className="text-sm text-neutral-500 line-clamp-3 mt-2">{episode.overview}</p>
                    <div className="flex gap-3 mt-4 items-center">
                      <VideoPlayer videoUrl={buildEpisodeUrl(seasonDetails.season_number, episode.episode_number)} />
                      <a
                        href={`?id=${id}&type=${contentType}&season=${seasonDetails.season_number}&episode=${episode.episode_number}`}
                        className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500 hover:text-neutral-950 dark:hover:text-white transition-all"
                      >
                        Details
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {episodeDetails && (
          <section className="mt-8 px-4 md:px-12">
            <div className="grid md:grid-cols-3 gap-6">
              <div className="relative aspect-[2/3] rounded overflow-hidden">
                {episodeDetails.still_path ? (
                  <Image src={getImageUrl(episodeDetails.still_path)} alt={episodeDetails.name} fill className="object-cover" />
                ) : (
                  <div className="bg-neutral-200 dark:bg-neutral-800 w-full h-full" />
                )}
              </div>
              <div className="md:col-span-2">
                <h3 className="text-2xl font-black">
                  Episode {episodeDetails.episode_number}: {episodeDetails.name}
                </h3>
                <p className="text-sm text-neutral-500 mt-2">
                  {episodeDetails.air_date} {episodeDetails.runtime ? `- ${episodeDetails.runtime} min` : ''}
                </p>
                <p className="mt-4 text-neutral-700 dark:text-neutral-300">{episodeDetails.overview}</p>
                {(() => {
                  const episodeProviderUrl = buildEpisodeUrl(
                    seasonDetails?.season_number ?? playbackSeasonNumber ?? 1,
                    episodeDetails.episode_number
                  );
                  return <VideoPlayer videoUrl={episodeProviderUrl} />;
                })()}
              </div>
            </div>
          </section>
        )}

        {recommendations.length > 0 && <MediaRow title="More Like This" items={recommendations} type={contentType} />}

        {genreItems.length > 0 && <MediaRow title="From This Genre" items={genreItems} type={contentType} />}

        {moviesRelated.length > 0 && <MediaRow title="Related Movies" items={moviesRelated} type="movie" />}

        {tvRelated.length > 0 && <MediaRow title="Related TV Shows" items={tvRelated} type="tv" />}

        {animeRelated.length > 0 && <MediaRow title="Related Anime" items={animeRelated} type="tv" />}

       
      </div>
    </div>
  );
}

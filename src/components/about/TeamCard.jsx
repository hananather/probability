import Image from 'next/image';
import { Mail, Globe, ArrowUpRight } from 'lucide-react';

export default function TeamCard({ name, email, website, bio, image }) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const siteDomain = (() => {
    if (!website) return null;
    try {
      const u = new URL(website);
      return u.hostname.replace(/^www\./, '');
    } catch {
      return website.replace(/^https?:\/\//, '').replace(/^www\./, '');
    }
  })();

  return (
    <div className="group relative bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 transition-all duration-300 hover:border-neutral-700 hover:-translate-y-1">
      <div className="relative flex flex-col items-center text-center">
        <div className="relative mb-5">
          <div className="size-28 rounded-full ring-2 ring-neutral-700/60 ring-offset-4 ring-offset-neutral-900 overflow-hidden shadow-lg">
            {image ? (
              <Image
                src={image}
                alt={`${name} headshot`}
                width={112}
                height={112}
                className="size-28 object-cover"
              />
            ) : (
              <div className="size-28 flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-800 text-neutral-200 text-2xl font-semibold">
                {initials}
              </div>
            )}
          </div>
        </div>

        <h3 className="text-lg font-semibold text-white">{name}</h3>
        {website ? (
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
          >
            <Globe className="h-4 w-4 text-teal-400" />
            <span>{siteDomain}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-neutral-400" />
          </a>
        ) : (
          email && (
            <a
              href={`mailto:${email}`}
              className="mt-1 inline-flex items-center gap-2 text-sm text-neutral-300 hover:text-white transition-colors"
            >
              <Mail className="h-4 w-4 text-teal-400" />
              <span>{email}</span>
            </a>
          )
        )}

        {bio && (
          <p className="mt-4 text-sm leading-relaxed text-neutral-300">
            {bio}
          </p>
        )}
      </div>
    </div>
  );
}

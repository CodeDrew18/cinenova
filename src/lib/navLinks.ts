export type NavLink = {
  name: string;
  href: string;
};

export const navLinks: NavLink[] = [
  { name: 'Home', href: '/' },
  { name: 'Discover', href: '/discovers' },
  { name: 'Movies', href: '/movies' },
  { name: 'TV Shows', href: '/tv' },
  { name: 'Anime', href: '/anime' },
];

export default navLinks;

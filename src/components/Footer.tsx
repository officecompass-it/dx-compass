import { SnsIcons } from './SnsIcons';
import { getProfile } from '@/lib/microcms';

export const Footer = async () => {
  const profile = await getProfile();
  
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <SnsIcons 
          xUrl={profile.x_url} 
          youtubeUrl={profile.youtube_url}
          className="mb-6" 
        />
        <p className="text-sm">
          &copy; {new Date().getFullYear()} DXの羅針盤. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
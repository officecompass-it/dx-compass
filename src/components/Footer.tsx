import { SnsIcons } from './SnsIcons';

export const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-8">
      <div className="container mx-auto text-center">
        <SnsIcons className="mb-6" useDefaults={true} />
        <p className="text-sm">
          &copy; {new Date().getFullYear()} DXの羅針盤. All rights reserved.
        </p>
      </div>
    </footer>
  );
};
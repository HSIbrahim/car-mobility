import React from 'react';
import Link from 'next/link';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="w-full bg-primary-dark text-white py-8 mt-12">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Kolumn 1: Om Oss */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-bold mb-4 text-primary-light">Om Oss</h3>
          <p className="text-sm leading-relaxed mb-4 text-gray-300">
            Car Mobility är din partner för flexibel biluthyrning. Vi kopplar samman dig med pålitliga ägare och ger dig friheten att hyra eller hyra ut bilar på dina villkor.
          </p>
          <Link href="/about" className="text-secondary-dark-text hover:text-primary-light transition duration-300">
            Läs mer &rarr;
          </Link>
        </div>

        {/* Kolumn 2: Snabbnavigering */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-bold mb-4 text-primary-light">Snabbnavigering</h3>
          <ul className="space-y-2">
            <li>
              <Link href="/" className="hover:text-secondary-dark-text transition duration-300">
                Hem
              </Link>
            </li>
            <li>
              <Link href="/cars" className="hover:text-secondary-dark-text transition duration-300">
                Alla Bilar
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-secondary-dark-text transition duration-300">
                Kontakta Oss
              </Link>
            </li>
            <li>
                <Link href="/account/profile" className="hover:text-secondary-dark-text transition duration-300">
                    Min Profil
                </Link>
            </li>
          </ul>
        </div>

        {/* Kolumn 3: Kontakt & Sociala Medier */}
        <div className="flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-bold mb-4 text-primary-light">Kontakta Oss</h3>
          <p className="text-sm mb-2 text-gray-300">Email: support@carmobility.com</p>
          <p className="text-sm mb-4 text-gray-300">Telefon: +46 70 123 45 67</p>
          <div className="flex space-x-4">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-2xl transition duration-300">
              <FaFacebook />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-2xl transition duration-300">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-2xl transition duration-300">
              <FaInstagram />
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} Car Mobility. Alla rättigheter förbehållna.</p>
        <p>
          <Link href="/privacy" className="hover:underline mx-2">Integritetspolicy</Link>|
          <Link href="/terms" className="hover:underline mx-2">Användarvillkor</Link>
        </p>
      </div>
    </footer>
  );
};

export default Footer;
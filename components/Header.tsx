import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useState, useEffect } from 'react'; // <--- Lade till useState och useEffect här

const Header = () => {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  const [darkMode, setDarkMode] = useState<boolean>(false); // State för dark mode

  useEffect(() => {
    // Ladda preferens från localStorage vid start
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark') {
      setDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      setDarkMode(false);
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (darkMode) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const navItemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <motion.header
      className="bg-primary-dark text-white p-4 shadow-md flex justify-between items-center z-50 sticky top-0"
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="logo text-3xl font-extrabold text-primary-light tracking-wide">
        <Link href="/">Car Mobility</Link>
      </div>
      <nav className="flex items-center space-x-6">
        <ul className="flex space-x-6 items-center">
          <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.1 }}>
            <Link href="/" className="hover:text-secondary-dark-text transition duration-300 text-lg">Hem</Link>
          </motion.li>
          <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
            <Link href="/cars" className="hover:text-secondary-dark-text transition duration-300 text-lg">Bilar</Link>
          </motion.li>
          <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.3 }}>
            <Link href="/contact" className="hover:text-secondary-dark-text transition duration-300 text-lg">Kontakt</Link>
          </motion.li>

          {!isAuthenticated ? (
            <>
              <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                <Link href="/auth/login" className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition duration-300 text-lg">Logga In</Link>
              </motion.li>
              <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                <Link href="/auth/register" className="border border-primary-light text-primary-light hover:bg-primary-light hover:text-primary-dark font-bold py-2 px-4 rounded-full transition duration-300 text-lg">Registrera</Link>
              </motion.li>
            </>
          ) : (
            <>
              {user && (
                <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.4 }}>
                  <Link href="/account/profile" className="text-gray-300 hover:text-secondary-dark-text transition duration-300 text-lg">
                    Välkommen, {user.name || 'Användare'}!
                  </Link>
                </motion.li>
              )}
              {user?.is_admin && (
                <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.5 }}>
                    <Link href="/admin/dashboard" className="hover:text-secondary-dark-text transition duration-300 text-lg">Admin</Link>
                </motion.li>
              )}
              {user?.user_type === 'company' && (
                <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.6 }}>
                    <Link href="/company/dashboard" className="hover:text-secondary-dark-text transition duration-300 text-lg">Företag</Link>
                </motion.li>
              )}
              <motion.li variants={navItemVariants} initial="hidden" animate="visible" transition={{ delay: 0.7 }}>
                <button onClick={handleLogout} className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded-full transition duration-300 text-lg">Logga Ut</button>
              </motion.li>
            </>
          )}
        </ul>
        <button onClick={toggleDarkMode} className="p-2 rounded-full hover:bg-gray-700 transition-colors duration-300 focus:outline-none">
          {darkMode ? <FaSun className="text-yellow-400 text-xl" /> : <FaMoon className="text-gray-300 text-xl" />}
        </button>
      </nav>
    </motion.header>
  );
};

export default Header;
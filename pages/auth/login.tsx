import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RingLoader } from 'react-spinners'; // Importera RingLoader

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ett oväntat fel uppstod vid inloggning.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />
      <motion.div
        className="form-container bg-white dark:bg-darkerBackground"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-primary-dark dark:text-primary-light">Logga In</h2>
        {error && <p className="error-message">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email:</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
              placeholder="din.email@example.com"
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="text-gray-700 dark:text-gray-300">Lösenord:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
              placeholder="********"
            />
          </div>
          <button type="submit" className="form-button bg-primary hover:bg-primary-dark" disabled={loading}>
            {loading ? <RingLoader color={"#fff"} loading={loading} size={20} /> : 'Logga in'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
          Inget konto än?{' '}
          <Link href="/auth/register" className="text-primary hover:underline font-bold dark:text-primary-light">
            Registrera dig här
          </Link>
        </p>
      </motion.div>
      <Footer />
    </>
  );
};

export default LoginPage;
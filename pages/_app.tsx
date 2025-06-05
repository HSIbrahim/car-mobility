// _app.tsx
import type { AppProps } from 'next/app';
import { Poppins } from 'next/font/google';

import '../styles/main.scss'; // <--- Ändrad från globals.scss till main.scss
import '../styles/globals.css'; // Tailwind CSS och globala CSS-variabler
import '../styles/components/_carCard.scss'; // Specifik SCSS för bilkort
import '../styles/components/_formStyles.scss'; // Formulärstilar
import { AuthProvider } from '../context/AuthContext';

const poppins = Poppins({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin'],
  variable: '--font-poppins',
});

function MyApp({ Component, pageProps }: AppProps) {
    return (
        <AuthProvider>
            <div className={`${poppins.variable} font-sans`}>
                <Component {...pageProps} />
            </div>
        </AuthProvider>
    );
}

export default MyApp;
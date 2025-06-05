import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { FaLock } from 'react-icons/fa'; // Ikon

const UnauthorizedPage = () => {
    return (
        <>
            <Header />
            <motion.div
                className="flex flex-col items-center justify-center min-h-[70vh] text-center px-4 bg-background-light dark:bg-background-dark"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <FaLock className="text-primary text-6xl mb-6 dark:text-primary-light" />
                <h1 className="text-5xl font-bold text-primary-dark dark:text-primary-light mb-4">403 - Åtkomst Nekad</h1>
                <p className="text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-lg">
                    Du har inte behörighet att visa denna sida. Vänligen kontakta administratören om du tror att detta är ett fel.
                </p>
                <Link href="/" className="form-button bg-primary hover:bg-primary-dark">
                    Tillbaka till Startsidan
                </Link>
            </motion.div>
            <Footer />
        </>
    );
};

export default UnauthorizedPage;
import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { motion } from 'framer-motion';
import { RingLoader } from 'react-spinners'; // Importera RingLoader

const ContactPage = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('sending');

        try {
            await new Promise(resolve => setTimeout(resolve, 1500));
            console.log('Kontaktformulär skickat:', formData);
            setStatus('success');
            setFormData({ name: '', email: '', subject: '', message: '' });
        } catch (error) {
            console.error('Fel vid skickande av kontaktformulär:', error);
            setStatus('error');
        }
    };

    return (
        <>
            <Header />
            <motion.div
                className="container mx-auto px-4 py-8 max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-center mb-8 text-primary-dark dark:text-primary-light">Kontakta Oss</h1>

                <motion.div
                    className="bg-white dark:bg-darkerBackground shadow-lg rounded-xl p-8 mb-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <p className="text-lg text-gray-700 dark:text-gray-300 mb-6 text-center">
                        Har du frågor, feedback eller behöver hjälp? Fyll i formuläret nedan så återkommer vi så snart som möjligt.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="name" className="form-label text-gray-700 dark:text-gray-300">Ditt Namn:</label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                placeholder="För- och efternamn"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email" className="form-label text-gray-700 dark:text-gray-300">Din Email:</label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                placeholder="din.email@example.com"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="subject" className="form-label text-gray-700 dark:text-gray-300">Ämne:</label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                placeholder="T.ex. Förfrågan om biluthyrning"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="message" className="form-label text-gray-700 dark:text-gray-300">Meddelande:</label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="form-input resize-y bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                placeholder="Skriv ditt meddelande här..."
                            ></textarea>
                        </div>

                        {status === 'success' && (
                            <p className="success-message text-center">Tack för ditt meddelande! Vi återkommer snart.</p>
                        )}
                        {status === 'error' && (
                            <p className="error-message text-center">Ett fel uppstod vid skickandet. Vänligen försök igen.</p>
                        )}

                        <button type="submit" className="form-button bg-primary hover:bg-primary-dark" disabled={status === 'sending'}>
                            {status === 'sending' ? <RingLoader color={"#fff"} loading={true} size={20} /> : 'Skicka Meddelande'}
                        </button>
                    </form>
                </motion.div>

                <div className="text-center mt-10">
                    <h2 className="text-2xl font-bold text-primary-dark dark:text-primary-light mb-4">Direkt Kontakt</h2>
                    <p className="text-gray-700 dark:text-gray-300">
                        Du kan också nå oss direkt via:
                    </p>
                    <p className="text-lg font-semibold text-primary my-2 dark:text-primary-light">Email: support@carmobility.com</p>
                    <p className="text-lg font-semibold text-primary dark:text-primary-light">Telefon: +46 70 123 45 67</p>
                    <p className="text-gray-700 dark:text-gray-300 mt-4">
                        Vår support är tillgänglig Mån-Fre, 09:00 - 17:00.
                    </p>
                </div>
            </motion.div>
            <Footer />
        </>
    );
};

export default ContactPage;
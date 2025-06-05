import { useState } from 'react';
import { useRouter } from 'next/router';
import { registerUser } from '../../utils/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RingLoader } from 'react-spinners'; // Importera RingLoader

const RegisterPage = () => {
    const [userType, setUserType] = useState<'individual' | 'company'>('individual');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone_number: '',
        organization_name: '',
        organization_number: '',
        address: '',
    });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        let dataToSend: { [key: string]: any } = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone_number: formData.phone_number,
            user_type: userType,
        };

        if (userType === 'company') {
            dataToSend.organization_name = formData.organization_name;
            dataToSend.organization_number = formData.organization_number;
            dataToSend.address = formData.address;
        }

        try {
            await registerUser(dataToSend);
            setSuccess('Registrering lyckades! Du kan nu logga in.');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Ett fel uppstod vid registrering.');
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
                <h2 className="text-primary-dark dark:text-primary-light">Registrera Nytt Konto</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label htmlFor="user_type" className="text-gray-700 dark:text-gray-300">Kontotyp:</label>
                        <select
                            id="user_type"
                            name="user_type"
                            value={userType}
                            onChange={(e) => setUserType(e.target.value as 'individual' | 'company')}
                            required
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                        >
                            <option value="individual">Individ</option>
                            <option value="company">Företag</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="name" className="text-gray-700 dark:text-gray-300">Namn:</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            placeholder="Ditt namn"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email:</label>
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
                        <label htmlFor="password" className="text-gray-700 dark:text-gray-300">Lösenord:</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            placeholder="Minst 6 tecken"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="phone_number" className="text-gray-700 dark:text-gray-300">Telefonnummer:</label>
                        <input
                            type="text"
                            id="phone_number"
                            name="phone_number"
                            value={formData.phone_number}
                            onChange={handleChange}
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            placeholder="0701234567"
                        />
                    </div>

                    {userType === 'company' && (
                        <>
                            <div className="form-group">
                                <label htmlFor="organization_name" className="text-gray-700 dark:text-gray-300">Företagsnamn:</label>
                                <input
                                    type="text"
                                    id="organization_name"
                                    name="organization_name"
                                    value={formData.organization_name}
                                    onChange={handleChange}
                                    required
                                    className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                    placeholder="AB Biluthyrning"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="organization_number" className="text-gray-700 dark:text-gray-300">Organisationsnummer:</label>
                                <input
                                    type="text"
                                    id="organization_number"
                                    name="organization_number"
                                    value={formData.organization_number}
                                    onChange={handleChange}
                                    required
                                    className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                    placeholder="556677-8899"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="address" className="text-gray-700 dark:text-gray-300">Adress:</label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    required
                                    className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                    placeholder="Gatan 123, 123 45 Staden"
                                />
                            </div>
                        </>
                    )}

                    <button type="submit" className="form-button bg-primary hover:bg-primary-dark" disabled={loading}>
                        {loading ? <RingLoader color={"#fff"} loading={loading} size={20} /> : 'Registrera'}
                    </button>
                </form>
                <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">
                    Har du redan ett konto?{' '}
                    <Link href="/auth/login" className="text-primary hover:underline font-bold dark:text-primary-light">
                        Logga in här
                    </Link>
                </p>
            </motion.div>
            <Footer />
        </>
    );
};

export default RegisterPage;
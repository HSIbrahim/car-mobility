import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import withAuth from '../../components/withAuth';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { RingLoader } from 'react-spinners';
import { getCurrentRentalsByUserId, getAllBookingsByUserId, Rental, Booking, Car } from '../../utils/api';
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaIdCard, FaCar, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt } from 'react-icons/fa'; // Ikoner

const ProfilePage = () => {
    const { user, isLoading: authLoading } = useAuth();
    const router = useRouter();
    const [currentRentals, setCurrentRentals] = useState<Rental[]>([]);
    const [pastBookings, setPastBookings] = useState<Booking[]>([]);
    const [loadingRentals, setLoadingRentals] = useState(true);
    const [loadingBookings, setLoadingBookings] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && user) {
            const fetchUserRentals = async () => {
                setLoadingRentals(true);
                try {
                    const data = await getCurrentRentalsByUserId(user.id);
                    // Sortera efter startdatum, väntande först, sedan godkända
                    const sortedRentals = [...data].sort((a, b) => {
                        if (a.status === 'pending' && b.status !== 'pending') return -1;
                        if (a.status !== 'pending' && b.status === 'pending') return 1;
                        return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
                    });
                    setCurrentRentals(sortedRentals);
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Kunde inte hämta aktuella hyresorder.');
                } finally {
                    setLoadingRentals(false);
                }
            };

            const fetchUserBookings = async () => {
                setLoadingBookings(true);
                try {
                    const data = await getAllBookingsByUserId(user.id);
                    // Sortera efter startdatum
                    const sortedBookings = [...data].sort((a, b) => 
                        new Date(b.start_date).getTime() - new Date(a.start_date).getTime() // Senaste först
                    );
                    setPastBookings(sortedBookings);
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Kunde inte hämta tidigare bokningar.');
                } finally {
                    setLoadingBookings(false);
                }
            };

            fetchUserRentals();
            fetchUserBookings();
        }
    }, [user, authLoading]);

    if (authLoading || (!user && !error)) {
        return (
            <div className="loading-spinner-container min-h-screen bg-background-dark">
                <RingLoader color={"#512BD4"} loading={true} size={100} />
            </div>
        );
    }

    if (error) {
        return (
            <>
                <Header />
                <p className="error-message">Fel: {error}</p>
                <Footer />
            </>
        );
    }

    if (!user) {
        return (
            <>
                <Header />
                <p className="text-center text-xl mt-10 text-gray-700 dark:text-gray-300">Du måste vara inloggad för att se din profil.</p>
                <Footer />
            </>
        );
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Ej angivet';
        return new Date(dateString).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <>
            <Header />
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-center mb-8 text-primary-dark dark:text-primary-light">Min Profil</h1>

                <motion.div
                    className="bg-white dark:bg-darkerBackground shadow-lg rounded-xl p-8 mb-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Personlig Information</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 dark:text-gray-300">
                        <p className="flex items-center"><FaUser className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Namn:</strong> {user.name}</p>
                        <p className="flex items-center"><FaEnvelope className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Email:</strong> {user.email}</p>
                        <p className="flex items-center"><FaPhone className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Telefonnummer:</strong> {user.phone_number}</p>
                        <p className="flex items-center"><FaUser className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Kontotyp:</strong> {user.user_type === 'company' ? 'Företag' : 'Individ'}</p>
                        {user.user_type === 'company' && user.organization_number && (
                            <p className="flex items-center"><FaBuilding className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Organisationsnummer:</strong> {user.organization_number}</p>
                        )}
                        {user.is_admin && (
                            <p className="flex items-center text-brand-red dark:text-red-400 font-bold col-span-full"><FaIdCard className="mr-2" />Du är administratör!</p>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-darkerBackground shadow-lg rounded-xl p-8 mb-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Aktuella Hyresförfrågningar</h2>
                    {loadingRentals ? (
                        <div className="loading-spinner-container py-10">
                            <RingLoader color={"#512BD4"} loading={true} size={50} />
                        </div>
                    ) : currentRentals.length > 0 ? (
                        <ul className="space-y-4">
                            {currentRentals.map((rental) => (
                                <motion.li
                                    key={rental._id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-deepDarkBackground"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaCar className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Bil:</strong> {(rental.car_id as Car)?.model || 'Okänd bil'}</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Period:</strong> {formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Totalpris:</strong> {rental.total_price} SEK</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><strong className="text-primary-dark dark:text-primary-light">Status:</strong> <span className={`font-semibold ml-2 ${rental.status === 'pending' ? 'text-blue-500' : rental.status === 'approved' ? 'text-green-500' : 'text-brand-red'}`}>{rental.status === 'pending' ? 'Väntande' : rental.status === 'approved' ? 'Godkänd' : rental.status === 'rejected' ? 'Avvisad' : rental.status}</span></p>
                                    {rental.reason && rental.status === 'rejected' && <p className="text-brand-red dark:text-red-400 text-sm mt-1 ml-6">Orsak: {rental.reason}</p>}
                                    <Link href={`/cars/${(rental.car_id as Car)?._id}`} className="text-primary hover:underline mt-2 inline-block dark:text-primary-light">Visa bil</Link>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Inga aktuella hyresförfrågningar.</p>
                    )}
                </motion.div>

                <motion.div
                    className="bg-white dark:bg-darkerBackground shadow-lg rounded-xl p-8"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-4">Tidigare Bokningar</h2>
                    {loadingBookings ? (
                        <div className="loading-spinner-container py-10">
                            <RingLoader color={"#512BD4"} loading={true} size={50} />
                        </div>
                    ) : pastBookings.length > 0 ? (
                        <ul className="space-y-4">
                            {pastBookings.map((booking) => (
                                <motion.li
                                    key={booking._id}
                                    className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-deepDarkBackground"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaCar className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Bil:</strong> {(booking.car_id as Car)?.model || 'Okänd bil'}</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Period:</strong> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Totalpris:</strong> {booking.total_price} SEK</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaMapMarkerAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Upphämtningsadress:</strong> {booking.pickup_address}</p>
                                    <p className="flex items-center text-gray-700 dark:text-gray-300"><FaMapMarkerAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Avlämningsadress:</strong> {booking.dropoff_address}</p>
                                    <Link href={`/cars/${(booking.car_id as Car)?._id}`} className="text-primary hover:underline mt-2 inline-block dark:text-primary-light">Visa bil</Link>
                                </motion.li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-600 dark:text-gray-400">Inga tidigare bokningar.</p>
                    )}
                </motion.div>
            </motion.div>
            <Footer />
        </>
    );
};

export default withAuth(ProfilePage, 'individual');
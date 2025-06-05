import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { getCarById, Car as CarType, getDecodedToken } from '../../utils/api';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import BookingForm from '../../components/BookingForm';
import { motion } from 'framer-motion';
import { RingLoader } from 'react-spinners';
import Link from 'next/link';
import { FaMapMarkerAlt, FaCalendarAlt, FaDollarSign } from 'react-icons/fa'; // Ikoner

const CarDetailsPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [car, setCar] = useState<CarType | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showBookingForm, setShowBookingForm] = useState(false);
    const user = getDecodedToken();

    useEffect(() => {
        if (id) {
            const fetchCar = async () => {
                try {
                    setLoading(true);
                    const data = await getCarById(id as string);
                    setCar(data);
                } catch (err: any) {
                    setError(err.response?.data?.message || 'Kunde inte hämta bildetaljer.');
                } finally {
                    setLoading(false);
                }
            };
            fetchCar();
        }
    }, [id]);

    const handleBookingSuccess = () => {
        setShowBookingForm(false);
        // Här kan du lägga till en notifiering eller omdirigering
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background-dark">
                <RingLoader color={"#512BD4"} loading={loading} size={100} />
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

    if (!car) {
        return (
            <>
                <Header />
                <p className="text-center text-xl mt-10 text-gray-700 dark:text-gray-300">Bil hittades inte.</p>
                <Footer />
            </>
        );
    }

    // Funktion för att formatera datumsträng
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Ej angivet';
        return new Date(dateString).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    return (
        <>
            <Header />
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <div className="bg-white dark:bg-darkerBackground shadow-xl rounded-xl overflow-hidden md:flex flex-col md:flex-row">
                    <div className="md:w-1/2 p-6 flex items-center justify-center bg-gray-100 dark:bg-deepDarkBackground">
                        <motion.img
                            src={car.image_url || '/placeholder-car.jpg'}
                            alt={car.model}
                            className="w-full h-auto object-contain max-h-[450px] rounded-lg shadow-lg"
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        />
                    </div>
                    <div className="md:w-1/2 p-8 flex flex-col justify-between">
                        <div>
                            <h1 className="text-4xl font-bold text-primary-dark dark:text-primary-light mb-4">{car.model}</h1>
                            <p className="text-xl text-gray-700 dark:text-gray-300 mb-4">{car.category}</p>
                            <div className="space-y-3 text-gray-700 dark:text-gray-300">
                                <p className="flex items-center"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Pris per dag:</strong> {car.price_per_day} SEK</p>
                                {car.price_per_week && <p className="flex items-center"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Pris per vecka:</strong> {car.price_per_week} SEK</p>}
                                {car.price_per_month && <p className="flex items-center"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Pris per månad:</strong> {car.price_per_month} SEK</p>}
                                <p className="flex items-center"><FaMapMarkerAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Plats:</strong> {car.location}</p>
                                <p className="flex items-center"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Tillgänglig från:</strong> {formatDate(car.availability?.from)}</p>
                                <p className="flex items-center"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Tillgänglig till:</strong> {formatDate(car.availability?.to)}</p>
                                {car.organization_number && <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">Organisationsnummer: {car.organization_number}</p>}
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col gap-4">
                            {(user?.user_type === 'individual' || user?.is_admin) && user?.organization_number !== car.organization_number && (
                                <motion.button
                                    onClick={() => setShowBookingForm(!showBookingForm)}
                                    className="form-button bg-primary hover:bg-primary-dark text-white"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {showBookingForm ? 'Dölj Bokningsformulär' : 'Boka Denna Bil'}
                                </motion.button>
                            )}
                            {user?.user_type === 'company' && user?.organization_number === car.organization_number && (
                                <div>
                                    <Link href={`/company/dashboard`} className="form-button bg-accent hover:bg-accent-dark text-white">
                                        Hantera Dina Bilar
                                    </Link>
                                </div>
                            )}
                            {/* Om admin är inloggad och det är inte deras egen bil, kan de också boka */}
                            {user?.is_admin && user?.organization_number !== car.organization_number && (
                                <motion.button
                                    onClick={() => setShowBookingForm(!showBookingForm)}
                                    className="form-button bg-primary hover:bg-primary-dark text-white"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {showBookingForm ? 'Dölj Bokningsformulär' : 'Boka Denna Bil (Admin)'}
                                </motion.button>
                            )}
                        </div>
                    </div>
                </div>

                {showBookingForm && car && (
                    <BookingForm carId={car._id} carModel={car.model} onBookingSuccess={handleBookingSuccess} />
                )}
            </motion.div>
            <Footer />
        </>
    );
};

export default CarDetailsPage;
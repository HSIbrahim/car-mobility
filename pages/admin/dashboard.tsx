import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import withAuth from '../../components/withAuth';
import { motion } from 'framer-motion';
import {
    getAllRentals,
    getAllRejectedRentalsAdmin,
    getAllBookingsAdmin,
    approveRental,
    rejectRental,
    getRentalAnalytics,
    Rental,
    Booking,
    Car
} from '../../utils/api';
import { RingLoader } from 'react-spinners';
import Link from 'next/link';
import { FaCheckCircle, FaTimesCircle, FaInfoCircle, FaCar, FaUser, FaCalendarAlt, FaDollarSign, FaMapMarkerAlt, FaChartBar, FaSortAmountUp, FaMoneyBillWave } from 'react-icons/fa';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState<'pending' | 'approved' | 'rejected' | 'analytics'>('pending');
    const [pendingRentals, setPendingRentals] = useState<Rental[]>([]);
    const [rejectedRentals, setRejectedRentals] = useState<Rental[]>([]);
    const [allBookings, setAllBookings] = useState<Booking[]>([]);
    const [analytics, setAnalytics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [reasonInput, setReasonInput] = useState<{ [key: string]: string }>({});
    const [pickupAddressInput, setPickupAddressInput] = useState<{ [key: string]: string }>({});
    const [dropoffAddressInput, setDropoffAddressInput] = useState<{ [key: string]: string }>({});

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [pending, rejected, bookings, stats] = await Promise.all([
                getAllRentals(),
                getAllRejectedRentalsAdmin(),
                getAllBookingsAdmin(),
                getRentalAnalytics(),
            ]);
            setPendingRentals(pending.filter(r => r.status === 'pending'));
            setRejectedRentals(rejected);
            setAllBookings(bookings);
            setAnalytics(stats);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte hämta data för adminpanelen.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApprove = async (rentalId: string) => {
        if (!pickupAddressInput[rentalId] || !dropoffAddressInput[rentalId]) {
            alert('Vänligen fyll i både upphämtnings- och avlämningsadress.');
            return;
        }
        setLoading(true);
        try {
            await approveRental(rentalId, {
                pickup_address: pickupAddressInput[rentalId],
                dropoff_address: dropoffAddressInput[rentalId]
            });
            await fetchData();
            alert('Hyresorder godkänd och flyttad till bokningar!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte godkänna hyresorder.');
        } finally {
            setLoading(false);
        }
    };

    const handleReject = async (rentalId: string) => {
        if (!reasonInput[rentalId]) {
            alert('Vänligen ange en orsak till avvisandet.');
            return;
        }
        setLoading(true);
        try {
            await rejectRental(rentalId, reasonInput[rentalId]);
            await fetchData();
            alert('Hyresorder avvisad!');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte avvisa hyresorder.');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' });
    };

    if (loading) {
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

    return (
        <>
            <Header />
            <motion.div
                className="container mx-auto px-4 py-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
            >
                <h1 className="text-4xl font-bold text-center mb-8 text-primary-dark dark:text-primary-light">Admin Dashboard</h1>

                {/* Tabbar */}
                <div className="dashboard-tabs">
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'pending' ? 'active' : ''}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Väntande ({pendingRentals.length})
                    </button>
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'approved' ? 'active' : ''}`}
                        onClick={() => setActiveTab('approved')}
                    >
                        Bokningar ({allBookings.length})
                    </button>
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'rejected' ? 'active' : ''}`}
                        onClick={() => setActiveTab('rejected')}
                    >
                        Avvisade ({rejectedRentals.length})
                    </button>
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'analytics' ? 'active' : ''}`}
                        onClick={() => setActiveTab('analytics')}
                    >
                        Statistik
                    </button>
                </div>

                {/* Innehåll baserat på aktiv flik */}
                {activeTab === 'pending' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Väntande Hyresorder</h2>
                        {pendingRentals.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Inga väntande hyresorder.</p>
                        ) : (
                            <ul className="space-y-6">
                                {pendingRentals.map((rental) => (
                                    <motion.li
                                        key={rental._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-deepDarkBackground"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaInfoCircle className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Order ID:</strong> {rental._id}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCar className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Bil:</strong> <Link href={`/cars/${(rental.car_id as Car)?._id}`} className="text-primary hover:underline dark:text-primary-light">{(rental.car_id as Car)?.model || 'Okänd bil'}</Link></p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaUser className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Hyrestagare:</strong> {((rental.renter_id as any)?.name || 'Okänd användare')}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Period:</strong> {formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
                                        <p className="mb-4 flex items-center text-gray-700 dark:text-gray-300"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Totalpris:</strong> {rental.total_price} SEK</p>

                                        <div className="flex flex-col md:flex-row md:space-x-4 mb-4">
                                            <div className="form-group flex-1">
                                                <label htmlFor={`pickup-${rental._id}`} className="form-label text-sm text-gray-700 dark:text-gray-300">Upphämtningsadress:</label>
                                                <input
                                                    type="text"
                                                    id={`pickup-${rental._id}`}
                                                    className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                                    placeholder="Ange upphämtningsadress"
                                                    value={pickupAddressInput[rental._id] || ''}
                                                    onChange={(e) => setPickupAddressInput({ ...pickupAddressInput, [rental._id]: e.target.value })}
                                                />
                                            </div>
                                            <div className="form-group flex-1">
                                                <label htmlFor={`dropoff-${rental._id}`} className="form-label text-sm text-gray-700 dark:text-gray-300">Avlämningsadress:</label>
                                                <input
                                                    type="text"
                                                    id={`dropoff-${rental._id}`}
                                                    className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                                    placeholder="Ange avlämningsadress"
                                                    value={dropoffAddressInput[rental._id] || ''}
                                                    onChange={(e) => setDropoffAddressInput({ ...dropoffAddressInput, [rental._id]: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                                            <button
                                                onClick={() => handleApprove(rental._id)}
                                                className="form-button bg-green-600 hover:bg-green-700 w-full md:w-auto" // Standard green
                                            >
                                                <FaCheckCircle className="inline mr-2" /> Godkänn
                                            </button>
                                            <div className="flex-1 flex flex-col md:flex-row md:space-x-2 space-y-2 md:space-y-0">
                                                <input
                                                    type="text"
                                                    className="form-input flex-1 bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                                    placeholder="Orsak för avvisande (valfritt)"
                                                    value={reasonInput[rental._id] || ''}
                                                    onChange={(e) => setReasonInput({ ...reasonInput, [rental._id]: e.target.value })}
                                                />
                                                <button
                                                    onClick={() => handleReject(rental._id)}
                                                    className="form-button bg-brand-red hover:bg-red-700 w-full md:w-auto"
                                                >
                                                    <FaTimesCircle className="inline mr-2" /> Avvisa
                                                </button>
                                            </div>
                                        </div>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}

                {activeTab === 'approved' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Alla Bokningar</h2>
                        {allBookings.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Inga godkända bokningar.</p>
                        ) : (
                            <ul className="space-y-6">
                                {allBookings.map((booking) => (
                                    <motion.li
                                        key={booking._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-deepDarkBackground"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaInfoCircle className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Boknings ID:</strong> {booking._id}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCar className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Bil:</strong> <Link href={`/cars/${(booking.car_id as Car)?._id}`} className="text-primary hover:underline dark:text-primary-light">{(booking.car_id as Car)?.model || 'Okänd bil'}</Link></p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaUser className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Hyrestagare:</strong> {((booking.renter_id as any)?.name || 'Okänd användare')}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Period:</strong> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Totalpris:</strong> {booking.total_price} SEK</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaMapMarkerAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Upphämtningsadress:</strong> {booking.pickup_address}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaMapMarkerAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Avlämningsadress:</strong> {booking.dropoff_address}</p>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}

                {activeTab === 'rejected' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Avvisade Hyresorder</h2>
                        {rejectedRentals.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Inga avvisade hyresorder.</p>
                        ) : (
                            <ul className="space-y-6">
                                {rejectedRentals.map((rental) => (
                                    <motion.li
                                        key={rental._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 bg-gray-50 dark:bg-deepDarkBackground"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaInfoCircle className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Order ID:</strong> {rental._id}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCar className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Bil:</strong> <Link href={`/cars/${(rental.car_id as Car)?._id}`} className="text-primary hover:underline dark:text-primary-light">{(rental.car_id as Car)?.model || 'Okänd bil'}</Link></p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaUser className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Hyrestagare:</strong> {((rental.renter_id as any)?.name || 'Okänd användare')}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaCalendarAlt className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Period:</strong> {formatDate(rental.start_date)} - {formatDate(rental.end_date)}</p>
                                        <p className="mb-2 flex items-center text-gray-700 dark:text-gray-300"><FaDollarSign className="mr-2 text-primary" /><strong className="text-primary-dark dark:text-primary-light">Totalpris:</strong> {rental.total_price} SEK</p>
                                        <p className="mb-2 flex items-center text-brand-red dark:text-red-400"><FaTimesCircle className="inline mr-2" /><strong className="text-primary-dark dark:text-primary-light">Orsak för avvisande:</strong> {rental.reason || 'Ingen orsak angiven'}</p>
                                    </motion.li>
                                ))}
                            </ul>
                        )}
                    </motion.div>
                )}

                {activeTab === 'analytics' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Hyresstatistik</h2>
                        {analytics ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <motion.div
                                    className="p-6 border rounded-xl bg-secondary dark:bg-darkSecondary shadow-md flex items-center justify-between"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light">Totala Hyresorder</h3>
                                        <p className="text-4xl font-bold text-primary dark:text-primary-light mt-2">{analytics.totalRentals}</p>
                                    </div>
                                    <FaSortAmountUp className="text-5xl text-primary-light dark:text-primary" />
                                </motion.div>
                                <motion.div
                                    className="p-6 border rounded-xl bg-secondary dark:bg-darkSecondary shadow-md flex items-center justify-between"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                                >
                                    <div>
                                        <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light">Total Intäkt</h3>
                                        <p className="text-4xl font-bold text-primary dark:text-primary-light mt-2">{analytics.totalRevenue?.toLocaleString('sv-SE')} SEK</p>
                                    </div>
                                    <FaMoneyBillWave className="text-5xl text-primary-light dark:text-primary" />
                                </motion.div>
                                <motion.div
                                    className="p-6 border rounded-xl bg-secondary dark:bg-darkSecondary shadow-md col-span-full"
                                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                                >
                                    <h3 className="text-lg font-semibold text-primary-dark dark:text-primary-light mb-4 flex items-center"><FaChartBar className="mr-2" />Mest Uthyrda Bilar</h3>
                                    {analytics.mostRentedCars.length > 0 ? (
                                        <ul className="list-disc pl-5 space-y-2 text-gray-700 dark:text-gray-300">
                                            {analytics.mostRentedCars.map((car: any) => (
                                                <li key={car._id}>
                                                    Bil ID: {car._id} - Uthyrd <span className="font-bold text-primary-dark dark:text-primary-light">{car.count}</span> gånger
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-600 dark:text-gray-400">Ingen data för mest uthyrda bilar.</p>
                                    )}
                                </motion.div>
                            </div>
                        ) : (
                            <p className="text-gray-600 dark:text-gray-400">Ingen statistik tillgänglig.</p>
                        )}
                    </motion.div>
                )}
            </motion.div>
            <Footer />
        </>
    );
};

export default withAuth(AdminDashboard, 'admin');
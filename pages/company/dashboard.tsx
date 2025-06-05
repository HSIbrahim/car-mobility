import React, { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import withAuth from '../../components/withAuth';
import { motion } from 'framer-motion';
import {
    getAllCarsByOrganizationNumber,
    createCar,
    updateCar,
    deleteCar,
    Car as CarType
} from '../../utils/api';
import { RingLoader } from 'react-spinners';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import { FaPlusCircle, FaEdit, FaTrash, FaCar, FaMapMarkerAlt, FaDollarSign, FaImage, FaTag, FaCalendarAlt } from 'react-icons/fa';

type DeepPartial<T> = T extends object ? {
    [P in keyof T]?: DeepPartial<T[P]>;
} : T;


const CompanyDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'my-cars' | 'add-car' | 'my-rentals'>('my-cars');
    const [myCars, setMyCars] = useState<CarType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    interface CarFormState {
        model: string;
        price_per_day: number;
        price_per_week?: number;
        price_per_month?: number;
        availability?: { from?: Date; to?: Date; };
        location: string;
        image_url?: string;
        category?: string;
    }

    const [carFormData, setCarFormData] = useState<CarFormState>({
        model: '',
        price_per_day: 0,
        location: '',
        image_url: '',
        category: '',
        price_per_week: undefined,
        price_per_month: undefined,
        availability: {
            from: new Date(),
            to: new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        },
    });
    const [isEditing, setIsEditing] = useState(false);
    const [currentCarId, setCurrentCarId] = useState<string | null>(null);

    const fetchCompanyCars = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getAllCarsByOrganizationNumber();
            setMyCars(data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte hämta dina bilar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.user_type === 'company' || user?.is_admin) {
            fetchCompanyCars();
        }
    }, [user]);

    const handleCarFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        if (name === 'price_per_day' || name === 'price_per_week' || name === 'price_per_month') {
            setCarFormData((prev) => ({ ...prev, [name]: value === '' ? undefined : parseFloat(value) }));
        } else {
            setCarFormData((prev) => ({ ...prev, [name]: value }));
        }
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const dateValue = value ? new Date(value) : undefined;

        setCarFormData((prev) => ({
            ...prev,
            availability: {
                ...(prev.availability || {}),
                [name]: dateValue,
            },
        }));
    };

    const handleCarSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccessMessage(null);

        const submissionCarData: CarType = {
            _id: currentCarId || '',
            organization_number: user?.organization_number || '',
            model: carFormData.model,
            price_per_day: carFormData.price_per_day,
            location: carFormData.location,
            image_url: carFormData.image_url || '',
            category: carFormData.category || '',
            price_per_week: carFormData.price_per_week,
            price_per_month: carFormData.price_per_month,
            availability: carFormData.availability?.from && carFormData.availability?.to
                          ? {
                              from: carFormData.availability.from.toISOString(),
                              to: carFormData.availability.to.toISOString()
                            }
                          : undefined,
            unavailable: [],
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };

        try {
            if (isEditing && currentCarId) {
                await updateCar(currentCarId, submissionCarData);
                setSuccessMessage('Bil uppdaterad framgångsrikt!');
            } else {
                await createCar(submissionCarData);
                setSuccessMessage('Bil skapad framgångsrikt!');
            }
            setCarFormData({
                model: '',
                price_per_day: 0,
                location: '',
                image_url: '',
                category: '',
                price_per_week: undefined,
                price_per_month: undefined,
                availability: { from: new Date(), to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
            });
            setIsEditing(false);
            setCurrentCarId(null);
            await fetchCompanyCars();
            setActiveTab('my-cars');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte hantera bil.');
        } finally {
            setLoading(false);
        }
    };

    const handleEditCar = (car: CarType) => {
        setCarFormData({
            model: car.model,
            price_per_day: car.price_per_day,
            price_per_week: car.price_per_week,
            price_per_month: car.price_per_month,
            location: car.location,
            image_url: car.image_url,
            category: car.category,
            availability: car.availability ? {
                from: new Date(car.availability.from),
                to: new Date(car.availability.to),
            } : undefined,
        });
        setIsEditing(true);
        setCurrentCarId(car._id);
        setActiveTab('add-car');
    };

    const handleDeleteCar = async (carId: string) => {
        if (window.confirm('Är du säker på att du vill ta bort denna bil?')) {
            setLoading(true);
            setError(null);
            setSuccessMessage(null);
            try {
                await deleteCar(carId);
                setSuccessMessage('Bil borttagen framgångsrikt!');
                await fetchCompanyCars();
            } catch (err: any) {
                setError(err.response?.data?.message || 'Kunde inte ta bort bil.');
            } finally {
                setLoading(false);
            }
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Ej angivet';
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
                <h1 className="text-4xl font-bold text-center mb-8 text-primary-dark dark:text-primary-light">Företags Dashboard</h1>

                {/* Tabbar */}
                <div className="dashboard-tabs">
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'my-cars' ? 'active' : ''}`}
                        onClick={() => setActiveTab('my-cars')}
                    >
                        Mina Bilar ({myCars.length})
                    </button>
                    <button
                        className={`py-2 px-6 rounded-md font-semibold transition-colors duration-300 ${activeTab === 'add-car' ? 'active' : ''}`}
                        onClick={() => {
                            setActiveTab('add-car');
                            setIsEditing(false);
                            setCurrentCarId(null);
                            setCarFormData({
                                model: '',
                                price_per_day: 0,
                                location: '',
                                image_url: '',
                                category: '',
                                price_per_week: undefined,
                                price_per_month: undefined,
                                availability: { from: new Date(), to: new Date(new Date().setFullYear(new Date().getFullYear() + 1)) },
                            });
                        }}
                    >
                        {isEditing ? 'Redigera Bil' : 'Lägg till Ny Bil'}
                    </button>
                </div>

                {successMessage && <p className="success-message">{successMessage}</p>}
                {/* Innehåll för "Mina Bilar" */}
                {activeTab === 'my-cars' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">Mina Bilar</h2>
                        {myCars.length === 0 ? (
                            <p className="text-gray-600 dark:text-gray-400">Du har inga registrerade bilar ännu.</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {myCars.map((car) => (
                                    <motion.div
                                        key={car._id}
                                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-lg bg-white dark:bg-deepDarkBackground transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <div className="relative w-full h-48 overflow-hidden">
                                            <img src={car.image_url || '/placeholder-car.jpg'} alt={car.model} className="w-full h-full object-cover transition-transform duration-300 hover:scale-110" />
                                            <div className="absolute top-2 right-2 bg-primary dark:bg-primary-light text-white dark:text-primary-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                                {car.category || 'Standard'}
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="text-xl font-semibold mb-2 text-primary-dark dark:text-primary-light">{car.model}</h3>
                                            <p className="text-gray-600 dark:text-gray-300 mb-1 flex items-center"><FaDollarSign className="mr-2 text-primary" />Pris: {car.price_per_day} SEK/dag</p>
                                            <p className="text-gray-600 dark:text-gray-300 mb-1 flex items-center"><FaMapMarkerAlt className="mr-2 text-primary" />Plats: {car.location}</p>
                                            <p className="text-gray-600 dark:text-gray-300 mb-1 flex items-center"><FaCalendarAlt className="mr-2 text-primary" />Tillgänglig: {formatDate(car.availability?.from)} - {formatDate(car.availability?.to)}</p>
                                            <div className="mt-4 flex space-x-2">
                                                <button
                                                    onClick={() => handleEditCar(car)}
                                                    className="bg-accent hover:bg-accent-dark text-white py-2 px-4 rounded-md text-sm transition-colors duration-300 flex items-center"
                                                >
                                                    <FaEdit className="mr-1" /> Redigera
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteCar(car._id)}
                                                    className="bg-brand-red hover:bg-red-700 text-white py-2 px-4 rounded-md text-sm transition-colors duration-300 flex items-center"
                                                >
                                                    <FaTrash className="mr-1" /> Ta bort
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </motion.div>
                )}

                {/* Innehåll för "Lägg till Ny Bil" / "Redigera Bil" */}
                {activeTab === 'add-car' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="dashboard-section"
                    >
                        <h2 className="text-2xl font-semibold text-primary-dark dark:text-primary-light mb-6">{isEditing ? `Redigera Bil: ${carFormData.model || 'Okänd modell'}` : 'Lägg till Ny Bil'}</h2>
                        <form onSubmit={handleCarSubmit}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="form-group">
                                    <label htmlFor="model" className="form-label text-gray-700 dark:text-gray-300"><FaCar className="inline mr-2 text-primary"/>Modell:</label>
                                    <input type="text" id="model" name="model" value={carFormData.model || ''} onChange={handleCarFormChange} required className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_per_day" className="form-label text-gray-700 dark:text-gray-300"><FaDollarSign className="inline mr-2 text-primary"/>Pris per dag (SEK):</label>
                                    <input type="number" id="price_per_day" name="price_per_day" value={carFormData.price_per_day ?? ''} onChange={handleCarFormChange} required className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_per_week" className="form-label text-gray-700 dark:text-gray-300"><FaDollarSign className="inline mr-2 text-primary"/>Pris per vecka (SEK):</label>
                                    <input type="number" id="price_per_week" name="price_per_week" value={carFormData.price_per_week ?? ''} onChange={handleCarFormChange} className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="price_per_month" className="form-label text-gray-700 dark:text-gray-300"><FaDollarSign className="inline mr-2 text-primary"/>Pris per månad (SEK):</label>
                                    <input type="number" id="price_per_month" name="price_per_month" value={carFormData.price_per_month ?? ''} onChange={handleCarFormChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="location" className="form-label text-gray-700 dark:text-gray-300"><FaMapMarkerAlt className="inline mr-2 text-primary"/>Plats:</label>
                                    <input type="text" id="location" name="location" value={carFormData.location || ''} onChange={handleCarFormChange} required className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="category" className="form-label text-gray-700 dark:text-gray-300"><FaTag className="inline mr-2 text-primary"/>Kategori:</label>
                                    <input type="text" id="category" name="category" value={carFormData.category || ''} onChange={handleCarFormChange} className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group col-span-full">
                                    <label htmlFor="image_url" className="form-label text-gray-700 dark:text-gray-300"><FaImage className="inline mr-2 text-primary"/>Bild URL:</label>
                                    <input type="text" id="image_url" name="image_url" value={carFormData.image_url || ''} onChange={handleCarFormChange} className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="availabilityFrom" className="form-label text-gray-700 dark:text-gray-300"><FaCalendarAlt className="inline mr-2 text-primary"/>Tillgänglig från:</label>
                                    <input
                                        type="date"
                                        id="availabilityFrom"
                                        name="from"
                                        value={carFormData.availability?.from instanceof Date
                                            ? carFormData.availability.from.toISOString().split('T')[0]
                                            : ''}
                                        onChange={handleDateChange}
                                        className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                    />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="availabilityTo" className="form-label text-gray-700 dark:text-gray-300"><FaCalendarAlt className="inline mr-2 text-primary"/>Tillgänglig till:</label>
                                    <input
                                        type="date"
                                        id="availabilityTo"
                                        name="to"
                                        value={carFormData.availability?.to instanceof Date
                                            ? carFormData.availability.to.toISOString().split('T')[0]
                                            : ''}
                                        onChange={handleDateChange}
                                        className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="form-button bg-primary hover:bg-primary-dark mt-6 flex items-center justify-center">
                                <FaPlusCircle className="mr-2" /> {isEditing ? 'Uppdatera Bil' : 'Lägg till Bil'}
                            </button>
                        </form>
                    </motion.div>
                )}
            </motion.div>
            <Footer />
        </>
    );
};

export default withAuth(CompanyDashboard, 'company');
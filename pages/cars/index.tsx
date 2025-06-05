import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { getCars, Car as CarType } from '../../utils/api';
import { RingLoader } from 'react-spinners';
import { motion } from 'framer-motion';
import Link from 'next/link';

const CarListPage = () => {
    const [cars, setCars] = useState<CarType[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [filterLocation, setFilterLocation] = useState('');

    useEffect(() => {
        const fetchCarsData = async () => {
            try {
                setLoading(true);
                const data = await getCars();
                setCars(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Ett fel uppstod vid hämtning av bilar.');
            } finally {
                setLoading(false);
            }
        };
        fetchCarsData();
    }, []);

    const uniqueCategories = [...new Set(cars.map(car => car.category).filter(Boolean) as string[])];
    const uniqueLocations = [...new Set(cars.map(car => car.location).filter(Boolean))];

    const filteredCars = cars.filter(car => {
        const matchesSearch = car.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              car.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              (car.category?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory ? car.category === filterCategory : true;
        const matchesLocation = filterLocation ? car.location === filterLocation : true;
        return matchesSearch && matchesCategory && matchesLocation;
    });

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

    return (
        <>
            <Header />
            <main className="container mx-auto px-4 py-8">
                <h1 className="text-4xl font-bold text-center mb-8 text-primary-dark dark:text-primary-light">Utforska Våra Premium Bilar</h1>

                {/* Sök- och filtersektion */}
                <motion.div
                    className="bg-white dark:bg-darkerBackground shadow-lg rounded-xl p-6 mb-8 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 items-end"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <div className="form-group col-span-full md:col-span-2 lg:col-span-2">
                        <label htmlFor="search" className="form-label text-gray-700 dark:text-gray-300">Sök:</label>
                        <input
                            type="text"
                            id="search"
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            placeholder="Sök efter modell, plats, kategori..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="categoryFilter" className="form-label text-gray-700 dark:text-gray-300">Kategori:</label>
                        <select
                            id="categoryFilter"
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                        >
                            <option value="">Alla Kategorier</option>
                            {uniqueCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="locationFilter" className="form-label text-gray-700 dark:text-gray-300">Plats:</label>
                        <select
                            id="locationFilter"
                            className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                        >
                            <option value="">Alla Platser</option>
                            {uniqueLocations.map(location => (
                                <option key={location} value={location}>{location}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {filteredCars.length > 0 ? (
                    <div className="grid gap-8 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {filteredCars.map(car => (
                            <motion.div
                                key={car._id}
                                className="bg-white dark:bg-darkerBackground rounded-xl shadow-lg overflow-hidden flex flex-col transform transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="relative w-full h-48 overflow-hidden">
                                  <img
                                      src={car.image_url || '/placeholder-car.jpg'}
                                      alt={car.model}
                                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
                                  />
                                  <div className="absolute top-2 right-2 bg-primary dark:bg-primary-light text-white dark:text-primary-dark text-xs font-bold px-3 py-1 rounded-full shadow-md">
                                    {car.category || 'Standard'}
                                  </div>
                                </div>
                                <div className="p-5 flex flex-col flex-grow">
                                    <h3 className="text-2xl font-bold mb-2 text-primary-dark dark:text-primary-light">{car.model}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 mb-3 flex-grow">{car.location}</p>
                                    <p className="text-xl font-extrabold text-brand-red dark:text-red-400 mb-4">{car.price_per_day} SEK/dag</p>
                                    <div className="mt-auto">
                                        <Link href={`/cars/${car._id}`} className="form-button text-center w-full bg-primary hover:bg-primary-dark">
                                            Visa Detaljer
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-xl mt-10 text-gray-700 dark:text-gray-300">Inga bilar matchade dina sökkriterier.</p>
                )}
            </main>
            <Footer />
        </>
    );
};

export default CarListPage;
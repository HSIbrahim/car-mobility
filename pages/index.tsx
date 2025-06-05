import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CarCardGrid from '../components/CarCard';
import { getCars, Car as CarType } from '../utils/api';
import { RingLoader } from 'react-spinners';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface DisplayCar extends CarType {
  modelName: string;
  tag: string;
  shortDescription: string;
  detailsLink?: string;
}

export default function Home() {
  const [cars, setCars] = useState<DisplayCar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCarsData = async () => {
      try {
        setLoading(true);
        const data = await getCars();
        
        const transformedCars: DisplayCar[] = data
            .filter(car => car.image_url)
            .map(car => ({
                ...car,
                modelName: car.model,
                tag: car.category || 'Premium', // Bättre standardtag
                shortDescription: `Upplev ${car.model} i ${car.location}. Hyr från ${car.price_per_day} SEK/dag.`,
                detailsLink: `/cars/${car._id}`
            }));
        setCars(transformedCars);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Ett fel uppstod vid hämtning av bilar.');
      } finally {
        setLoading(false);
      }
    };
    fetchCarsData();
  }, []);

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
      <div className="relative h-[80vh] flex items-center justify-center text-white overflow-hidden">
        <video
          autoPlay
          loop
          muted
          className="absolute z-10 w-auto min-w-full min-h-full max-w-none object-cover" // object-cover för bättre passform
        >
          <source src="/hero-video.mp4" type="video/mp4" />
          Din webbläsare stöder inte video-taggen.
        </video>
        <div className="absolute inset-0 bg-black bg-opacity-60 z-15"></div> {/* Mörk overlay */}
        <div className="relative z-20 text-center p-8 rounded-xl max-w-4xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-extrabold mb-4 text-primary-light leading-tight drop-shadow-lg"
          >
            Din Resa, Dina Regler
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-lg md:text-2xl mb-8 max-w-2xl mx-auto text-secondary-light"
          >
            Hyr lyxbilar från pålitliga lokala ägare eller förvandla din egen bil till en inkomstkälla. Flexibilitet och säkerhet, alltid.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/cars" className="bg-primary hover:bg-primary-dark text-white font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out shadow-lg transform hover:scale-105">
              Utforska Bilar
            </Link>
            <Link href="/auth/register" className="border border-primary-light text-primary-light hover:bg-primary-light hover:text-primary-dark font-bold py-3 px-8 rounded-full text-lg transition duration-300 ease-in-out shadow-lg transform hover:scale-105">
              Bli Medlem
            </Link>
          </motion.div>
        </div>
      </div>

      <main className="container mx-auto px-4 mt-12">
        <h1 className="text-4xl text-center mb-10 text-primary-dark dark:text-primary-light">Våra Utvalda Modeller</h1>
        {cars.length > 0 ? (
          <CarCardGrid cars={cars} />
        ) : (
          <p className="text-center text-lg text-gray-700 dark:text-gray-300">Inga bilar hittades för tillfället.</p>
        )}
      </main>
      <Footer />
    </>
  );
}
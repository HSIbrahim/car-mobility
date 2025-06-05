import React, { useState } from 'react';
import { createRental } from '../utils/api';
import { motion } from 'framer-motion';
import { RingLoader } from 'react-spinners'; // Importera RingLoader

interface BookingFormProps {
    carId: string;
    carModel: string;
    onBookingSuccess: () => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ carId, carModel, onBookingSuccess }) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(null);

        if (new Date(startDate) >= new Date(endDate)) {
            setError('Startdatum måste vara före slutdatum.');
            setLoading(false);
            return;
        }

        try {
            await createRental({
                car_id: carId,
                start_date: startDate,
                end_date: endDate,
            });
            setSuccess('Din hyresförfrågan har skickats! Du kommer att meddelas när den godkänns.');
            onBookingSuccess();
            setStartDate('');
            setEndDate('');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Kunde inte skicka hyresförfrågan.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <motion.div
            className="form-container bg-white dark:bg-darkerBackground"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2 className="text-primary-dark dark:text-primary-light">Boka {carModel}</h2>
            {error && <p className="error-message">{error}</p>}
            {success && <p className="success-message">{success}</p>}
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="startDate" className="text-gray-700 dark:text-gray-300">Startdatum:</label>
                    <input
                        type="date"
                        id="startDate"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        required
                        className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="endDate" className="text-gray-700 dark:text-gray-300">Slutdatum:</label>
                    <input
                        type="date"
                        id="endDate"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        required
                        className="form-input bg-gray-50 dark:bg-deepDarkBackground dark:text-textDarkMode"
                    />
                </div>
                <button type="submit" className="form-button bg-primary hover:bg-primary-dark" disabled={loading}>
                    {loading ? <RingLoader color={"#fff"} loading={loading} size={20} /> : 'Skicka Bokningsförfrågan'}
                </button>
            </form>
        </motion.div>
    );
};

export default BookingForm;
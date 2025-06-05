import axios from 'axios';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = Cookies.get('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

// Uppdaterade typer
export interface Car {
    _id: string;
    organization_number: string;
    model: string;
    price_per_day: number;
    price_per_week?: number;
    price_per_month?: number;
    // Ändra from och to till strängar, eftersom de troligen kommer som ISO-datumsträngar från backend
    availability?: { from: string; to: string; }; // Ändrad från Date till string
    // unavailable: Array<{ from: Date; to: Date; }>; // Om dessa också kommer som strängar, ändra även här
    unavailable: Array<{ from: string; to: string; }>; // Ändrad från Date till string
    location: string;
    image_url?: string;
    category: string;
    created_at: string;
    updated_at: string;
}

export interface Rental {
    _id: string;
    car_id: string | Car;
    renter_id: string;
    start_date: string;
    end_date: string;
    status: 'pending' | 'approved' | 'rejected' | 'deleted';
    total_price: number;
    reason?: string;
    created_at: string;
    updated_at: string;
}

export interface Booking {
    _id: string;
    rental_id: string;
    car_id: string | Car;
    renter_id: string;
    start_date: string;
    end_date: string;
    total_price: number;
    pickup_address: string;
    dropoff_address: string;
    created_at: string;
    updated_at: string;
}

export interface UserDecodedToken {
    id: string;
    user_type: 'company' | 'individual';
    phone_number: string;
    is_admin: boolean;
    organization_number?: string;
    exp: number;
    iat: number;
}

export const getDecodedToken = (): UserDecodedToken | null => {
    const token = Cookies.get('token');
    if (token) {
        try {
            const decoded: UserDecodedToken = jwtDecode(token);
            if (decoded.exp * 1000 < Date.now()) {
                console.warn('Token har gått ut.');
                Cookies.remove('token');
                Cookies.remove('user');
                return null;
            }
            return decoded;
        } catch (error) {
            console.error('Kunde inte avkoda token:', error);
            return null;
        }
    }
    return null;
};


// API-anrop för bilar
export const getCars = async (params?: { organizationNumber?: string }): Promise<Car[]> => {
    try {
        const response = await apiClient.get('/cars', { params });
        return response.data;
    } catch (err: any) {
        console.error('Fel vid hämtning av bilar:', err.response?.data || err.message);
        throw err;
    }
};

export const getCarById = async (id: string): Promise<Car> => {
    try {
        const response = await apiClient.get(`/cars/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(`Fel vid hämtning av bil med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const createCar = async (carData: Partial<Car>): Promise<Car> => {
    try {
        const response = await apiClient.post('/cars', carData);
        return response.data.car;
    } catch (err: any) {
        console.error('Fel vid skapande av bil:', err.response?.data || err.message);
        throw err;
    }
};

export const updateCar = async (id: string, carData: Partial<Car>): Promise<Car> => {
    try {
        const response = await apiClient.put(`/cars/${id}`, carData);
        return response.data.car;
    } catch (err: any) {
        console.error(`Fel vid uppdatering av bil med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const deleteCar = async (id: string): Promise<{ message: string }> => {
    try {
        const response = await apiClient.delete(`/cars/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(`Fel vid borttagning av bil med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const getAllCarsByOrganizationNumber = async (): Promise<Car[]> => {
    try {
        const response = await apiClient.get('/cars/organization');
        return response.data;
    } catch (err: any) {
        console.error('Fel vid hämtning av bilar per organisationsnummer:', err.response?.data || err.message);
        throw err;
    }
};

// API-anrop för uthyrning
export const createRental = async (rentalData: { car_id: string; start_date: string; end_date: string }): Promise<Rental> => {
    try {
        const response = await apiClient.post('/rentals', rentalData);
        return response.data.rental;
    } catch (err: any) {
        console.error('Fel vid skapande av hyresorder:', err.response?.data || err.message);
        throw err;
    }
};

export const getRentalById = async (id: string): Promise<Rental> => {
    try {
        const response = await apiClient.get(`/rentals/${id}`);
        return response.data;
    } catch (err: any) {
        console.error(`Fel vid hämtning av hyresorder med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const updateRentalStatus = async (id: string, status: 'pending' | 'approved' | 'rejected' | 'completed', reason?: string): Promise<Rental> => {
    try {
        const response = await apiClient.put(`/rentals/${id}`, { status, reason });
        return response.data.rental;
    } catch (err: any) {
        console.error(`Fel vid uppdatering av hyresorderstatus för ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const approveRental = async (id: string, bookingDetails: { pickup_address: string; dropoff_address: string }): Promise<Booking> => {
    try {
        const response = await apiClient.put(`/rentals/admin/approve/${id}`, bookingDetails);
        return response.data.booking;
    } catch (err: any) {
        console.error(`Fel vid godkännande av hyresorder med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const rejectRental = async (id: string, reason: string): Promise<Rental> => {
    try {
        const response = await apiClient.put(`/rentals/admin/reject/${id}`, { reason });
        return response.data.rental;
    } catch (err: any) {
        console.error(`Fel vid avvisande av hyresorder med ID ${id}:`, err.response?.data || err.message);
        throw err;
    }
};

export const getAllRentals = async (): Promise<Rental[]> => {
    try {
        const response = await apiClient.get('/rentals');
        return response.data.rentals;
    } catch (err: any) {
        console.error('Fel vid hämtning av alla hyresorder:', err.response?.data || err.message);
        throw err;
    }
};

export const getAllRejectedRentalsAdmin = async (): Promise<Rental[]> => {
    try {
        const response = await apiClient.get('/rentals/rejected');
        return response.data;
    } catch (err: any) {
        console.error('Fel vid hämtning av avvisade hyresorder (admin):', err.response?.data || err.message);
        throw err;
    }
};

export const getAllBookingsAdmin = async (): Promise<Booking[]> => {
    try {
        const response = await apiClient.get('/rentals/approved');
        return response.data;
    } catch (err: any) {
        console.error('Fel vid hämtning av alla bokningar (admin):', err.response?.data || err.message);
        throw err;
    }
};

export const getRentalAnalytics = async (): Promise<any> => {
    try {
        const response = await apiClient.get('/rentals/analytics');
        return response.data;
    } catch (error) {
        console.error('Error fetching rental analytics:', error);
        throw error;
    }
};

export const getAllBookingsByUserId = async (userId: string): Promise<Booking[]> => {
    try {
        const response = await apiClient.get(`/rentals/bookings?userId=${userId}`);
        return response.data.bookings;
    } catch (err: any) {
        console.error(`Fel vid hämtning av bokningar för användare ${userId}:`, err.response?.data || err.message);
        throw err;
    }
};

export const getCurrentRentalsByUserId = async (userId: string): Promise<Rental[]> => {
    try {
        const response = await apiClient.get(`/rentals/current-rentals?userId=${userId}`);
        return response.data.rentals;
    } catch (err: any) {
        console.error(`Fel vid hämtning av aktuella hyresorder för användare ${userId}:`, err.response?.data || err.message);
        throw err;
    }
};

// Autentisering API-anrop
export const registerUser = async (userData: any): Promise<any> => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', userData);
        return response.data;
    } catch (err: any) {
        console.error('Fel vid registrering:', err.response?.data || err.message);
        throw err;
    }
};

export const loginUser = async (credentials: any): Promise<{ token: string; user: { id: string; name: string; email: string; phone_number: string; is_admin: boolean; user_type?: string; organization_number?: string; } }> => {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/login', credentials);
        return response.data;
    } catch (err: any) {
        console.error('Fel vid inloggning:', err.response?.data || err.message);
        throw err;
    }
};
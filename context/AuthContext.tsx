import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { loginUser } from '../utils/api';

// Typer
interface AuthUser {
    id: string;
    name: string;
    email: string;
    phone_number: string;
    is_admin: boolean;
    user_type?: 'company' | 'individual'; // Definierad som union-typ
    organization_number?: string;
}

interface AuthContextType {
    user: AuthUser | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
}

interface DecodedToken {
    id: string;
    user_type: 'company' | 'individual'; // Decoded token har också den strikta union-typen
    phone_number: string;
    is_admin: boolean;
    organization_number?: string;
    exp: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadUserFromCookies = useCallback(() => {
        setIsLoading(true);
        const token = Cookies.get('token');
        const userDataString = Cookies.get('user');

        if (token && userDataString) {
            try {
                const decoded: DecodedToken = jwtDecode(token);
                if (decoded.exp * 1000 < Date.now()) { // Kontrollera utgångsdatum
                    console.warn('Token har gått ut. Loggar ut.');
                    logout();
                    return;
                }
                // När vi parsar från string, måste vi säkerställa att user_type matchar AuthUser
                const parsedUser: AuthUser = JSON.parse(userDataString);
                // Extra kontroll/typkonvertering för user_type om det behövs vid deserialisering
                if (parsedUser.user_type !== 'company' && parsedUser.user_type !== 'individual') {
                    // Detta bör inte hända om backend och API-typer är synkade,
                    // men om det gör det, behandla det som okänt eller standard
                    parsedUser.user_type = undefined; // Eller kasta ett fel
                }

                setUser(parsedUser);
                setIsAuthenticated(true);
            } catch (error) {
                console.error('Kunde inte avkoda token eller parsa användardata:', error);
                logout(); // Logga ut vid fel
            }
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        loadUserFromCookies();
    }, [loadUserFromCookies]);

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await loginUser({ email, password });
            const { token, user: userData } = response;

            // Använd type assertion för att säkerställa att userData.user_type matchar AuthUser
            const authenticatedUser: AuthUser = {
                id: userData.id,
                name: userData.name,
                email: userData.email,
                phone_number: userData.phone_number,
                is_admin: userData.is_admin,
                user_type: userData.user_type as 'company' | 'individual' | undefined, // Type assertion här
                organization_number: userData.organization_number,
            };

            Cookies.set('token', token, { expires: 7, secure: process.env.NODE_ENV === 'production' });
            Cookies.set('user', JSON.stringify(authenticatedUser), { expires: 7, secure: process.env.NODE_ENV === 'production' });

            setUser(authenticatedUser); // Använd den typ-säkrade användaren här
            setIsAuthenticated(true);
            setIsLoading(false);
        } catch (error) {
            setIsLoading(false);
            throw error; // Kasta felet så att komponenten kan hantera det
        }
    };

    const logout = () => {
        Cookies.remove('token');
        Cookies.remove('user');
        setUser(null);
        setIsAuthenticated(false);
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, login, logout, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth måste användas inom en AuthProvider');
    }
    return context;
};
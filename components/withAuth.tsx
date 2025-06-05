import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { RingLoader } from 'react-spinners';
import { UserDecodedToken } from '../utils/api';

const withAuth = (WrappedComponent: React.ComponentType<any>, requiredRole?: 'admin' | 'company' | 'individual') => {
    const ComponentWithAuth = (props: any) => {
        const router = useRouter();
        const [loading, setLoading] = useState(true);
        const [isAuthenticated, setIsAuthenticated] = useState(false);
        const [isAuthorized, setIsAuthorized] = useState(false);

        useEffect(() => {
            const verifyAuth = async () => {
                const token = Cookies.get('token');

                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                try {
                    const decodedToken: UserDecodedToken = jwtDecode(token);

                    // Kolla om token har gått ut
                    if (decodedToken.exp * 1000 < Date.now()) {
                        console.warn('Token har gått ut. Loggar ut.');
                        Cookies.remove('token');
                        Cookies.remove('user'); // Ta bort användardata också
                        router.push('/auth/login');
                        return;
                    }

                    setIsAuthenticated(true);

                    // Bestäm den effektiva rollen baserat på `is_admin` och `user_type`
                    let effectiveUserRole: 'admin' | 'company' | 'individual' = decodedToken.user_type;
                    if (decodedToken.is_admin) {
                        effectiveUserRole = 'admin'; // Admin har högst prio för behörighetskontroll
                    }
                    
                    if (requiredRole) {
                        // Jämför den effektiva rollen med den nödvändiga rollen
                        if (effectiveUserRole === requiredRole) {
                            setIsAuthorized(true);
                        } else {
                            // Hantera specifika fall där en "admin" kan ha åtkomst till "company" eller "individual" sidor
                            // Om requiredRole är 'company' och effectiveUserRole är 'admin', så är det ok
                            if (requiredRole === 'company' && effectiveUserRole === 'admin') {
                                setIsAuthorized(true);
                            } 
                            // Om requiredRole är 'individual' och effectiveUserRole är 'admin', så är det ok
                            else if (requiredRole === 'individual' && effectiveUserRole === 'admin') {
                                setIsAuthorized(true);
                            } 
                            else {
                                router.push('/unauthorized'); // Skicka till obehörig sida
                            }
                        }
                    } else {
                        // Ingen specifik roll krävs, bara autentisering
                        setIsAuthorized(true);
                    }
                } catch (error) {
                    console.error('Autentiseringsfel:', error);
                    Cookies.remove('token');
                    Cookies.remove('user');
                    router.push('/auth/login');
                } finally {
                    setLoading(false);
                }
            };

            verifyAuth();
        }, [router, requiredRole]);

        if (loading) {
            return (
                <div className="loading-spinner-container min-h-screen">
                    <RingLoader color={"#db0000"} loading={true} size={100} />
                </div>
            );
        }

        if (!isAuthenticated || !isAuthorized) {
            return null; // Renderar inget om inte autentiserad/auktoriserad och inte laddar
        }

        return <WrappedComponent {...props} />;
    };

    const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
    ComponentWithAuth.displayName = `withAuth(${wrappedComponentName})`;

    return ComponentWithAuth;
};

export default withAuth;
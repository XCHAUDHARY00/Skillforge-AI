import axios from 'axios';

// Ek central axios instance banate hain
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://career-mind-a-ezi2.vercel.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 90000, // ✅ 90 seconds — Render.com cold start + AI response time handle karta hai
});

// Request Interceptor: API call bhejne se pehle ye chalega
api.interceptors.request.use(
    (config) => {
        // Local storage se access token uthao
        const token = localStorage.getItem('access_token');
        if (token) {
            // Agar token hai, toh Authorization header mein attach kar do
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: 401 error aane par auto token refresh + network retry
api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // ✅ Network error ya timeout pe ek baar retry karo (Render.com cold start fix)
        if (
            !originalRequest._retried &&
            (error.code === 'ECONNABORTED' || error.code === 'ERR_NETWORK' || !error.response)
        ) {
            originalRequest._retried = true;
            console.warn('[API] Network issue, retrying once...', error.code);
            // Thoda wait karo phir retry
            await new Promise(res => setTimeout(res, 2000));
            return api(originalRequest);
        }

        // Agar response status 401 hai aur ye retry request nahi hai
        if (
            error.response &&
            error.response.status === 401 &&
            !originalRequest._retry &&
            originalRequest.url &&
            !originalRequest.url.includes('/login/') &&
            !originalRequest.url.includes('/token/refresh/')
        ) {
            originalRequest._retry = true;
            const refreshToken = localStorage.getItem('refresh_token');

            if (refreshToken) {
                try {
                    // clean instance context-wise for refresh call to avoid loop
                    const refreshInstance = axios.create({
                        baseURL: API_BASE_URL,
                        timeout: 15000,
                    });
                    
                    const response = await refreshInstance.post('/token/refresh/', {
                        refresh: refreshToken,
                    });

                    if (response.status === 200 && response.data.access) {
                        const newAccessToken = response.data.access;
                        localStorage.setItem('access_token', newAccessToken);

                        // Authorization header update karke request fir se retry karo
                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                } catch (refreshError) {
                    console.error("Token refresh failed, logging out...", refreshError);
                }
            }

            console.log("Token expired or unauthorized. Logging out...");
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            // Redirect to login
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

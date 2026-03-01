import axios from "axios";
import { auth } from "../config/firebase";

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor — attach Firebase ID token as Bearer token
apiClient.interceptors.request.use(
    async (config) => {
        const currentUser = auth.currentUser;
        if (currentUser) {
            const idToken = await currentUser.getIdToken();
            config.headers.Authorization = `Bearer ${idToken}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export default apiClient;

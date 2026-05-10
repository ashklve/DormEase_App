import axios from 'axios';

const client = axios.create({
    baseURL: 'https://strongman-studio-stoke.ngrok-free.dev/api',
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
    }
});

export default client;
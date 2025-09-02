// src/api/taxiApi.js
import axios from "axios";


const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8009";


const api = axios.create({
baseURL: BASE_URL,
timeout: 20000,
});


export async function getCorporatePatterns({ limit = 10 } = {}) {
const { data } = await api.get(`/corporate/patterns`, { params: { limit } });
return data;
}


export async function getTopPickups({ limit = 10, days = 30 } = {}) {
const { data } = await api.get(`/hotspots/pickup`, { params: { limit, days } });
return data;
}


export async function getPremiumTrips({ limit = 100, min_fare = 50, min_distance = 10 } = {}) {
const { data } = await api.get(`/trips/premium`, {
params: { limit, min_fare, min_distance },
});
return data;
}


export async function getTripsByPassengerCount({ passenger_count, limit = 1000 } = {}) {
const { data } = await api.get(`/customers/${passenger_count}/trips`, { params: { limit } });
return data;
}
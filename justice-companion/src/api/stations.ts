import api from "./axios";
import type { Station } from "@/lib/types";

export async function getStations(): Promise<{ stations: Station[] }> {
    const { data } = await api.get("/stations");
    return data;
}

export async function createStation(stationData: {
    name: string;
    location: string;
    address: string;
}): Promise<{ message: string; station: Station }> {
    const { data } = await api.post("/stations", stationData);
    return data;
}

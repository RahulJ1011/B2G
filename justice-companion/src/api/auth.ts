import api from "./axios";
import type { LoginResponse, PoliceLoginResponse } from "@/lib/types";

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
    const { data } = await api.post<LoginResponse>("/login", { email, password });
    return data;
}

export async function registerUser(
    name: string,
    email: string,
    password: string,
    role: string
): Promise<{ message: string; userId: string }> {
    const { data } = await api.post("/register", { name, email, password, role });
    return data;
}

export async function policeLogin(
    policeId: string,
    password: string
): Promise<PoliceLoginResponse> {
    const { data } = await api.post<PoliceLoginResponse>("/PoliceLogin", { policeId, password });
    return data;
}

export async function policeRegister(policeData: {
    policeId: string;
    name: string;
    email: string;
    password: string;
    rank: string;
    stationName: string;
    stationCode: string;
    contactNumber: string;
    role?: string;
}): Promise<{ success: boolean; message: string }> {
    const { data } = await api.post("/PoliceRegister", policeData);
    return data;
}

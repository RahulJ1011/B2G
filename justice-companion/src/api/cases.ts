import api from "./axios";
import type { Case, DashboardResponse } from "@/lib/types";

export async function submitCase(caseData: {
    crime_type: string;
    location: string;
    description: string;
    incident_datetime: string;
}): Promise<{ success: boolean; case: Case }> {

    const token = localStorage.getItem("token");

    const { data } = await api.post("/UserSubmits", caseData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });

    return data;
}

export async function getCases(): Promise<{ cases: Case[] }> {
    const { data } = await api.get("/getCases");
    return data;
}

export async function getDashboard(): Promise<DashboardResponse> {
    const { data } = await api.get("/dashboard");
    return data;
}

export async function updateCase(id: string): Promise<{ message: string; case: Case }> {
    const { data } = await api.patch(`/${id}`);
    return data;
}

export async function markCaseHandled(
    id: string,
    handleData: { remarks: string; actionTaken: string }
): Promise<{ message: string; case: Case }> {
    const { data } = await api.patch(`/police/${id}/handle`, handleData);
    return data;
}

export async function confirmCaseResolved(id: string): Promise<{ message: string; case: Case }> {
    const { data } = await api.patch(`/citizen/${id}/confirm`);
    return data;
}

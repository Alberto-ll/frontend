import type { Pitch } from "../types/pitchType";

const baseUrl = "http://localhost:3000/api/pitchs";

export type PitchResponse = {
  data: Pitch;
};

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};
const getAuthHeadersWithFile = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const pitchService = {
  getAll: async (): Promise<PitchResponse[]> => {
    const response = await fetch(`${baseUrl}/getAll`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: PitchResponse[] = await response.json();
    return json;
  },

  getOne: async (id: string): Promise<PitchResponse> => {
    const response = await fetch(`${baseUrl}/getOne/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: PitchResponse = await response.json();
    return json;
  },

  add: async (pitch: FormData): Promise<PitchResponse> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeadersWithFile(),
      body: pitch,
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }

    const json: PitchResponse = await response.json();
    return json;
  },

  update: async (pitch: FormData): Promise<PitchResponse> => {
    const response = await fetch(`${baseUrl}/update/${pitch.get('id')}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(pitch),
    });

    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: PitchResponse = await response.json();
    return json;
  },

  remove: async (id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/remove/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
  },
};

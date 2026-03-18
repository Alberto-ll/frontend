import type { Locality } from "../types/localityType";


const baseUrl = "http://localhost:3000/api/localities";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const localityService = {
  getAll: async (): Promise<Locality[]> => {
    const response = await fetch(`${baseUrl}/getAll`, {
      method: "GET",
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      let errors;
        try {
            errors = await response.json();
        } catch {
            errors = { message: `Error del servidor: ${response.statusText}` };
        }
        throw errors;
    }
    const json = await response.json();
    console.log(json)
    return json as Locality[];
  },

  getOne: async (id: string): Promise<Locality> => {
    const response = await fetch(`${baseUrl}/getOne/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let errors;
        try {
            errors = await response.json();
        } catch {
            errors = { message: `Error del servidor: ${response.statusText}` };
        }
        throw errors;
    }
    const json = await response.json();
    return json as Locality;
  },

  add: async (locality: Locality): Promise<Locality> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(locality),
    });
    if (!response.ok) {
      let errors;
        try {
            errors = await response.json();
        } catch {
            errors = { message: `Error del servidor: ${response.statusText}` };
        }
        throw errors;
    }

    const json = await response.json();

    return json as Locality;
  },

  update: async (locality: Locality): Promise<Locality> => {
    const response = await fetch(`${baseUrl}/update/${locality.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(locality),
    });

    if (!response.ok) {
      let errors;
        try {
            errors = await response.json();
        } catch {
            errors = { message: `Error del servidor: ${response.statusText}` };
        }
        throw errors;
    }
    const json = await response.json();
    return json as Locality;
  },

  remove: async (id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/remove/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let errors;
        try {
            errors = await response.json();
        } catch {
            errors = { message: `Error del servidor: ${response.statusText}` };
        }
        throw errors;
    }
  },
};

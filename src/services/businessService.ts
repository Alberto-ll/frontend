import type { BusinessData } from "../types/businessType";

const baseUrl = "http://localhost:3000/api/business";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const businessService = {
  getAll: async (): Promise<BusinessData[]> => {
    const response = await fetch(`${baseUrl}/findAll`, {
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
    return json.data as BusinessData[];
  },

  getOne: async (id: string): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/findOne/${id}`, {
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
    return json.data as BusinessData;
  },

  add: async (business: BusinessData): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(business),
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

    return json.data as BusinessData;
  },

  update: async (business: BusinessData): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/update/${business.id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(business),
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
    return json.data as BusinessData;
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

  activate: async (id: number): Promise<void> => {
    const response = await fetch(`${baseUrl}/activate/${id}`, {
      method: "PUT",
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
  }
};

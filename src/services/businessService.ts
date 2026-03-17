import type { BusinessData } from "../types/businessType";

const baseUrl = "http://localhost:3000/api/business";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    Authorization: `Bearer ${token}`,
  };
};

export const businessService = {
  getAll: async (): Promise<BusinessData[]> => {
    const response = await fetch(`${baseUrl}/getAll`, {
      method: "GET",
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: BusinessData[] = await response.json();
    return json;
  },

  getOne: async (id: string): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/getOne/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: BusinessData = await response.json();
    return json;
  },

  add: async (business: BusinessData): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(business),
    });
    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }

    const json: BusinessData = await response.json();
    return json;
  },

  update: async (business: FormData): Promise<BusinessData> => {
    const response = await fetch(`${baseUrl}/update/${business.get('id')}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(business),
    });

    if (!response.ok) {
      const errors = await response.json();
      throw errors;
    }
    const json: BusinessData = await response.json();
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

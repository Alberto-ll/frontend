import type { Coupon } from "../types/couponType";

const baseUrl = "http://localhost:3000/api/coupons";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const couponService = {
  getAll: async (): Promise<Coupon[]> => {
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
    return json.data as Coupon[];
  },

  getOne: async (id: string): Promise<Coupon> => {
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
    return json.data as Coupon;
  },

  add: async (coupon: Coupon): Promise<Coupon> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(coupon),
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

    return json.data as Coupon;
  },

  update: async (coupon: Coupon): Promise<Coupon> => {
    const response = await fetch(`${baseUrl}/update/${coupon.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(coupon),
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
    return json.data as Coupon;
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

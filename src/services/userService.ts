import type { UserData } from "../types/userData";

const baseUrl = "http://localhost:3000/api/users";

const getAuthHeaders = () => {
  const token = JSON.parse(localStorage.getItem("user") || "{}").token;
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};

export const userService = {
  getAll: async (): Promise<UserData[]> => {
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
    return json.data as UserData[];
  },

  getOne: async (id: string): Promise<UserData> => {
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
    return json.data as UserData;
  },

  add: async (user: UserData): Promise<UserData> => {
    const response = await fetch(`${baseUrl}/add`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
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

    return json.data as UserData;
  },

  update: async (user: UserData): Promise<UserData> => {
    const response = await fetch(`${baseUrl}/update/${user.id}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(user),
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
    return json.data as UserData;
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

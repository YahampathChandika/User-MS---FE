// lib/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Enhanced error handling function
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    // Create more specific error messages for different scenarios
    let errorMessage = "An error occurred";

    if (response.status === 404) {
      errorMessage = "User not found";
    } else if (response.status === 409) {
      // Conflict - usually duplicate data
      errorMessage = data.payload || "Duplicate data detected";
    } else if (response.status === 400) {
      // Bad request - validation errors
      errorMessage = data.payload || "Invalid data provided";
    } else if (response.status >= 500) {
      errorMessage = "Server error. Please try again later.";
    } else {
      errorMessage =
        data.payload || `Request failed with status ${response.status}`;
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  // Backend returns { error: boolean, payload: data }
  if (data.error) {
    const error = new Error(data.payload || "An error occurred");
    error.data = data;
    throw error;
  }

  return data.payload;
};

// Helper function to build query string
const buildQueryString = (params) => {
  const filteredParams = Object.entries(params)
    .filter(
      ([, value]) => value !== undefined && value !== null && value !== ""
    )
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`
    )
    .join("&");

  return filteredParams ? `?${filteredParams}` : "";
};

/**
 * Get all users with filtering and pagination
 */
export const getUsers = async (filters = {}, pagination = {}) => {
  try {
    const params = {
      // Filtering parameters
      name: filters.name,
      email: filters.email,
      country: filters.country,
      fromDate: filters.fromDate,
      toDate: filters.toDate,
      search: filters.search,

      // Pagination parameters
      page: pagination.page || 1,
      limit: pagination.limit || 10,
      sortBy: pagination.sortBy || "createdAt",
      sortOrder: pagination.sortOrder || "DESC",
    };

    const queryString = buildQueryString(params);
    const response = await fetch(`${API_BASE_URL}/api/users${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

/**
 * Get user by ID
 */
export const getUserById = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Error fetching user ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new user
 */
export const createUser = async (userData) => {
  try {
    if (!userData) {
      throw new Error("User data is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error("Error creating user:", error);
    throw error;
  }
};

/**
 * Update user by ID
 */
export const updateUser = async (id, userData) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    if (!userData) {
      throw new Error("User data is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Error updating user ${id}:`, error);
    throw error;
  }
};

/**
 * Delete user by ID
 */
export const deleteUser = async (id) => {
  try {
    if (!id) {
      throw new Error("User ID is required");
    }

    const response = await fetch(`${API_BASE_URL}/api/users/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    return await handleResponse(response);
  } catch (error) {
    console.error(`Error deleting user ${id}:`, error);
    throw error;
  }
};

// Helper function to format date for API
export const formatDateForAPI = (date) => {
  if (!date) return null;

  // If date is already a string in YYYY-MM-DD format, return as is
  if (typeof date === "string" && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return date;
  }

  // If date is a Date object, format it
  if (date instanceof Date) {
    return date.toISOString().split("T")[0];
  }

  return null;
};

// Helper function to validate required fields before API calls
export const validateUserData = (userData, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || userData.name !== undefined) {
    if (!userData.name || userData.name.trim().length < 2) {
      errors.push("Name is required and must be at least 2 characters");
    }
  }

  if (!isUpdate || userData.email !== undefined) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!userData.email || !emailRegex.test(userData.email)) {
      errors.push("Valid email is required");
    }
  }

  if (!isUpdate || userData.aboutYou !== undefined) {
    if (!userData.aboutYou || userData.aboutYou.trim().length < 10) {
      errors.push("About You is required and must be at least 10 characters");
    }
  }

  if (!isUpdate || userData.birthday !== undefined) {
    if (!userData.birthday) {
      errors.push("Birthday is required");
    }
  }

  if (!isUpdate || userData.mobileNumber !== undefined) {
    if (!userData.mobileNumber || userData.mobileNumber.trim().length < 10) {
      errors.push("Mobile number is required");
    }
  }

  if (!isUpdate || userData.country !== undefined) {
    if (!userData.country || userData.country.trim().length < 2) {
      errors.push("Country is required");
    }
  }

  return errors;
};

// lib/api.js

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.payload || `HTTP error! status: ${response.status}`);
  }

  // Backend returns { error: boolean, payload: data }
  if (data.error) {
    throw new Error(data.payload || "An error occurred");
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
 * @param {Object} filters - Filtering options
 * @param {string} filters.name - Filter by name (partial match)
 * @param {string} filters.email - Filter by email (partial match)
 * @param {string} filters.country - Filter by country (exact match)
 * @param {string} filters.fromDate - Filter from date (YYYY-MM-DD)
 * @param {string} filters.toDate - Filter to date (YYYY-MM-DD)
 * @param {string} filters.search - Global search across multiple fields
 * @param {Object} pagination - Pagination options
 * @param {number} pagination.page - Page number (default: 1)
 * @param {number} pagination.limit - Items per page (default: 10)
 * @param {string} pagination.sortBy - Sort field (default: 'createdAt')
 * @param {string} pagination.sortOrder - Sort order 'ASC' or 'DESC' (default: 'DESC')
 * @returns {Promise<Object>} Response with users array and pagination info
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
 * @param {number} id - User ID
 * @returns {Promise<Object>} User object
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
 * @param {Object} userData - User data
 * @param {string} userData.name - User name (2-50 characters)
 * @param {string} userData.aboutYou - About you description (10-250 characters)
 * @param {string} userData.birthday - Birthday (YYYY-MM-DD format)
 * @param {string} userData.mobileNumber - Mobile number
 * @param {string} userData.email - Email address
 * @param {string} userData.country - Country name (2-20 characters)
 * @returns {Promise<string>} Success message
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
 * @param {number} id - User ID
 * @param {Object} userData - Updated user data
 * @returns {Promise<string>} Success message
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
 * @param {number} id - User ID
 * @returns {Promise<string>} Success message
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

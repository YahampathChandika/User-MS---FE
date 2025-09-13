"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  validateUserData,
} from "@/lib/api";

export default function TestApiPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [testUserId, setTestUserId] = useState("");

  // Sample user data for testing
  const sampleUserData = {
    name: "Test User",
    aboutYou: "This is a test user created for API testing purposes.",
    birthday: "1995-06-15",
    mobileNumber: "+1234567890",
    email: "testuser@example.com",
    country: "USA",
  };

  const clearResults = () => {
    setResult(null);
    setError(null);
  };

  const executeTest = async (testFunction, testName) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      console.log(`🧪 Testing: ${testName}`);
      const startTime = Date.now();
      const response = await testFunction();
      const endTime = Date.now();

      setResult({
        testName,
        data: response,
        executionTime: endTime - startTime,
        timestamp: new Date().toLocaleString(),
      });

      console.log(
        `✅ ${testName} completed in ${endTime - startTime}ms`,
        response
      );
    } catch (err) {
      console.error(`❌ ${testName} failed:`, err);
      setError({
        testName,
        message: err.message,
        timestamp: new Date().toLocaleString(),
      });
    } finally {
      setLoading(false);
    }
  };

  // Test Functions
  const testGetUsers = () =>
    executeTest(() => getUsers(), "Get All Users (No Filters)");

  const testGetUsersWithFilters = () =>
    executeTest(
      () =>
        getUsers(
          {
            search: "test",
            // country: 'USA',
            // fromDate: '2024-01-01'
          },
          {
            page: 1,
            limit: 5,
            sortBy: "createdAt",
            sortOrder: "DESC",
          }
        ),
      "Get Users with Filters & Pagination"
    );

  const testGetUsersPagination = () =>
    executeTest(
      () =>
        getUsers(
          {},
          {
            page: 1,
            limit: 3,
            sortBy: "name",
            sortOrder: "ASC",
          }
        ),
      "Get Users with Pagination (Page 1, Limit 3)"
    );

  const testCreateUser = () =>
    executeTest(
      () =>
        createUser({
          ...sampleUserData,
          email: `test${Date.now()}@example.com`, // Unique email to avoid conflicts
        }),
      "Create New User"
    );

  const testGetUserById = () => {
    if (!testUserId) {
      setError({
        testName: "Get User by ID",
        message: "Please enter a User ID to test",
        timestamp: new Date().toLocaleString(),
      });
      return;
    }

    executeTest(
      () => getUserById(parseInt(testUserId)),
      `Get User by ID (${testUserId})`
    );
  };

  const testUpdateUser = () => {
    if (!testUserId) {
      setError({
        testName: "Update User",
        message: "Please enter a User ID to test",
        timestamp: new Date().toLocaleString(),
      });
      return;
    }

    executeTest(
      () =>
        updateUser(parseInt(testUserId), {
          name: "Updated Test User",
          aboutYou: "This user has been updated via API test.",
        }),
      `Update User (ID: ${testUserId})`
    );
  };

  const testDeleteUser = () => {
    if (!testUserId) {
      setError({
        testName: "Delete User",
        message: "Please enter a User ID to test",
        timestamp: new Date().toLocaleString(),
      });
      return;
    }

    const confirmDelete = window.confirm(
      `Are you sure you want to delete user with ID ${testUserId}? This action cannot be undone.`
    );
    if (!confirmDelete) return;

    executeTest(
      () => deleteUser(parseInt(testUserId)),
      `Delete User (ID: ${testUserId})`
    );
  };

  const testValidation = () => {
    const invalidData = {
      name: "T", // Too short
      email: "invalid-email", // Invalid format
      aboutYou: "Short", // Too short
      birthday: "", // Missing
      mobileNumber: "", // Missing
      country: "", // Missing
    };

    const errors = validateUserData(invalidData);
    setResult({
      testName: "Client-side Validation",
      data: {
        invalidData,
        validationErrors: errors,
        isValid: errors.length === 0,
      },
      executionTime: 0,
      timestamp: new Date().toLocaleString(),
    });
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">API Layer Test Page</h1>
        <p className="text-muted-foreground">
          Test all API functions to ensure proper backend integration
        </p>
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm">
            <strong>Backend URL:</strong>{" "}
            {process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"}
          </p>
          <p className="text-sm mt-1">
            Make sure your backend server is running before testing!
          </p>
        </div>
      </div>

      {/* User ID Input for specific tests */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>User ID for Testing</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 items-center">
            <Input
              type="number"
              placeholder="Enter User ID for get/update/delete tests"
              value={testUserId}
              onChange={(e) => setTestUserId(e.target.value)}
              className="max-w-xs"
            />
            <span className="text-sm text-muted-foreground">
              (Required for Get by ID, Update, Delete tests)
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <Button
          onClick={testGetUsers}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Get All Users</span>
          <span className="text-xs text-muted-foreground">
            No filters/pagination
          </span>
        </Button>

        <Button
          onClick={testGetUsersWithFilters}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Get Users (Filtered)</span>
          <span className="text-xs text-muted-foreground">
            With search & pagination
          </span>
        </Button>

        <Button
          onClick={testGetUsersPagination}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Test Pagination</span>
          <span className="text-xs text-muted-foreground">
            Page 1, Limit 3, Sort by name
          </span>
        </Button>

        <Button
          onClick={testCreateUser}
          disabled={loading}
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Create User</span>
          <span className="text-xs text-muted-foreground">Add sample user</span>
        </Button>

        <Button
          onClick={testGetUserById}
          disabled={loading || !testUserId}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Get User by ID</span>
          <span className="text-xs text-muted-foreground">
            Requires User ID
          </span>
        </Button>

        <Button
          onClick={testUpdateUser}
          disabled={loading || !testUserId}
          variant="secondary"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Update User</span>
          <span className="text-xs text-muted-foreground">
            Requires User ID
          </span>
        </Button>

        <Button
          onClick={testDeleteUser}
          disabled={loading || !testUserId}
          variant="destructive"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Delete User</span>
          <span className="text-xs text-muted-foreground">
            ⚠️ Requires User ID
          </span>
        </Button>

        <Button
          onClick={testValidation}
          disabled={loading}
          variant="outline"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Test Validation</span>
          <span className="text-xs text-muted-foreground">
            Client-side validation
          </span>
        </Button>

        <Button
          onClick={clearResults}
          variant="ghost"
          className="h-auto p-4 flex flex-col items-center gap-2"
        >
          <span className="font-semibold">Clear Results</span>
          <span className="text-xs text-muted-foreground">Reset display</span>
        </Button>
      </div>

      {/* Loading State */}
      {loading && (
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span>Running test...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Result */}
      {result && (
        <Card className="mb-6 border-green-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-green-700">
                ✅ {result.testName}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="secondary">{result.executionTime}ms</Badge>
                <Badge variant="outline">{result.timestamp}</Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-green-50 p-4 rounded-lg">
              <pre className="text-sm overflow-auto max-h-96">
                {JSON.stringify(result.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Result */}
      {error && (
        <Card className="mb-6 border-red-200">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-red-700">
                ❌ {error.testName} Failed
              </CardTitle>
              <Badge variant="destructive">{error.timestamp}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 font-medium">Error Message:</p>
              <p className="text-red-600 mt-1">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Sample User Data Display */}
      <Card>
        <CardHeader>
          <CardTitle>Sample User Data (for Create Test)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <pre className="text-sm">
              {JSON.stringify(sampleUserData, null, 2)}
            </pre>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            * Email will be automatically made unique with timestamp when
            creating
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

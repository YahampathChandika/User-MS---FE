"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusIcon, UsersIcon, RefreshCwIcon } from "lucide-react";
import SearchFilters from "@/components/SearchFilters";
import UserTable from "@/components/UserTable";
import PaginationControls from "@/components/PaginationControls";
import { getUsers } from "@/lib/api";
import { toast } from "sonner";
export default function UsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State management
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Get current filters and pagination from URL
  const getCurrentParams = useCallback(() => {
    const filters = {
      search: searchParams.get("search") || "",
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      country: searchParams.get("country") || "",
      fromDate: searchParams.get("fromDate") || "",
      toDate: searchParams.get("toDate") || "",
    };

    const paginationParams = {
      page: parseInt(searchParams.get("page")) || 1,
      limit: parseInt(searchParams.get("limit")) || 10,
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: searchParams.get("sortOrder") || "DESC",
    };

    return { filters, pagination: paginationParams };
  }, [searchParams]);

  // Fetch users from API
  const fetchUsers = useCallback(
    async (showRefreshIndicator = false) => {
      const { filters, pagination: paginationParams } = getCurrentParams();

      setError(null);
      if (showRefreshIndicator) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        console.log("Fetching users with params:", {
          filters,
          pagination: paginationParams,
        });

        const result = await getUsers(filters, paginationParams);

        setUsers(result.users || []);
        setPagination(result.pagination || {});

        console.log("Users fetched successfully:", result);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err.message || "Failed to fetch users");
        setUsers([]);
        setPagination({});

        // Error toast
        toast.error("Failed to load users", {
          description: err.message || "Unable to fetch user data",
          action: {
            label: "Retry",
            onClick: () => fetchUsers(true),
          },
        });
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getCurrentParams]
  );

  // Initial load and URL parameter changes
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle filter changes from SearchFilters component
  const handleFiltersChange = useCallback((newFilters) => {
    console.log("Filters changed:", newFilters);
    // The SearchFilters component handles URL updates,
    // which will trigger a re-fetch via useEffect
  }, []);

  // Handle sorting from UserTable component
  const handleSort = useCallback(
    (sortBy, sortOrder) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);
      params.set("page", "1"); // Reset to page 1 when sorting

      const newURL = `${window.location.pathname}?${params.toString()}`;
      router.push(newURL, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle pagination changes
  const handlePageChange = useCallback((page) => {
    console.log("Page changed to:", page);
    // PaginationControls component handles URL updates
  }, []);

  const handleLimitChange = useCallback((limit) => {
    console.log("Limit changed to:", limit);
    // PaginationControls component handles URL updates
  }, []);

  // Handle user deletion (auto-refresh)
  const handleUserDeleted = useCallback(
    (userId) => {
      console.log("User deleted:", userId);
      // Refresh the current page data
      fetchUsers(true);
    },
    [fetchUsers]
  );

  // Manual refresh
  const handleRefresh = useCallback(() => {
    fetchUsers(true);
  }, [fetchUsers]);

  // Get current sort parameters
  const currentSortBy = searchParams.get("sortBy") || "createdAt";
  const currentSortOrder = searchParams.get("sortOrder") || "DESC";

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UsersIcon className="h-8 w-8" />
            User Management
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and view all users in the system
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading || refreshing}
          >
            <RefreshCwIcon
              className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
            />
            {refreshing ? "Refreshing..." : "Refresh"}
          </Button>

          <Button asChild>
            <Link href="/users/new">
              <PlusIcon className="h-4 w-4 mr-2" />
              Add New User
            </Link>
          </Button>
        </div>
      </div>
      {/* Stats Summary */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {loading
                    ? "..."
                    : pagination.totalItems?.toLocaleString() || "0"}
                </div>
                <div className="text-sm text-muted-foreground">Total Users</div>
              </div>

              {pagination.totalPages > 0 && (
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {pagination.currentPage || 1}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    of {pagination.totalPages} pages
                  </div>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {currentSortBy && (
                <Badge variant="outline">
                  Sorted by: {currentSortBy} ({currentSortOrder})
                </Badge>
              )}

              {pagination.itemsPerPage && (
                <Badge variant="secondary">
                  {pagination.itemsPerPage} per page
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      {/* Search & Filters */}
      <SearchFilters onFiltersChange={handleFiltersChange} />
      {/* Error Display */}
      {error && (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">
              Error Loading Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCwIcon className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
      {/* Users Table */}
      <UserTable
        users={users}
        loading={loading}
        pagination={pagination}
        sortBy={currentSortBy}
        sortOrder={currentSortOrder}
        onSort={handleSort}
        onUserDeleted={handleUserDeleted}
      />
      {/* Pagination Controls */}
      <PaginationControls
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
      />
    </div>
  );
}

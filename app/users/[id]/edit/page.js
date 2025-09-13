"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeftIcon,
  UserIcon,
  EditIcon,
  AlertCircleIcon,
  RefreshCwIcon,
  CalendarIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
} from "lucide-react";
import { format } from "date-fns";
import UserForm from "@/components/UserForm";
import { getUserById } from "@/lib/api";
import { toast } from "sonner";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id;

  // State management
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch user data
  const fetchUser = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log("Fetching user with ID:", userId);
      const userData = await getUserById(parseInt(userId));
      console.log("User data fetched:", userData);
      setUser(userData);
    } catch (err) {
      console.error("Error fetching user:", err);
      setError(err.message || "Failed to fetch user data");

      // Error toast
      toast.error("Failed to load user", {
        description: err.message || "Unable to fetch user data",
        action: {
          label: "Try again",
          onClick: () => fetchUser(),
        },
      });

      // If user not found, redirect to users list after showing error
      if (err.message.includes("not found") || err.message.includes("404")) {
        toast.error("User not found", {
          description: "Redirecting to users list...",
        });
        setTimeout(() => {
          router.push("/users");
        }, 3000);
      }
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  // Handle successful user update
  const handleSuccess = (result) => {
    console.log("User updated successfully:", result);

    // Success toast with redirect notification;
    toast.success("User has been updated successfully");

    // Auto-redirect after 1.5 seconds
    setTimeout(() => {
      router.push("/users");
    }, 1500);
  };

  // Handle form cancellation
  const handleCancel = () => {
    router.push("/users");
  };

  // Handle retry after error
  const handleRetry = () => {
    fetchUser();
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "PPP");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="container mx-auto p-6">
        {/* Header Skeleton */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Skeleton className="h-10 w-10" />
            <div>
              <Skeleton className="h-8 w-64 mb-2" />
              <Skeleton className="h-4 w-96" />
            </div>
          </div>
          <Skeleton className="h-4 w-48" />
        </div>

        {/* Form Skeleton */}
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <div className="flex gap-3 pt-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto p-6">
        {/* Page Header */}
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-4">
            <Button variant="ghost" asChild className="p-2">
              <Link href="/users">
                <ArrowLeftIcon className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <EditIcon className="h-8 w-8" />
                Edit User
              </h1>
              <p className="text-muted-foreground mt-1">
                Update user information
              </p>
            </div>
          </div>

          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
            <Link
              href="/users"
              className="hover:text-foreground transition-colors"
            >
              Users
            </Link>
            <span>&gt;</span>
            <span className="text-foreground">Edit User</span>
          </nav>
        </div>

        {/* Error Display */}
        <Card className="max-w-2xl mx-auto border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive flex items-center gap-2">
              <AlertCircleIcon className="h-5 w-5" />
              Error Loading User
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive mb-4">{error}</p>

            <div className="flex gap-3">
              <Button onClick={handleRetry} variant="outline">
                <RefreshCwIcon className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button onClick={() => router.push("/users")} variant="ghost">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Users
              </Button>
            </div>

            {error.includes("not found") && (
              <p className="text-xs text-muted-foreground mt-4">
                Redirecting to users list in a few seconds...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main content when user data is loaded
  return (
    <div className="container mx-auto p-6">
      {/* Page Header */}
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-4">
          <Button variant="ghost" asChild className="p-2">
            <Link href="/users">
              <ArrowLeftIcon className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <EditIcon className="h-8 w-8" />
              Edit User
            </h1>
            <p className="text-muted-foreground mt-1">
              Update user information for {user?.name}
            </p>
          </div>
          <Badge variant="outline">ID: {user?.id}</Badge>
        </div>
      </div>

      {/* Current User Info Summary */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Current User Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{user?.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <MailIcon className="h-4 w-4 text-muted-foreground" />
                <span>{user?.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                <span>{user?.mobileNumber}</span>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <span>{user?.country}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                <span>Born: {formatDate(user?.birthday)}</span>
              </div>
              <div className="text-muted-foreground">
                Created: {formatDate(user?.createdAt)}
              </div>
            </div>
          </div>
          {user?.aboutYou && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm text-muted-foreground">
                <strong>About:</strong> {user.aboutYou}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Form */}
      <UserForm
        user={user}
        mode="edit"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Footer Info */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Last updated: {formatDate(user?.updatedAt || user?.createdAt)}
        </p>
      </div>
    </div>
  );
}

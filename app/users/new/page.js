"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeftIcon, UserPlusIcon } from "lucide-react";
import UserForm from "@/components/UserForm";
import { toast } from "sonner";

export default function AddUserPage() {
  const router = useRouter();

  // Handle successful user creation
  const handleSuccess = (result) => {
    console.log("User created successfully:", result);

    // Success toast with redirect notification
    toast.success("Redirecting to users list...", {
      description: "New user has been created successfully",
    });

    // Auto-redirect after 1.5 seconds
    setTimeout(() => {
      router.push("/users");
    }, 1500);
  };

  // Handle form cancellation
  const handleCancel = () => {
  // Check if form has unsaved changes (this would need to be passed from UserForm)
  // For now, we'll use a simple confirmation
  const hasChanges = false; // UserForm will handle this internally

  if (hasChanges) {
    toast("Unsaved changes detected", {
      description: "Are you sure you want to leave without saving?",
      action: {
        label: "Leave anyway",
        onClick: () => router.push("/users"),
      },
      cancel: {
        label: "Continue editing",
        onClick: () => {},
      },
    });
  } else {
    router.push("/users");
  }
};

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
              <UserPlusIcon className="h-8 w-8" />
              Add New User
            </h1>
            <p className="text-muted-foreground mt-1">
              Create a new user account with all required information
            </p>
          </div>
        </div>

        {/* Breadcrumb Navigation */}
        <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Link
            href="/users"
            className="hover:text-foreground transition-colors"
          >
            Users
          </Link>
          <span>&gt;</span>
          <span className="text-foreground">Add New User</span>
        </nav>
      </div>

      {/* Instructions */}
      <div className="mb-6 bg-muted/50 border rounded-lg p-4">
        <h2 className="text-sm font-medium mb-2">Instructions:</h2>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• All fields marked with * are required</li>
          <li>• Email addresses must be unique in the system</li>
          <li>
            • Mobile numbers should include country code for international
            numbers
          </li>
          <li>
            • About You section should be descriptive (minimum 10 characters)
          </li>
          <li>• Birthday cannot be in the future</li>
        </ul>
      </div>

      {/* User Form */}
      <UserForm
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />

      {/* Footer Help */}
      <div className="mt-8 text-center">
        <p className="text-sm text-muted-foreground">
          Need help? Check our{" "}
          <Link href="#" className="text-primary hover:underline">
            user management guide
          </Link>{" "}
          or{" "}
          <Link href="#" className="text-primary hover:underline">
            contact support
          </Link>
        </p>
      </div>
    </div>
  );
}

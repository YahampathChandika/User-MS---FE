"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  ChevronDownIcon,
  SaveIcon,
  XIcon,
  UserIcon,
  MailIcon,
  PhoneIcon,
  MapPinIcon,
  InfoIcon,
  AlertCircleIcon,
  CheckCircleIcon,
  ArrowLeftIcon,
} from "lucide-react";
import { format } from "date-fns";
import { createUser, updateUser, formatDateForAPI } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function UserForm({
  user = null,
  mode = "create", // 'create' or 'edit'
  onSuccess,
  onCancel,
  className,
}) {
  const router = useRouter();
  const isEditMode = mode === "edit" && user;

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    aboutYou: "",
    birthday: null,
    mobileNumber: "",
    email: "",
    country: "",
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [touched, setTouched] = useState({});

  // Initialize form with user data for edit mode
  useEffect(() => {
    if (isEditMode && user) {
      setFormData({
        name: user.name || "",
        aboutYou: user.aboutYou || "",
        birthday: user.birthday ? new Date(user.birthday) : null,
        mobileNumber: user.mobileNumber || "",
        email: user.email || "",
        country: user.country || "",
      });
    }
  }, [isEditMode, user]);

  // Validation rules matching backend validation
  const validateField = (name, value) => {
    switch (name) {
      case "name":
        if (!value || value.trim().length < 2) {
          return "Name is required and must be at least 2 characters";
        }
        if (value.length > 50) {
          return "Name must be 50 characters or less";
        }
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          return "Name should only contain letters and spaces";
        }
        return "";

      case "aboutYou":
        if (!value || value.trim().length < 10) {
          return "About You is required and must be at least 10 characters";
        }
        if (value.length > 250) {
          return "About You must be 250 characters or less";
        }
        return "";

      case "birthday":
        if (!value) {
          return "Birthday is required";
        }
        if (value > new Date()) {
          return "Birthday cannot be in the future";
        }
        const age = new Date().getFullYear() - value.getFullYear();
        if (age > 120) {
          return "Invalid age";
        }
        return "";

      case "mobileNumber":
        if (!value || value.trim().length < 10) {
          return "Mobile number is required and must be at least 10 characters";
        }
        if (!/^[+]?[\d\s\-\(\)]{10,15}$/.test(value)) {
          return "Invalid mobile number format";
        }
        return "";

      case "email":
        if (!value || value.trim() === "") {
          return "Email is required";
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          return "Invalid email format";
        }
        return "";

      case "country":
        if (!value || value.trim().length < 2) {
          return "Country is required and must be at least 2 characters";
        }
        if (value.length > 20) {
          return "Country must be 20 characters or less";
        }
        if (!/^[a-zA-Z\s]+$/.test(value)) {
          return "Country should only contain letters and spaces";
        }
        return "";

      default:
        return "";
    }
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Validate field if it has been touched
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }
  };

  // Handle field blur (touched)
  const handleBlur = (name) => {
    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, formData[name]);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all fields
    const formErrors = validateForm();
    setErrors(formErrors);
    setTouched({
      name: true,
      aboutYou: true,
      birthday: true,
      mobileNumber: true,
      email: true,
      country: true,
    });

    // Stop if there are validation errors
    if (Object.keys(formErrors).length > 0) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setLoading(true);

    try {
      // Prepare data for API
      const apiData = {
        ...formData,
        birthday: formatDateForAPI(formData.birthday),
      };

      let result;
      if (isEditMode) {
        result = await updateUser(user.id, apiData);
        toast.success("User updated successfully!", {
          description: `${formData.name} has been updated`,
          action: {
            label: "View Users",
            onClick: () => router.push("/users"),
          },
        });
      } else {
        result = await createUser(apiData);
        toast.success("User created successfully!", {
          description: `${formData.name} has been added to the system`,
          action: {
            label: "View Users",
            onClick: () => router.push("/users"),
          },
        });
      }

      console.log(
        `User ${isEditMode ? "updated" : "created"} successfully:`,
        result
      );

      // Call success callback or redirect
      if (onSuccess) {
        onSuccess(result);
      } else {
        // Auto-redirect after 1.5 seconds
        setTimeout(() => {
          router.push("/users");
        }, 1500);
      }
    } catch (error) {
      console.error(
        `Error ${isEditMode ? "updating" : "creating"} user:`,
        error
      );

      // Handle server validation errors with specific toasts
      if (error.message.includes("email already exists")) {
        setErrors((prev) => ({
          ...prev,
          email: "A user with this email already exists",
        }));
        toast.error("Email already exists", {
          description: "A user with this email address is already registered",
        });
      } else if (error.message.includes("mobile number")) {
        setErrors((prev) => ({
          ...prev,
          mobileNumber: "A user with this mobile number already exists",
        }));
        toast.error("Mobile number already exists", {
          description: "A user with this mobile number is already registered",
        });
      } else {
        // Generic error
        setErrors((prev) => ({
          ...prev,
          general:
            error.message ||
            `Failed to ${isEditMode ? "update" : "create"} user`,
        }));
        toast.error(`Failed to ${isEditMode ? "update" : "create"} user`, {
          description: error.message || "An unexpected error occurred",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle cancel with confirmation if there are unsaved changes
  const handleCancel = () => {
    if (hasChanges()) {
      toast("Unsaved changes detected", {
        description: "Are you sure you want to leave without saving?",
        action: {
          label: "Leave anyway",
          onClick: () => {
            if (onCancel) {
              onCancel();
            } else {
              router.push("/users");
            }
          },
        },
        cancel: {
          label: "Continue editing",
          onClick: () => {},
        },
      });
    } else {
      if (onCancel) {
        onCancel();
      } else {
        router.push("/users");
      }
    }
  };

  // Check if form has unsaved changes
  const hasChanges = () => {
    if (!isEditMode) {
      return Object.values(formData).some(
        (value) => value && (typeof value === "string" ? value.trim() : true)
      );
    }

    // For edit mode, compare with original user data
    return (
      formData.name !== (user?.name || "") ||
      formData.aboutYou !== (user?.aboutYou || "") ||
      formData.email !== (user?.email || "") ||
      formData.mobileNumber !== (user?.mobileNumber || "") ||
      formData.country !== (user?.country || "") ||
      formatDateForAPI(formData.birthday) !==
        formatDateForAPI(user?.birthday ? new Date(user.birthday) : null)
    );
  };

  return (
    <div className={cn("w-full max-w-2xl mx-auto", className)}>
      {/* Form Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-6 w-6" />
              {isEditMode ? `Edit User - ${user?.name}` : "Add New User"}
            </CardTitle>
            {isEditMode && <Badge variant="outline">ID: {user?.id}</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircleIcon className="h-5 w-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-sm text-red-600 mt-1">{errors.general}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <UserIcon className="h-4 w-4" />
                Name *
              </label>
              <Input
                placeholder="Enter full name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                onBlur={() => handleBlur("name")}
                className={errors.name ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.name && (
                <p className="text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MailIcon className="h-4 w-4" />
                Email *
              </label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                onBlur={() => handleBlur("email")}
                className={errors.email ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.email && (
                <p className="text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            {/* Mobile Number Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <PhoneIcon className="h-4 w-4" />
                Mobile Number *
              </label>
              <Input
                placeholder="Enter mobile number"
                value={formData.mobileNumber}
                onChange={(e) =>
                  handleInputChange("mobileNumber", e.target.value)
                }
                onBlur={() => handleBlur("mobileNumber")}
                className={errors.mobileNumber ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.mobileNumber && (
                <p className="text-sm text-red-600">{errors.mobileNumber}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Include country code if international (e.g., +1234567890)
              </p>
            </div>

            {/* Country Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPinIcon className="h-4 w-4" />
                Country *
              </label>
              <Input
                placeholder="Enter country"
                value={formData.country}
                onChange={(e) => handleInputChange("country", e.target.value)}
                onBlur={() => handleBlur("country")}
                className={errors.country ? "border-red-500" : ""}
                disabled={loading}
              />
              {errors.country && (
                <p className="text-sm text-red-600">{errors.country}</p>
              )}
            </div>

            {/* Birthday Field - NEW CALENDAR IMPLEMENTATION */}
            <div className="space-y-3">
              <Label
                htmlFor="birthday"
                className="text-sm font-medium flex items-center gap-2"
              >
                <CalendarIcon className="h-4 w-4" />
                Date of birth *
              </Label>
              <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    id="birthday"
                    className={cn(
                      "w-full justify-between font-normal",
                      !formData.birthday && "text-muted-foreground",
                      errors.birthday && "border-red-500"
                    )}
                    disabled={loading}
                  >
                    {formData.birthday
                      ? formData.birthday.toLocaleDateString()
                      : "Select date"}
                    <ChevronDownIcon className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="start"
                >
                  <Calendar
                    mode="single"
                    selected={formData.birthday}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      if (date) {
                        handleInputChange("birthday", date);
                        // Clear the birthday error immediately when a date is selected
                        setErrors((prev) => ({
                          ...prev,
                          birthday: "",
                        }));
                        setTouched((prev) => ({
                          ...prev,
                          birthday: true,
                        }));
                      }
                      setCalendarOpen(false);
                    }}
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              {errors.birthday && (
                <p className="text-sm text-red-600">{errors.birthday}</p>
              )}
            </div>

            {/* About You Field */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <InfoIcon className="h-4 w-4" />
                About You *
              </label>
              <textarea
                placeholder="Tell us about yourself (minimum 10 characters)"
                value={formData.aboutYou}
                onChange={(e) => handleInputChange("aboutYou", e.target.value)}
                onBlur={() => handleBlur("aboutYou")}
                className={cn(
                  "flex min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
                  errors.aboutYou && "border-red-500"
                )}
                disabled={loading}
                rows={4}
              />
              <div className="flex justify-between">
                {errors.aboutYou && (
                  <p className="text-sm text-red-600">{errors.aboutYou}</p>
                )}
                <p className="text-xs text-muted-foreground ml-auto">
                  {formData.aboutYou.length}/250 characters
                </p>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t">
              <Button
                type="submit"
                disabled={
                  loading ||
                  Object.keys(errors).some(
                    (key) => key !== "general" && errors[key]
                  )
                }
                className="flex-1"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                    {isEditMode ? "Updating..." : "Creating..."}
                  </>
                ) : (
                  <>
                    <SaveIcon className="h-4 w-4 mr-2" />
                    {isEditMode ? "Update User" : "Create User"}
                  </>
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="flex-1"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>

            {/* Unsaved Changes Warning */}
            {hasChanges() && !loading && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-700">
                  <AlertCircleIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">Unsaved Changes</span>
                </div>
                <p className="text-xs text-amber-600 mt-1">
                  You have unsaved changes. Make sure to save before leaving.
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

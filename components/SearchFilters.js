"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { CalendarIcon, SearchIcon, XIcon, FilterIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function SearchFilters({ onFiltersChange, className }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    name: "",
    email: "",
    country: "",
    fromDate: null,
    toDate: null,
  });

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  // Initialize filters from URL parameters on component mount
  useEffect(() => {
    const initialFilters = {
      search: searchParams.get("search") || "",
      name: searchParams.get("name") || "",
      email: searchParams.get("email") || "",
      country: searchParams.get("country") || "",
      fromDate: searchParams.get("fromDate")
        ? new Date(searchParams.get("fromDate"))
        : null,
      toDate: searchParams.get("toDate")
        ? new Date(searchParams.get("toDate"))
        : null,
    };

    setFilters(initialFilters);

    // Show advanced filters if any advanced filter is set
    const hasAdvancedFilters =
      initialFilters.name ||
      initialFilters.email ||
      initialFilters.country ||
      initialFilters.fromDate ||
      initialFilters.toDate;
    setShowAdvanced(hasAdvancedFilters);

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(initialFilters);
    }
  }, []);

  // Update URL and notify parent when filters change
  const updateFiltersAndURL = (newFilters) => {
    setFilters(newFilters);

    // Create URL search params
    const params = new URLSearchParams();

    // Add non-empty filters to URL
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) {
        if (key === "fromDate" || key === "toDate") {
          // Format dates as YYYY-MM-DD for URL
          params.set(key, format(value, "yyyy-MM-dd"));
        } else if (typeof value === "string" && value.trim()) {
          params.set(key, value.trim());
        }
      }
    });

    // Reset to page 1 when filters change
    params.set("page", "1");

    // Update URL without page reload
    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });

    // Notify parent component
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  // Handle input changes with debouncing for search
  const handleFilterChange = (filterName, value) => {
    const newFilters = {
      ...filters,
      [filterName]: value,
    };

    updateFiltersAndURL(newFilters);
  };

  // Clear all filters
  const clearAllFilters = () => {
    const clearedFilters = {
      search: "",
      name: "",
      email: "",
      country: "",
      fromDate: null,
      toDate: null,
    };

    updateFiltersAndURL(clearedFilters);
    setShowAdvanced(false);
  };

  // Clear specific filter
  const clearFilter = (filterName) => {
    handleFilterChange(filterName, filterName.includes("Date") ? null : "");
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(
    (value) => value && (typeof value === "string" ? value.trim() : true)
  );

  // Get count of active filters
  const activeFilterCount = Object.values(filters).filter(
    (value) => value && (typeof value === "string" ? value.trim() : true)
  ).length;

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FilterIcon className="h-5 w-5" />
            Search & Filters
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {activeFilterCount}
              </Badge>
            )}
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <XIcon className="h-4 w-4 mr-1" />
                Clear All
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
            >
              {showAdvanced ? "Hide" : "Show"} Advanced
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Global Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users (name, email, about, country)..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="pl-10 pr-10"
          />
          {filters.search && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => clearFilter("search")}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
            >
              <XIcon className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Advanced Filters */}
        {showAdvanced && (
          <div className="space-y-4 pt-4 border-t">
            {/* Date Range Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* From Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">From Date</label>
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.fromDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.fromDate ? (
                        format(filters.fromDate, "PPP")
                      ) : (
                        <span>Pick start date</span>
                      )}
                      {filters.fromDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFilter("fromDate");
                          }}
                          className="ml-auto h-6 w-6 p-0 hover:bg-muted"
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.fromDate}
                      onSelect={(date) => {
                        handleFilterChange("fromDate", date);
                        setFromDateOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() ||
                        (filters.toDate && date > filters.toDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* To Date */}
              <div className="space-y-2">
                <label className="text-sm font-medium">To Date</label>
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !filters.toDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {filters.toDate ? (
                        format(filters.toDate, "PPP")
                      ) : (
                        <span>Pick end date</span>
                      )}
                      {filters.toDate && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            clearFilter("toDate");
                          }}
                          className="ml-auto h-6 w-6 p-0 hover:bg-muted"
                        >
                          <XIcon className="h-3 w-3" />
                        </Button>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={filters.toDate}
                      onSelect={(date) => {
                        handleFilterChange("toDate", date);
                        setToDateOpen(false);
                      }}
                      disabled={(date) =>
                        date > new Date() ||
                        (filters.fromDate && date < filters.fromDate)
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        )}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t">
            <span className="text-sm text-muted-foreground">
              Active filters:
            </span>
            {filters.search && (
              <Badge variant="secondary" className="gap-1">
                Search: "{filters.search}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("search")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.name && (
              <Badge variant="secondary" className="gap-1">
                Name: "{filters.name}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("name")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.email && (
              <Badge variant="secondary" className="gap-1">
                Email: "{filters.email}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("email")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.country && (
              <Badge variant="secondary" className="gap-1">
                Country: "{filters.country}"
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("country")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.fromDate && (
              <Badge variant="secondary" className="gap-1">
                From: {format(filters.fromDate, "MMM d, yyyy")}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("fromDate")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
            {filters.toDate && (
              <Badge variant="secondary" className="gap-1">
                To: {format(filters.toDate, "MMM d, yyyy")}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearFilter("toDate")}
                  className="h-4 w-4 p-0 hover:bg-muted ml-1"
                >
                  <XIcon className="h-3 w-3" />
                </Button>
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

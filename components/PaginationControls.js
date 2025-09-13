"use client";

import { useRouter, useSearchParams } from "next/navigation";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export default function PaginationControls({
  pagination = {},
  onPageChange,
  onLimitChange,
  className,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract pagination data with defaults
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    itemsPerPage = 10,
    hasNextPage = false,
    hasPrevPage = false,
    nextPage = null,
    prevPage = null,
  } = pagination;

  // Available items per page options
  const limitOptions = [
    { value: 10, label: "10 per page" },
    { value: 25, label: "25 per page" },
    { value: 50, label: "50 per page" },
    { value: 100, label: "100 per page" },
  ];

  // Calculate display range
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Update URL with new page/limit
  const updateURL = (newPage, newLimit = itemsPerPage) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    params.set("limit", newLimit.toString());

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;

    updateURL(page);

    if (onPageChange) {
      onPageChange(page);
    }
  };

  // Handle limit change
  const handleLimitChange = (newLimit) => {
    const numericLimit = parseInt(newLimit);

    // Reset to page 1 when changing limit
    updateURL(1, numericLimit);

    if (onLimitChange) {
      onLimitChange(numericLimit);
    }
  };

  // Generate page numbers for pagination
  const generatePageNumbers = () => {
    const delta = 2; // Number of pages to show around current page
    const pages = [];
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);

    // Always show first page
    if (start > 1) {
      pages.push(1);
      if (start > 2) {
        pages.push("ellipsis-start");
      }
    }

    // Show pages around current page
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    // Always show last page
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push("ellipsis-end");
      }
      pages.push(totalPages);
    }

    return pages;
  };

  // Don't render if no data
  if (totalItems === 0) {
    return null;
  }

  const pageNumbers = generatePageNumbers();

  return (
    <Card className={cn("w-full", className)}>
      <CardContent className="pt-4">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          {/* Results Summary */}
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <span>
              Showing {startItem.toLocaleString()} to {endItem.toLocaleString()}{" "}
              of{" "}
              <Badge variant="secondary" className="mx-1">
                {totalItems.toLocaleString()}
              </Badge>
              results
            </span>
          </div>

          {/* Items Per Page Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Show:</span>
            <Select
              value={itemsPerPage.toString()}
              onValueChange={handleLimitChange}
            >
              <SelectTrigger className="w-[130px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {limitOptions.map((option) => (
                  <SelectItem
                    key={option.value}
                    value={option.value.toString()}
                  >
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Pagination Navigation */}
        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                {/* Previous Button */}
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasPrevPage) {
                        handlePageChange(prevPage);
                      }
                    }}
                    className={cn(
                      !hasPrevPage && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>

                {/* Page Numbers */}
                {pageNumbers.map((page, index) => (
                  <PaginationItem key={`${page}-${index}`}>
                    {page === "ellipsis-start" || page === "ellipsis-end" ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={page === currentPage}
                        onClick={(e) => {
                          e.preventDefault();
                          handlePageChange(page);
                        }}
                        className={cn(
                          page === currentPage &&
                            "bg-primary text-primary-foreground"
                        )}
                      >
                        {page}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}

                {/* Next Button */}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      if (hasNextPage) {
                        handlePageChange(nextPage);
                      }
                    }}
                    className={cn(
                      !hasNextPage && "pointer-events-none opacity-50"
                    )}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        {/* Additional Page Info */}
        {totalPages > 1 && (
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-4">
              <span>
                Page {currentPage} of {totalPages}
              </span>
              {totalPages > 10 && <span>({totalPages} total pages)</span>}
            </div>

            {/* Quick Jump Info for Large Datasets */}
            {totalPages > 20 && (
              <div className="mt-2 sm:mt-0">
                <span>Use URL: ?page=N for quick navigation</span>
              </div>
            )}
          </div>
        )}

        {/* Mobile Pagination Summary */}
        <div className="mt-4 sm:hidden">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <Badge variant="outline">
              Page {currentPage}/{totalPages}
            </Badge>
            <div className="flex space-x-2">
              {hasPrevPage && (
                <button
                  onClick={() => handlePageChange(prevPage)}
                  className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                >
                  ← Prev
                </button>
              )}
              {hasNextPage && (
                <button
                  onClick={() => handlePageChange(nextPage)}
                  className="px-2 py-1 bg-muted rounded text-xs hover:bg-muted/80"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Helper hook for pagination state management
export function usePagination(initialPage = 1, initialLimit = 10) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentPage = parseInt(searchParams.get("page")) || initialPage;
  const currentLimit = parseInt(searchParams.get("limit")) || initialLimit;

  const updatePagination = (page, limit = currentLimit) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", page.toString());
    params.set("limit", limit.toString());

    const newURL = `${window.location.pathname}?${params.toString()}`;
    router.push(newURL, { scroll: false });
  };

  const goToPage = (page) => {
    updatePagination(page);
  };

  const changeLimit = (limit) => {
    updatePagination(1, limit); // Reset to page 1 when changing limit
  };

  const nextPage = (totalPages) => {
    if (currentPage < totalPages) {
      goToPage(currentPage + 1);
    }
  };

  const previousPage = () => {
    if (currentPage > 1) {
      goToPage(currentPage - 1);
    }
  };

  return {
    currentPage,
    currentLimit,
    goToPage,
    changeLimit,
    nextPage,
    previousPage,
    updatePagination,
  };
}

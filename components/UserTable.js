"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  EditIcon,
  TrashIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserIcon,
  CalendarIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  InfoIcon,
} from "lucide-react";
import { format } from "date-fns";
import { deleteUser } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function UserTable({
  users = [],
  loading = false,
  pagination = {},
  sortBy = "createdAt",
  sortOrder = "DESC",
  onSort,
  onUserDeleted,
  className,
}) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Handle sort column click
  const handleSort = (column) => {
    if (!onSort) return;

    let newOrder = "DESC";
    if (sortBy === column) {
      // Toggle sort order if same column
      newOrder = sortOrder === "DESC" ? "ASC" : "DESC";
    }

    onSort(column, newOrder);
  };

  // Get sort icon for column
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <ArrowUpDownIcon className="h-4 w-4 opacity-50" />;
    }
    return sortOrder === "ASC" ? (
      <ArrowUpIcon className="h-4 w-4" />
    ) : (
      <ArrowDownIcon className="h-4 w-4" />
    );
  };

  // Handle delete user
  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setDeleting(true);
    try {
      await deleteUser(userToDelete.id);

      // Notify parent component
      if (onUserDeleted) {
        onUserDeleted(userToDelete.id);
      }

      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      // You could add toast notification here
      alert(`Error deleting user: ${error.message}`);
    } finally {
      setDeleting(false);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Format birthday
  const formatBirthday = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  // Truncate text for mobile view
  const truncateText = (text, maxLength = 50) => {
    if (!text) return "N/A";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  // Loading skeleton rows
  const SkeletonRow = () => (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
      </TableCell>
    </TableRow>
  );

  // Mobile card view for responsive design
  const MobileCard = ({ user }) => (
    <Card key={user.id} className="mb-4 md:hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <UserIcon className="h-5 w-5" />
            {user.name}
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            ID: {user.id}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Email */}
        <div className="flex items-center gap-2 text-sm">
          <MailIcon className="h-4 w-4 text-muted-foreground" />
          <span>{user.email}</span>
        </div>

        {/* Phone */}
        <div className="flex items-center gap-2 text-sm">
          <PhoneIcon className="h-4 w-4 text-muted-foreground" />
          <span>{user.mobileNumber}</span>
        </div>

        {/* Country */}
        <div className="flex items-center gap-2 text-sm">
          <MapPinIcon className="h-4 w-4 text-muted-foreground" />
          <span>{user.country}</span>
        </div>

        {/* Birthday */}
        <div className="flex items-center gap-2 text-sm">
          <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          <span>Born: {formatBirthday(user.birthday)}</span>
        </div>

        {/* About */}
        <div className="flex items-start gap-2 text-sm">
          <InfoIcon className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="text-muted-foreground">
            {truncateText(user.aboutYou, 100)}
          </span>
        </div>

        {/* Created Date */}
        <div className="text-xs text-muted-foreground">
          Created: {formatDate(user.createdAt)}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button size="sm" variant="outline" asChild className="flex-1">
            <Link href={`/users/${user.id}/edit`}>
              <EditIcon className="h-4 w-4 mr-1" />
              Edit
            </Link>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDeleteClick(user)}
            className="flex-1"
          >
            <TrashIcon className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <div className={cn("w-full", className)}>
        {/* Mobile Cards View */}
        <div className="md:hidden">
          {loading ? (
            // Mobile loading skeletons
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="mb-4">
                <CardHeader>
                  <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </CardContent>
              </Card>
            ))
          ) : users.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground">
                  No users found
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Try adjusting your search or filter criteria
                </p>
              </CardContent>
            </Card>
          ) : (
            users.map((user) => <MobileCard key={user.id} user={user} />)
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center gap-1">
                      Name
                      {getSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("email")}
                  >
                    <div className="flex items-center gap-1">
                      Email
                      {getSortIcon("email")}
                    </div>
                  </TableHead>
                  <TableHead>About</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("birthday")}
                  >
                    <div className="flex items-center gap-1">
                      Birthday
                      {getSortIcon("birthday")}
                    </div>
                  </TableHead>
                  <TableHead>Mobile</TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("country")}
                  >
                    <div className="flex items-center gap-1">
                      Country
                      {getSortIcon("country")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="cursor-pointer hover:bg-muted/50 select-none"
                    onClick={() => handleSort("createdAt")}
                  >
                    <div className="flex items-center gap-1">
                      Created
                      {getSortIcon("createdAt")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  // Loading skeleton rows
                  Array.from({ length: 5 }).map((_, index) => (
                    <SkeletonRow key={index} />
                  ))
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12">
                      <UserIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium text-muted-foreground">
                        No users found
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{user.name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <span
                          className="text-sm text-muted-foreground"
                          title={user.aboutYou}
                        >
                          {truncateText(user.aboutYou, 40)}
                        </span>
                      </TableCell>
                      <TableCell>{formatBirthday(user.birthday)}</TableCell>
                      <TableCell>{user.mobileNumber}</TableCell>
                      <TableCell>{user.country}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/users/${user.id}/edit`}>
                              <EditIcon className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteClick(user)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>

          {userToDelete && (
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <div>
                <strong>Name:</strong> {userToDelete.name}
              </div>
              <div>
                <strong>Email:</strong> {userToDelete.email}
              </div>
              <div>
                <strong>ID:</strong> {userToDelete.id}
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete User"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

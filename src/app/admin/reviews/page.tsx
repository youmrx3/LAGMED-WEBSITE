"use client";

import { useEffect, useState } from "react";
import { CheckCircle, XCircle, Trash2, Star, Clock, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import type { Review } from "@/lib/types";
import { format } from "date-fns";
import { useToastStore } from "@/lib/toast-store";

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "approved">("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const fetchReviews = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("reviews")
      .select("*")
      .order("created_at", { ascending: false });

    if (filter === "pending") {
      query = query.eq("status", "pending");
    } else if (filter === "approved") {
      query = query.eq("status", "approved");
    }

    const { data } = await query;
    if (data) setReviews(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchReviews();
  }, [filter]);

  const approveReview = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").update({ status: "approved" }).eq("id", id);
    if (error) {
      addToast("error", "Failed to approve review.");
    } else {
      addToast("success", "Review approved! It will now appear on the homepage.");
    }
    fetchReviews();
  };

  const rejectReview = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("reviews").update({ status: "rejected" }).eq("id", id);
    if (error) {
      addToast("error", "Failed to reject review.");
    } else {
      addToast("info", "Review rejected.");
    }
    fetchReviews();
  };

  const deleteReview = async (id: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("reviews").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete review.");
    } else {
      addToast("success", "Review deleted successfully!");
    }
    fetchReviews();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected review(s)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some reviews.");
    } else {
      addToast("success", `${selectedIds.size} review(s) deleted!`);
    }
    setSelectedIds(new Set());
    fetchReviews();
  };

  const bulkApprove = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("reviews")
      .update({ status: "approved" })
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to approve some reviews.");
    } else {
      addToast("success", `${selectedIds.size} review(s) approved!`);
    }
    setSelectedIds(new Set());
    fetchReviews();
  };

  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const approvedCount = reviews.filter((r) => r.status === "approved").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Client Reviews</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage and approve client reviews. Approved reviews appear on the homepage.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card
          className={`cursor-pointer transition-all ${filter === "all" ? "ring-2 ring-navy-500" : ""}`}
          onClick={() => setFilter("all")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
            <p className="text-sm text-gray-500">Total</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${filter === "pending" ? "ring-2 ring-yellow-500" : ""}`}
          onClick={() => setFilter("pending")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
            <p className="text-sm text-gray-500">Pending</p>
          </CardContent>
        </Card>
        <Card
          className={`cursor-pointer transition-all ${filter === "approved" ? "ring-2 ring-green-500" : ""}`}
          onClick={() => setFilter("approved")}
        >
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{approvedCount}</p>
            <p className="text-sm text-gray-500">Approved</p>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : reviews.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No reviews found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card
              key={review.id}
              className={`transition-all ${
                review.status === "pending"
                  ? "border-l-4 border-l-yellow-400"
                  : review.status === "approved"
                    ? "border-l-4 border-l-green-400"
                    : "border-l-4 border-l-red-400"
              } ${selectedIds.has(review.id) ? "ring-2 ring-navy-500 bg-navy-50" : ""}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(review.id)}
                      onChange={() => toggleSelect(review.id)}
                      className="rounded border-gray-300 text-navy-600 focus:ring-navy-500 mt-1 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-navy-500 to-navy-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                        {review.name
                          .split(" ")
                          .map((w) => w[0])
                          .join("")
                          .substring(0, 2)
                          .toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{review.name}</h3>
                        <p className="text-xs text-gray-500">
                          {review.company}
                        </p>
                      </div>
                      <Badge variant={review.status === "approved" ? "success" : review.status === "pending" ? "warning" : "error"} className="ml-auto flex-shrink-0">
                        {review.status.charAt(0).toUpperCase() + review.status.slice(1)}
                      </Badge>
                    </div>

                    <div className="flex gap-0.5 mb-2">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      &ldquo;{review.comment}&rdquo;
                    </p>

                    <p className="text-xs text-gray-400 mt-2 flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(review.created_at), "MMM d, yyyy 'at' h:mm a")}
                    </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-gray-100">
                  {review.status === "pending" ? (
                    <Button
                      size="sm"
                      onClick={() => approveReview(review.id)}
                      className="gap-1.5 bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      Approve
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => rejectReview(review.id)}
                      className="gap-1.5"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                      Unapprove
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteReview(review.id)}
                    className="gap-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={reviews.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(reviews.map((r) => r.id)))}
        actions={[
          {
            label: "Approve",
            icon: <CheckCircle className="h-4 w-4" />,
            onClick: bulkApprove,
            variant: "success",
          },
          {
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            onClick: bulkDelete,
            variant: "danger",
          },
        ]}
      />
    </div>
  );
}

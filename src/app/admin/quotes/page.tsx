"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Trash2, CheckCircle2, Eye, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { BulkActionBar } from "@/components/ui/bulk-action-bar";
import { createClient } from "@/lib/supabase/client";
import type { QuoteRequest } from "@/lib/types";
import { useToastStore } from "@/lib/toast-store";

export default function AdminQuotesPage() {
  const [quotes, setQuotes] = useState<QuoteRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<QuoteRequest | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const { addToast } = useToastStore();

  const fetchQuotes = async () => {
    setLoading(true);
    const supabase = createClient();
    let query = supabase
      .from("quote_requests")
      .select("*, product:products(name)")
      .order("created_at", { ascending: false });

    if (statusFilter) {
      query = query.eq("status", statusFilter);
    }

    const { data } = await query;
    if (data) setQuotes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchQuotes();
  }, [statusFilter]);

  const updateStatus = async (id: string, status: string) => {
    const supabase = createClient();
    await supabase.from("quote_requests").update({ status }).eq("id", id);
    addToast("success", `Quote status updated to "${status}".`);
    fetchQuotes();
  };

  const deleteQuote = async (id: string) => {
    if (!confirm("Delete this quote request?")) return;
    const supabase = createClient();
    const { error } = await supabase.from("quote_requests").delete().eq("id", id);
    if (error) {
      addToast("error", "Failed to delete quote request.");
    } else {
      addToast("success", "Quote request deleted!");
    }
    fetchQuotes();
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === quotes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(quotes.map((q) => q.id)));
    }
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selectedIds.size} selected quote(s)?`)) return;
    const supabase = createClient();
    const { error } = await supabase
      .from("quote_requests")
      .delete()
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to delete some quotes.");
    } else {
      addToast("success", `${selectedIds.size} quote(s) deleted!`);
    }
    setSelectedIds(new Set());
    fetchQuotes();
  };

  const bulkMarkContacted = async () => {
    const supabase = createClient();
    const { error } = await supabase
      .from("quote_requests")
      .update({ status: "contacted" })
      .in("id", Array.from(selectedIds));
    if (error) {
      addToast("error", "Failed to update some quotes.");
    } else {
      addToast("success", `${selectedIds.size} quote(s) marked as contacted!`);
    }
    setSelectedIds(new Set());
    fetchQuotes();
  };

  const statusVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "contacted":
        return "info";
      case "completed":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900">Quote Requests</h1>
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <Select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-40"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="contacted">Contacted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-lg">
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Quote Details</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuote(null)}
                >
                  Close
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{selectedQuote.name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Company</p>
                    <p className="font-medium">{selectedQuote.company || "—"}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{selectedQuote.email}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{selectedQuote.phone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Quantity</p>
                    <p className="font-medium">{selectedQuote.quantity}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Status</p>
                    <Badge variant={statusVariant(selectedQuote.status)}>
                      {selectedQuote.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-gray-500">Product</p>
                    <p className="font-medium">
                      {selectedQuote.product?.name || "General Inquiry"}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date</p>
                    <p className="font-medium">
                      {format(new Date(selectedQuote.created_at), "PPP")}
                    </p>
                  </div>
                </div>
                {selectedQuote.notes && (
                  <div>
                    <p className="text-gray-500">Notes</p>
                    <p className="font-medium">{selectedQuote.notes}</p>
                  </div>
                )}
              </div>
              <div className="flex gap-2 pt-2">
                {selectedQuote.status === "pending" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateStatus(selectedQuote.id, "contacted");
                      setSelectedQuote(null);
                    }}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Contacted
                  </Button>
                )}
                {selectedQuote.status === "contacted" && (
                  <Button
                    size="sm"
                    onClick={() => {
                      updateStatus(selectedQuote.id, "completed");
                      setSelectedQuote(null);
                    }}
                    className="gap-1"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Mark Completed
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {loading ? (
        <div className="text-center py-8 text-gray-500">Loading...</div>
      ) : quotes.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">No quote requests found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left w-10">
                    <input
                      type="checkbox"
                      checked={quotes.length > 0 && selectedIds.size === quotes.length}
                      onChange={toggleSelectAll}
                      className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                    />
                  </th>
                  <th className="px-4 py-3 text-left">Name</th>
                  <th className="px-4 py-3 text-left">Contact</th>
                  <th className="px-4 py-3 text-left">Product</th>
                  <th className="px-4 py-3 text-left">Qty</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {quotes.map((quote) => (
                  <tr key={quote.id} className={`hover:bg-gray-50 ${selectedIds.has(quote.id) ? "bg-navy-50" : ""}`}>
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(quote.id)}
                        onChange={() => toggleSelect(quote.id)}
                        className="rounded border-gray-300 text-navy-600 focus:ring-navy-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{quote.name}</p>
                      <p className="text-xs text-gray-500">{quote.company || ""}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-600">{quote.email}</p>
                      <p className="text-xs text-gray-500">{quote.phone}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {quote.product?.name || "General"}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{quote.quantity}</td>
                    <td className="px-4 py-3">
                      <Badge variant={statusVariant(quote.status)}>
                        {quote.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {format(new Date(quote.created_at), "PP")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {quote.status === "pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => updateStatus(quote.id, "contacted")}
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteQuote(quote.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      <BulkActionBar
        selectedCount={selectedIds.size}
        totalCount={quotes.length}
        onClearSelection={() => setSelectedIds(new Set())}
        onSelectAll={() => setSelectedIds(new Set(quotes.map((q) => q.id)))}
        actions={[
          {
            label: "Mark Contacted",
            icon: <CheckCircle2 className="h-4 w-4" />,
            onClick: bulkMarkContacted,
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

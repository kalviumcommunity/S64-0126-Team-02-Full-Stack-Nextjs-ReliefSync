"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface ReliefRequest {
  id: string;
  title: string;
  description: string;
  status: "pending" | "active" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  location: string;
  createdAt: string;
}

export default function RequestsPage() {
  const [requests, setRequests] = useState<ReliefRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "active" | "pending" | "completed"
  >("all");
  const router = useRouter();

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/allocations");
        if (!response.ok) {
          router.push("/login");
          return;
        }

        await response.json();

        // Use mock data for now - replace with actual API data
        setRequests([
          {
            id: "1",
            title: "Medical Supply Shortage",
            description:
              "Critical need for antibiotics and IV fluids in emergency ward",
            status: "active",
            priority: "critical",
            location: "Central Hospital, Downtown",
            createdAt: new Date().toISOString(),
          },
          {
            id: "2",
            title: "Food and Water Distribution",
            description: "Urgent food packages needed for displaced families",
            status: "active",
            priority: "high",
            location: "Evacuation Center, North District",
            createdAt: new Date().toISOString(),
          },
          {
            id: "3",
            title: "Shelter Materials Required",
            description: "Tents, blankets, and cots for temporary housing",
            status: "pending",
            priority: "high",
            location: "Open Field, South Region",
            createdAt: new Date().toISOString(),
          },
        ]);
      } catch (error) {
        console.error("Failed to fetch requests:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRequests();
  }, [router]);

  const filteredRequests = requests.filter((req) => {
    if (filter === "all") return true;
    return req.status === filter;
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
              Relief Requests
            </h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400">
              {filteredRequests.length} request
              {filteredRequests.length !== 1 ? "s" : ""} found
            </p>
          </div>
          <button className="rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
            Create Request
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="mb-8 flex gap-2 border-b border-slate-200 dark:border-slate-700">
          {(["all", "active", "pending", "completed"] as const).map(
            (status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 font-medium capitalize transition-colors ${
                  filter === status
                    ? "border-b-2 border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400"
                    : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                }`}
              >
                {status}
              </button>
            )
          )}
        </div>

        {/* Requests List */}
        {filteredRequests.length === 0 ? (
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-slate-800">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              No relief requests found
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredRequests.map((request) => (
              <RequestCard key={request.id} request={request} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function RequestCard({ request }: { request: ReliefRequest }) {
  const priorityColors = {
    low: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    medium:
      "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  const statusColors = {
    pending: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300",
    active:
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    completed:
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    cancelled: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  };

  return (
    <Link href={`/requests/${request.id}`}>
      <div className="block rounded-lg bg-white p-6 shadow transition-all hover:shadow-lg dark:bg-slate-800">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              {request.title}
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
              📍 {request.location}
            </p>
          </div>
          <div className="flex gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${priorityColors[request.priority]}`}
            >
              {request.priority}
            </span>
            <span
              className={`rounded-full px-3 py-1 text-sm font-medium ${statusColors[request.status]}`}
            >
              {request.status}
            </span>
          </div>
        </div>
        <p className="mb-4 text-slate-700 dark:text-slate-300">
          {request.description}
        </p>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Created: {new Date(request.createdAt).toLocaleDateString()}
        </p>
      </div>
    </Link>
  );
}

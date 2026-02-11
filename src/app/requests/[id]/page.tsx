"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface RequestDetail {
  id: string;
  title: string;
  description: string;
  location: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "pending" | "active" | "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
  requesterName?: string;
  requesterEmail?: string;
  estimatedNeeds?: string;
  currentAllocations?: number;
}

export default function RequestDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const [request, setRequest] = useState<RequestDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const response = await fetch(`/api/allocations/${params.id}`);
        if (!response.ok) {
          if (response.status === 401) {
            router.push("/login");
            return;
          }
          setError("Request not found");
          return;
        }

        await response.json();

        // Use mock data for now - replace with actual API data
        setRequest({
          id: params.id,
          title: "Medical Supply Shortage",
          description:
            "Critical need for antibiotics and IV fluids in emergency ward. The hospital is experiencing a severe shortage due to the disaster impact on supply chain.",
          location: "Central Hospital, Downtown District",
          priority: "critical",
          status: "active",
          createdAt: new Date(
            Date.now() - 2 * 24 * 60 * 60 * 1000
          ).toISOString(),
          updatedAt: new Date().toISOString(),
          requesterName: "Dr. James Smith",
          requesterEmail: "james.smith@centralhospital.org",
          estimatedNeeds: "500 units antibiotics, 200 IV fluid sets",
          currentAllocations: 3,
        });
      } catch (error) {
        console.error("Failed to fetch request:", error);
        setError("Failed to load request details");
      } finally {
        setLoading(false);
      }
    };

    fetchRequest();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-lg text-slate-600 dark:text-slate-400">
          Loading...
        </div>
      </div>
    );
  }

  if (error || !request) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="rounded-lg bg-white p-12 text-center shadow dark:bg-slate-800">
            <p className="text-lg text-slate-600 dark:text-slate-400">
              {error || "Request not found"}
            </p>
            <Link
              href="/requests"
              className="mt-4 inline-block text-blue-600 hover:underline dark:text-blue-400"
            >
              Back to requests
            </Link>
          </div>
        </main>
      </div>
    );
  }

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/requests"
          className="mb-6 inline-flex items-center text-blue-600 hover:underline dark:text-blue-400"
        >
          ← Back to requests
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-lg bg-white p-6 shadow dark:bg-slate-800">
          <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                {request.title}
              </h1>
              <p className="mt-2 text-slate-600 dark:text-slate-400">
                📍 {request.location}
              </p>
            </div>
            <div className="flex gap-2">
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${priorityColors[request.priority]}`}
              >
                {request.priority}
              </span>
              <span
                className={`rounded-full px-4 py-2 text-sm font-medium ${statusColors[request.status]}`}
              >
                {request.status}
              </span>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
                Description
              </h2>
              <p className="text-slate-700 dark:text-slate-300">
                {request.description}
              </p>
            </div>

            {/* Details */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h2 className="mb-4 text-2xl font-semibold text-slate-900 dark:text-white">
                Details
              </h2>
              <dl className="space-y-4">
                <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                  <dt className="font-medium text-slate-600 dark:text-slate-400">
                    Estimated Needs
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {request.estimatedNeeds || "Not specified"}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-slate-200 pb-4 dark:border-slate-700">
                  <dt className="font-medium text-slate-600 dark:text-slate-400">
                    Created
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {new Date(request.createdAt).toLocaleDateString()} at{" "}
                    {new Date(request.createdAt).toLocaleTimeString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="font-medium text-slate-600 dark:text-slate-400">
                    Last Updated
                  </dt>
                  <dd className="text-slate-900 dark:text-white">
                    {new Date(request.updatedAt).toLocaleDateString()} at{" "}
                    {new Date(request.updatedAt).toLocaleTimeString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Requester Info */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Requester
              </h3>
              <div className="space-y-2">
                <p className="text-slate-700 dark:text-slate-300">
                  {request.requesterName || "Unknown"}
                </p>
                <p className="break-words text-sm text-slate-600 dark:text-slate-400">
                  {request.requesterEmail || "No email"}
                </p>
              </div>
            </div>

            {/* Allocations */}
            <div className="rounded-lg bg-white p-6 shadow dark:bg-slate-800">
              <h3 className="mb-4 font-semibold text-slate-900 dark:text-white">
                Allocations
              </h3>
              <p className="mb-4 text-3xl font-bold text-blue-600 dark:text-blue-400">
                {request.currentAllocations || 0}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Resource allocations assigned to this request
              </p>
            </div>

            {/* Actions */}
            <button className="w-full rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600">
              Update Request
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

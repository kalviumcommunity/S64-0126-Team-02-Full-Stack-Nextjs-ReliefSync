import dotenv from "dotenv";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

type ApiResponse<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

type LoginData = {
  user: {
    id: number;
    email: string;
    role: string;
    organizationId?: number | null;
  };
  token: string;
};

type LoginResult = LoginData & { cookie?: string | null };

const baseUrl = process.env.API_BASE_URL || "http://localhost:3000";
const govEmail = process.env.TEST_GOV_EMAIL || "admin@gov.in";
const govPassword = process.env.TEST_GOV_PASSWORD || "password123";
const ngoEmail = process.env.TEST_NGO_EMAIL || "manager@redcross.india.org";
const ngoPassword = process.env.TEST_NGO_PASSWORD || "password123";

async function request<T>(path: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers,
  });

  let json: ApiResponse<T> | null = null;
  try {
    json = (await response.json()) as ApiResponse<T>;
  } catch {
    json = null;
  }

  return { response, json };
}

function getListData<T>(payload: unknown): T[] {
  if (Array.isArray(payload)) return payload as T[];
  if (payload && typeof payload === "object" && "data" in payload) {
    const nested = (payload as { data?: unknown }).data;
    return Array.isArray(nested) ? (nested as T[]) : [];
  }
  return [];
}

async function login(email: string, password: string): Promise<LoginResult> {
  const { response, json } = await request<LoginData>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok || !json?.data?.token) {
    throw new Error(
      `Login failed for ${email}: ${json?.message || response.status}`
    );
  }

  const rawCookie = response.headers.get("set-cookie");
  const cookie = rawCookie ? rawCookie.split(";")[0] : null;

  return { ...json.data, cookie };
}

async function run() {
  console.log("Starting API smoke tests...");

  const govLogin = await login(govEmail, govPassword);
  const govToken = govLogin.token;
  const govCookie = govLogin.cookie;

  console.log("Login: government user OK");

  const { response: invalidLoginResponse } = await request<LoginData>(
    "/api/auth/login",
    {
      method: "POST",
      body: JSON.stringify({ email: govEmail, password: "wrong-password" }),
    }
  );

  if (invalidLoginResponse.status !== 401) {
    throw new Error(
      `Expected 401 for invalid login, got ${invalidLoginResponse.status}`
    );
  }

  console.log("Auth: invalid login rejected OK");

  const { response: orgsResponse, json: orgsJson } = await request<unknown>(
    "/api/organizations?page=1&limit=5",
    {
      headers: {
        Authorization: `Bearer ${govToken}`,
        ...(govCookie ? { Cookie: govCookie } : {}),
      },
    }
  );

  if (!orgsResponse.ok) {
    throw new Error(
      `Organizations request failed: ${orgsJson?.message || orgsResponse.status}`
    );
  }
  const organizations = getListData<{ id: number }>(orgsJson?.data);
  if (organizations.length === 0) {
    throw new Error("No organizations returned");
  }

  const { response: itemsResponse, json: itemsJson } = await request<unknown>(
    "/api/inventory-items?page=1&limit=5",
    {
      headers: {
        Authorization: `Bearer ${govToken}`,
        ...(govCookie ? { Cookie: govCookie } : {}),
      },
    }
  );

  if (!itemsResponse.ok) {
    throw new Error(
      `Inventory items request failed: ${itemsJson?.message || itemsResponse.status}`
    );
  }
  const items = getListData<{ id: number }>(itemsJson?.data);
  if (items.length === 0) {
    throw new Error("No inventory items returned");
  }

  const toOrgId = organizations[0].id;
  const itemId = items[0].id;

  const { response: createResponse, json: createJson } = await request<{
    id: number;
  }>("/api/allocations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${govToken}`,
      ...(govCookie ? { Cookie: govCookie } : {}),
    },
    body: JSON.stringify({
      toOrgId,
      itemId,
      quantity: 1,
      requestedBy: govEmail,
      notes: "API smoke test",
    }),
  });

  if (!createResponse.ok || !createJson?.data?.id) {
    throw new Error(
      `Allocation create failed: ${createJson?.message || createResponse.status}`
    );
  }

  console.log("Allocations: create OK");

  const allocationId = createJson.data.id;

  const { response: approveResponse } = await request(
    `/api/allocations/${allocationId}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${govToken}`,
        ...(govCookie ? { Cookie: govCookie } : {}),
      },
      body: JSON.stringify({
        status: "APPROVED",
        approvedBy: govLogin.user.id,
      }),
    }
  );

  if (!approveResponse.ok) {
    throw new Error(`Allocation approve failed: ${approveResponse.status}`);
  }

  console.log("Allocations: approve OK");

  const ngoLogin = await login(ngoEmail, ngoPassword);
  const ngoToken = ngoLogin.token;
  const ngoOrgId = ngoLogin.user.organizationId;
  const ngoCookie = ngoLogin.cookie;

  if (!ngoOrgId) {
    throw new Error("NGO user has no organizationId");
  }

  const { response: ngoAllocationsResponse, json: ngoAllocationsJson } =
    await request<unknown>("/api/allocations?page=1&limit=20", {
      headers: {
        Authorization: `Bearer ${ngoToken}`,
        ...(ngoCookie ? { Cookie: ngoCookie } : {}),
      },
    });

  if (!ngoAllocationsResponse.ok) {
    throw new Error(
      `NGO allocations request failed: ${ngoAllocationsJson?.message || ngoAllocationsResponse.status}`
    );
  }

  const ngoAllocations = getListData<{
    fromOrgId?: number | null;
    toOrgId?: number | null;
  }>(ngoAllocationsJson?.data);

  const hasUnauthorizedAllocation = ngoAllocations.some(
    (allocation) =>
      allocation.fromOrgId !== ngoOrgId && allocation.toOrgId !== ngoOrgId
  );

  if (hasUnauthorizedAllocation) {
    throw new Error(
      "Org-scoped access failed: NGO user can see other org allocations"
    );
  }

  console.log("Allocations: NGO org scope OK");
  console.log("API smoke tests completed successfully.");
}

run().catch((error) => {
  console.error("API smoke tests failed:", error);
  process.exit(1);
});

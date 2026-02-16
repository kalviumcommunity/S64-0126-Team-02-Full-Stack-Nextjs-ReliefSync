import { LoginClient, type AuthMode } from "./ui/LoginClient";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ mode?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const initialMode: AuthMode =
    resolvedSearchParams?.mode === "signup" ? "signup" : "login";
  return <LoginClient initialMode={initialMode} />;
}

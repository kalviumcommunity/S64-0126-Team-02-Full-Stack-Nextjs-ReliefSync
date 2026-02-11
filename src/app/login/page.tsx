import { LoginClient, type AuthMode } from "./ui/LoginClient";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { mode?: string };
}) {
  const initialMode: AuthMode =
    searchParams?.mode === "signup" ? "signup" : "login";
  return <LoginClient initialMode={initialMode} />;
}

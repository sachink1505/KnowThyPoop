import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileClient } from "./ProfileClient";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/");

  const [{ data: profile }, { data: issues }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("user_issues").select("*").eq("user_id", user.id),
  ]);

  return (
    <ProfileClient
      email={user.email ?? ""}
      profile={profile ?? { id: user.id, name: null, age: null, phone: null, created_at: "" }}
      issues={issues ?? []}
    />
  );
}

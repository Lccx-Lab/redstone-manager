"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function signup(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const passwordConfirm = String(formData.get("password_confirm") ?? "");

  if (password.length < 8) {
    redirect(`/signup?error=${encodeURIComponent("パスワードは8文字以上で入力してください")}`);
  }
  if (password !== passwordConfirm) {
    redirect(`/signup?error=${encodeURIComponent("パスワードが一致しません")}`);
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (await headers()).get("origin") || "";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${siteUrl}/auth/callback` },
  });

  if (error) {
    redirect(`/signup?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/signup?sent=1");
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { encryptSecret } from "@/lib/crypto";

export async function saveCredentialsAction(accountId: string, formData: FormData) {
  const loginId = String(formData.get("login_id") ?? "").trim() || null;
  const password = String(formData.get("password") ?? "");
  const secondaryPassword = String(formData.get("secondary_password") ?? "");
  const birthdate = String(formData.get("birthdate") ?? "").trim() || null;
  const registeredEmail = String(formData.get("registered_email") ?? "").trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("account_credentials").upsert(
    {
      account_id: accountId,
      login_id: loginId,
      password_encrypted: password ? encryptSecret(password) : null,
      secondary_password_encrypted: secondaryPassword ? encryptSecret(secondaryPassword) : null,
      birthdate,
      registered_email: registeredEmail,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "account_id" },
  );
  if (error) throw new Error(error.message);

  revalidatePath(`/accounts/${accountId}`);
}

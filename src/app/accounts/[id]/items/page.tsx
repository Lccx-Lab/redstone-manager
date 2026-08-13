import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EQUIPMENT_SLOTS } from "@/lib/types";
import type { EquipmentSlotKey } from "@/lib/types";
import { createItemAction } from "./actions";
import { ItemCard } from "./ItemCard";

const SCREENSHOT_SIGNED_URL_TTL_SECONDS = 60 * 60;

function slotLabel(slot: EquipmentSlotKey): string {
  if (slot === "ring") return "指";
  return EQUIPMENT_SLOTS.find((s) => s.key === slot)?.label ?? slot;
}

export default async function AccountItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: accountId } = await params;
  const supabase = await createClient();

  const { data: account } = await supabase
    .from("accounts")
    .select("*")
    .eq("id", accountId)
    .single();
  if (!account) notFound();

  const [
    { data: itemsRaw },
    { data: statTypes },
    { data: characters },
    { data: otherAccountsRaw },
  ] = await Promise.all([
    supabase
      .from("equipment_items")
      .select(
        "*, equipment_item_stats(stat_type_id, value_percent), equipment_item_screenshots(id, storage_path, caption)",
      )
      .eq("account_id", accountId)
      .order("slot", { ascending: true })
      .order("created_at", { ascending: true }),
    supabase.from("stat_types").select("*").order("sort_order", { ascending: true }).order("name"),
    supabase.from("characters").select("id, name").eq("account_id", accountId),
    supabase.from("accounts").select("id, name").neq("id", accountId).order("created_at"),
  ]);

  const characterIds = (characters ?? []).map((c) => c.id);
  const characterNameById = new Map((characters ?? []).map((c) => [c.id, c.name]));

  const { data: equippedRows } =
    characterIds.length > 0
      ? await supabase
          .from("character_equipment")
          .select("character_id, slot, ring_index, equipped_item_id")
          .in("character_id", characterIds)
          .not("equipped_item_id", "is", null)
      : { data: [] as { character_id: string; slot: string; ring_index: number; equipped_item_id: string }[] };

  const equippedInfoByItemId = new Map<string, string>();
  for (const row of equippedRows ?? []) {
    const characterName = characterNameById.get(row.character_id) ?? "?";
    const slot = row.slot as EquipmentSlotKey;
    const label = slot === "ring" ? `指${row.ring_index}` : slotLabel(slot);
    equippedInfoByItemId.set(row.equipped_item_id as string, `${characterName} / ${label}`);
  }

  const items = await Promise.all(
    (itemsRaw ?? []).map(async (item) => {
      const rawShots = (item.equipment_item_screenshots ?? []) as {
        id: string;
        storage_path: string;
        caption: string | null;
      }[];
      const screenshots = await Promise.all(
        rawShots.map(async (s) => {
          const { data: signed } = await supabase.storage
            .from("equipment-screenshots")
            .createSignedUrl(s.storage_path, SCREENSHOT_SIGNED_URL_TTL_SECONDS);
          return { ...s, url: signed?.signedUrl ?? null };
        }),
      );
      const stats = (
        (item.equipment_item_stats ?? []) as { stat_type_id: string; value_percent: number }[]
      ).map((s) => ({ statTypeId: s.stat_type_id, valuePercent: Number(s.value_percent) || 0 }));

      return { item, screenshots, stats };
    }),
  );

  const groupedBySlot = new Map<EquipmentSlotKey, typeof items>();
  for (const entry of items) {
    const key = entry.item.slot as EquipmentSlotKey;
    const list = groupedBySlot.get(key) ?? [];
    list.push(entry);
    groupedBySlot.set(key, list);
  }

  const slotOrder: EquipmentSlotKey[] = [...EQUIPMENT_SLOTS.map((s) => s.key), "ring"];
  const otherAccounts = otherAccountsRaw ?? [];

  return (
    <main className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold">{account.name} の装備アイテム</h1>
        <Link href={`/accounts/${accountId}`} className="text-sm text-slate-500 hover:underline">
          ← アカウント詳細
        </Link>
      </div>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">新規アイテム追加</h2>
        <form
          action={createItemAction.bind(null, accountId)}
          className="flex flex-col gap-3 sm:flex-row sm:items-end"
        >
          <label className="flex flex-col gap-1 text-sm text-slate-600">
            部位
            <select
              name="slot"
              required
              defaultValue=""
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            >
              <option value="" disabled>
                選択してください
              </option>
              {slotOrder.map((slot) => (
                <option key={slot} value={slot}>
                  {slotLabel(slot)}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            アイテム名
            <input
              name="name"
              required
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <label className="flex flex-1 flex-col gap-1 text-sm text-slate-600">
            メモ
            <input
              name="memo"
              placeholder="任意"
              className="rounded border border-slate-300 px-3 py-2 text-slate-900"
            />
          </label>
          <button
            type="submit"
            className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            追加
          </button>
        </form>
      </section>

      {items.length === 0 ? (
        <p className="rounded border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
          まだ装備アイテムがありません。
        </p>
      ) : (
        slotOrder
          .filter((slot) => groupedBySlot.has(slot))
          .map((slot) => (
            <section key={slot}>
              <h2 className="mb-2 text-sm font-semibold text-slate-600">{slotLabel(slot)}</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {(groupedBySlot.get(slot) ?? []).map(({ item, screenshots, stats }) => (
                  <ItemCard
                    key={item.id}
                    item={item}
                    accountId={accountId}
                    statTypes={statTypes ?? []}
                    stats={stats}
                    screenshots={screenshots}
                    equippedInfo={equippedInfoByItemId.get(item.id) ?? null}
                    otherAccounts={otherAccounts}
                  />
                ))}
              </div>
            </section>
          ))
      )}
    </main>
  );
}

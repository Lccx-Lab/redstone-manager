import type { CharacterContentCategory, StatType } from "@/lib/types";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { StatRowsEditor } from "@/components/StatRowsEditor";
import {
  deleteContentScreenshotAction,
  saveContentOptionsAction,
  uploadContentScreenshotAction,
} from "./content-actions";

type ScreenshotWithUrl = {
  id: string;
  storage_path: string;
  caption: string | null;
  url: string | null;
};

export function ContentPanel({
  characterId,
  category,
  label,
  screenshots,
  statTypes,
  options,
}: {
  characterId: string;
  category: CharacterContentCategory;
  label: string;
  screenshots: ScreenshotWithUrl[];
  statTypes: StatType[];
  options: { statTypeId: string; value: number }[];
}) {
  const uploadAction = uploadContentScreenshotAction.bind(null, characterId, category);
  const saveOptionsAction = saveContentOptionsAction.bind(null, characterId, category);
  const statTypeOptions = statTypes.map((st) => ({ id: st.id, name: st.name, isPercent: st.is_percent }));

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">{label} オプション</h2>
        <form action={saveOptionsAction} className="flex flex-col gap-3">
          <StatRowsEditor statTypeOptions={statTypeOptions} initialStats={options} />
          <button
            type="submit"
            className="self-start rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700"
          >
            保存
          </button>
        </form>
      </section>

      <section className="rounded border border-slate-200 bg-white p-4">
        <h2 className="mb-3 text-sm font-semibold text-slate-600">{label} スクリーンショット</h2>
        <ScreenshotGallery
          screenshots={screenshots}
          uploadAction={uploadAction}
          makeDeleteAction={(screenshotId, storagePath) =>
            deleteContentScreenshotAction.bind(null, characterId, screenshotId, storagePath)
          }
          emptyLabel={`${label}のスクリーンショットはまだありません。`}
          altFallback={label}
        />
      </section>
    </div>
  );
}

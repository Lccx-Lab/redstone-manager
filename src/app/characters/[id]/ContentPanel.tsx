import type { CharacterContentCategory } from "@/lib/types";
import { ScreenshotGallery } from "@/components/ScreenshotGallery";
import { deleteContentScreenshotAction, uploadContentScreenshotAction } from "./content-actions";

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
}: {
  characterId: string;
  category: CharacterContentCategory;
  label: string;
  screenshots: ScreenshotWithUrl[];
}) {
  const uploadAction = uploadContentScreenshotAction.bind(null, characterId, category);

  return (
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
  );
}

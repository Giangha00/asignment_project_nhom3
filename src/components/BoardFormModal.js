import React, { useState, useEffect, useMemo, useId } from "react";
import { ChevronDown, X } from "lucide-react";

export const VISIBILITY_OPTIONS = [
  { value: "private", label: "Riêng tư" },
  { value: "workspace", label: "Không gian làm việc" },
  { value: "public", label: "Công khai" },
];

const BACKGROUND_IMAGES = [
  {
    id: "beach",
    thumb:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=120&h=80&fit=crop&q=80",
    full: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop",
  },
  {
    id: "forest",
    thumb:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=120&h=80&fit=crop&q=80",
    full: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop",
  },
  {
    id: "mountain",
    thumb:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=120&h=80&fit=crop&q=80",
    full: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&auto=format&fit=crop",
  },
  {
    id: "aurora",
    thumb:
      "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=120&h=80&fit=crop&q=80",
    full: "https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop",
  },
];

const BACKGROUND_COLORS = [
  { id: "sky", className: "bg-sky-300" },
  { id: "blue", className: "bg-blue-500" },
  { id: "navy", className: "bg-blue-900" },
  { id: "purple", className: "bg-gradient-to-br from-violet-500 to-fuchsia-500" },
  { id: "rose", className: "bg-gradient-to-br from-pink-400 to-rose-500" },
];

function unsplashPhotoKey(url) {
  const m = String(url || "").match(/\/photo-([^?/]+)/);
  return m ? m[1] : "";
}

function deriveBackgroundFromCoverUrl(coverUrl) {
  if (!coverUrl || typeof coverUrl !== "string" || !coverUrl.trim()) {
    return { kind: "image", imageId: BACKGROUND_IMAGES[0].id, colorId: BACKGROUND_COLORS[0].id };
  }
  const key = unsplashPhotoKey(coverUrl.trim());
  const matchedImg = BACKGROUND_IMAGES.find((img) => unsplashPhotoKey(img.full) === key);
  if (matchedImg) {
    return { kind: "image", imageId: matchedImg.id, colorId: BACKGROUND_COLORS[0].id };
  }
  return { kind: "image", imageId: BACKGROUND_IMAGES[0].id, colorId: BACKGROUND_COLORS[0].id };
}

/**
 * Modal form tạo / sửa bảng (cùng layout với Trello).
 * onSubmit({ title, visibility, coverUrl })
 */
export function BoardFormModal({
  open,
  onClose,
  mode = "create",
  initialTitle = "",
  initialVisibility = "workspace",
  initialCoverUrl = "",
  workspaceId = null,
  onSubmit,
  showTemplateButton = false,
  onTemplate,
}) {
  const titleId = useId();
  const headingId = useId();

  const [title, setTitle] = useState("");
  const [visibility, setVisibility] = useState("workspace");
  const [visibilityOpen, setVisibilityOpen] = useState(false);
  const [titleTouched, setTitleTouched] = useState(false);
  const [bgKind, setBgKind] = useState("image");
  const [bgImageId, setBgImageId] = useState(BACKGROUND_IMAGES[0].id);
  const [bgColorId, setBgColorId] = useState(BACKGROUND_COLORS[0].id);

  useEffect(() => {
    if (!open) return;
    setTitle(initialTitle || "");
    setVisibility(
      VISIBILITY_OPTIONS.some((o) => o.value === initialVisibility)
        ? initialVisibility
        : "workspace"
    );
    setTitleTouched(false);
    setVisibilityOpen(false);
    const derived = deriveBackgroundFromCoverUrl(initialCoverUrl);
    setBgKind(derived.kind);
    setBgImageId(derived.imageId);
    setBgColorId(derived.colorId);
  }, [open, initialTitle, initialVisibility, initialCoverUrl]);

  const selectedImage = useMemo(
    () => BACKGROUND_IMAGES.find((b) => b.id === bgImageId) || BACKGROUND_IMAGES[0],
    [bgImageId]
  );
  const selectedColor = useMemo(
    () => BACKGROUND_COLORS.find((b) => b.id === bgColorId) || BACKGROUND_COLORS[0],
    [bgColorId]
  );

  const previewStyle =
    bgKind === "image"
      ? {
          backgroundImage: `url(${selectedImage.full})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }
      : {};

  const previewClass =
    bgKind === "color" ? `${selectedColor.className} min-h-[168px]` : "min-h-[168px]";

  const titleEmpty = !title.trim();
  const showTitleError = titleTouched && titleEmpty;
  const isCreate = mode === "create";
  const canSubmit = isCreate ? !titleEmpty && workspaceId != null : !titleEmpty;

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    if (!open || !visibilityOpen) return;
    const onDown = (e) => {
      if (!e.target.closest?.("[data-board-form-visibility]")) setVisibilityOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, visibilityOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setTitleTouched(true);
    if (!title.trim()) return;
    if (isCreate && workspaceId == null) return;
    const coverUrl = bgKind === "image" ? selectedImage.full : "";
    if (typeof onSubmit === "function") {
      onSubmit({
        title: title.trim(),
        visibility,
        coverUrl,
      });
    }
    onClose();
  };

  const handleTemplate = () => {
    if (typeof onTemplate === "function") onTemplate();
    onClose();
  };

  const visibilityLabel =
    VISIBILITY_OPTIONS.find((o) => o.value === visibility)?.label ?? VISIBILITY_OPTIONS[1].label;

  const modalTitle = isCreate ? "Tạo bảng" : "Chỉnh sửa bảng";
  const submitLabel = isCreate ? "Tạo mới" : "Lưu thay đổi";

  if (!open) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Đóng lớp phủ"
        className="fixed inset-0 z-[100] bg-black/50"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="fixed left-1/2 top-1/2 z-[110] w-[min(100vw-1.5rem,400px)] -translate-x-1/2 -translate-y-1/2 rounded-xl bg-white p-5 shadow-[0_8px_40px_rgba(0,0,0,0.18)]"
      >
        <div className="relative mb-4 text-center">
          <h2 id={headingId} className="text-lg font-semibold text-gray-900">
            {modalTitle}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div
            className={`overflow-hidden rounded-lg border border-gray-200 ${previewClass}`}
            style={bgKind === "image" ? previewStyle : undefined}
          >
            <div className="flex h-[168px] items-stretch justify-center gap-2 p-3 pt-4">
              {[0, 1, 2].map((col) => (
                <div
                  key={col}
                  className="flex w-[28%] flex-col gap-2 rounded-md bg-white/25 p-1.5 backdrop-blur-[2px]"
                >
                  <div className="h-8 rounded bg-white/50" />
                  <div className="h-6 rounded bg-white/40" />
                  <div className="h-6 rounded bg-white/35" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold text-gray-700">Phông nền</p>
            <div className="mb-2 flex gap-2">
              {BACKGROUND_IMAGES.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => {
                    setBgKind("image");
                    setBgImageId(img.id);
                  }}
                  className={`relative h-11 w-14 shrink-0 overflow-hidden rounded-md border-2 transition ${
                    bgKind === "image" && bgImageId === img.id
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <img src={img.thumb} alt="" className="h-full w-full object-cover" />
                  {bgKind === "image" && bgImageId === img.id && (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/20 text-sm font-bold text-white">
                      ✓
                    </span>
                  )}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {BACKGROUND_COLORS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setBgKind("color");
                    setBgColorId(c.id);
                  }}
                  className={`h-9 w-9 shrink-0 rounded-md border-2 transition ${
                    bgKind === "color" && bgColorId === c.id
                      ? "border-blue-600 ring-2 ring-blue-200"
                      : "border-transparent hover:border-gray-300"
                  } ${c.className}`}
                  aria-label={`Màu ${c.id}`}
                />
              ))}
              <button
                type="button"
                className="flex h-9 w-9 items-center justify-center rounded-md border border-dashed border-gray-300 text-gray-500 hover:bg-gray-50"
                aria-label="Thêm phông nền"
              >
                ···
              </button>
            </div>
          </div>

          <div>
            <label htmlFor={titleId} className="mb-1 block text-sm font-medium text-gray-800">
              Tiêu đề bảng <span className="text-red-500">*</span>
            </label>
            <input
              id={titleId}
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => setTitleTouched(true)}
              className={`w-full rounded-md border px-3 py-2 text-sm text-gray-900 outline-none transition focus:ring-2 focus:ring-blue-500 ${
                showTitleError ? "border-red-500" : "border-gray-300"
              }`}
              autoComplete="off"
            />
            {showTitleError && (
              <p className="mt-1.5 flex items-center gap-1 text-sm text-gray-600">
                <span aria-hidden>👋</span>
                Tiêu đề bảng là bắt buộc
              </p>
            )}
          </div>

          <div className="relative" data-board-form-visibility>
            <p className="mb-1 text-sm font-semibold text-gray-900">Quyền xem</p>
            <button
              type="button"
              onClick={() => setVisibilityOpen((v) => !v)}
              className="flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2.5 text-left text-sm font-semibold text-gray-950 hover:border-gray-400"
            >
              <span className="text-gray-950">{visibilityLabel}</span>
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-700" />
            </button>
            {visibilityOpen && (
              <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-md border border-gray-200 bg-white py-1 shadow-lg">
                {VISIBILITY_OPTIONS.map((opt) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      className="w-full px-3 py-2 text-left text-sm font-medium text-gray-950 hover:bg-gray-100"
                      onClick={() => {
                        setVisibility(opt.value);
                        setVisibilityOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {isCreate && workspaceId == null && (
            <p className="text-sm text-amber-700">
              Chưa có workspace. Hãy tạo workspace trước khi tạo bảng.
            </p>
          )}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-md bg-gray-200 py-2.5 text-sm font-semibold text-gray-800 transition enabled:bg-blue-600 enabled:text-white enabled:hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitLabel}
          </button>
        </form>

        {showTemplateButton && (
          <button
            type="button"
            onClick={handleTemplate}
            className="mt-3 w-full rounded-md border border-gray-300 bg-gray-100 py-2.5 text-sm font-semibold text-gray-900 transition hover:bg-gray-200"
          >
            Bắt đầu với Mẫu
          </button>
        )}
      </div>
    </>
  );
}

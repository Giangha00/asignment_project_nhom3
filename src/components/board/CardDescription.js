import React, { useEffect, useMemo, useRef, useState } from "react";
import { AlignLeft, AlertCircle, Loader2, PenSquare, HelpCircle } from "lucide-react";
import {
  descriptionToPlainText,
  isDescriptionEffectivelyEmpty,
  loadCkeditorCloud,
  normalizeDescriptionForEditor,
  sanitizeDescriptionHtml,
} from "../../lib/richTextDescription";

// Plugin chuyển ảnh tải lên thành base64 (không cần server)
class Base64UploadAdapter {
  constructor(loader) { this.loader = loader; }
  upload() {
    return this.loader.file.then(
      (file) =>
        new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve({ default: reader.result });
          reader.onerror = reject;
          reader.readAsDataURL(file);
        })
    );
  }
  abort() {}
}

function Base64UploadAdapterPlugin(editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (loader) =>
    new Base64UploadAdapter(loader);
}

const HEADING_OPTIONS = [
  { model: "paragraph", title: "Văn bản bình thường", class: "ck-heading_paragraph" },
  { model: "heading1", view: "h1", title: "Heading 1", class: "ck-heading_heading1" },
  { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
  { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
  { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
  { model: "heading5", view: "h5", title: "Heading 5", class: "ck-heading_heading5" },
  { model: "heading6", view: "h6", title: "Heading 6", class: "ck-heading_heading6" },
];

const EDITOR_CONFIG = {
  licenseKey: "GPL",
  extraPlugins: [Base64UploadAdapterPlugin],
  toolbar: {
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "link",
      "insertImage",
      "|",
      "undo",
      "redo",
    ],
    shouldNotGroupWhenFull: true,
  },
  heading: { options: HEADING_OPTIONS },
  image: {
    insert: {
      integrations: ["upload", "url"],
    },
    toolbar: ["imageTextAlternative", "toggleImageCaption", "imageStyle:inline", "imageStyle:block"],
  },
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: "https://",
  },
  language: "vi",
  placeholder: "Thêm mô tả chi tiết hơn...",
};

const FALLBACK_EDITOR_CONFIG = {
  ...EDITOR_CONFIG,
  toolbar: {
    ...EDITOR_CONFIG.toolbar,
    items: [
      "heading",
      "|",
      "bold",
      "italic",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "link",
      "|",
      "undo",
      "redo",
    ],
  },
};

function CardDescription({ initialDescription, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editorState, setEditorState] = useState(normalizeDescriptionForEditor(initialDescription || ""));
  const [fallbackText, setFallbackText] = useState(descriptionToPlainText(initialDescription || ""));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [editorError, setEditorError] = useState("");
  const [isEditorLoading, setIsEditorLoading] = useState(false);
  const editorHostRef = useRef(null);
  const editorInstanceRef = useRef(null);
  const latestDataRef = useRef(editorState);

  useEffect(() => {
    if (isEditing) return;
    const normalized = normalizeDescriptionForEditor(initialDescription || "");
    setEditorState(normalized);
    setFallbackText(descriptionToPlainText(initialDescription || ""));
    latestDataRef.current = normalized;
  }, [initialDescription, isEditing]);

  useEffect(() => {
    latestDataRef.current = editorState;
  }, [editorState]);

  useEffect(() => {
    if (!isEditing || !editorHostRef.current) return undefined;

    let cancelled = false;
    let createdEditor = null;
    setEditorError("");
    setIsEditorLoading(true);

    loadCkeditorCloud()
      .then((ClassicEditor) => {
        if (cancelled || !editorHostRef.current) return null;

        return ClassicEditor.create(editorHostRef.current, EDITOR_CONFIG).catch(() => {
          // Fallback nếu môi trường hiện tại không có plugin image trong classic build.
          return ClassicEditor.create(editorHostRef.current, FALLBACK_EDITOR_CONFIG);
        }).then((editor) => {
          if (cancelled) {
            return editor.destroy();
          }

          createdEditor = editor;
          editorInstanceRef.current = editor;
          editor.setData(latestDataRef.current || "");
          editor.model.document.on("change:data", () => {
            const nextData = editor.getData();
            latestDataRef.current = nextData;
            setEditorState(nextData);
          });
          setIsEditorLoading(false);
          return null;
        });
      })
      .catch((error) => {
        if (cancelled) return;
        setEditorError(error?.message || "Không thể tải trình soạn thảo.");
        setIsEditorLoading(false);
      });

    return () => {
      cancelled = true;
      const editor = createdEditor || editorInstanceRef.current;
      editorInstanceRef.current = null;
      if (editor) {
        editor.destroy().catch(() => {});
      }
    };
  }, [isEditing]);

  const renderedDescription = useMemo(
    () => sanitizeDescriptionHtml(initialDescription || ""),
    [initialDescription]
  );

  const handleEdit = () => {
    setSaveError("");
    setEditorError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    const normalized = normalizeDescriptionForEditor(initialDescription || "");
    setEditorState(normalized);
    setFallbackText(descriptionToPlainText(initialDescription || ""));
    latestDataRef.current = normalized;
    setSaveError("");
    setEditorError("");
    setIsEditing(false);
  };

  const handleFallbackChange = (event) => {
    const nextText = event.target.value;
    const nextValue = normalizeDescriptionForEditor(nextText);
    setFallbackText(nextText);
    latestDataRef.current = nextValue;
    setEditorState(nextValue);
  };

  const handleSave = async () => {
    const normalizedDraft = normalizeDescriptionForEditor(latestDataRef.current || "");
    const nextDescription = isDescriptionEffectivelyEmpty(normalizedDraft) ? "" : normalizedDraft;
    if (nextDescription === normalizeDescriptionForEditor(initialDescription || "")) {
      setIsEditing(false);
      return;
    }

    setSaveError("");
    setIsSaving(true);
    try {
      await onSave({ description: nextDescription }, { silent: true });
      setIsEditing(false);
    } catch (error) {
      setSaveError(error?.message || "Không thể lưu mô tả. Vui lòng thử lại.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
        <AlignLeft className="h-4 w-4 shrink-0 text-[#9fadbc]" />
        <h3 className="text-sm font-semibold text-[#d1d7e0]">Mô tả</h3>
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={handleEdit}
            className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs font-medium text-[#9fadbc] transition-all hover:border-[#579dff]/40 hover:bg-[#579dff]/10 hover:text-[#dbe9ff]"
          >
            Chỉnh sửa
          </button>
        )}
      </div>

      {isEditing ? (
        <div className="animate-in fade-in duration-200">
          <div className="description-editor-shell rounded-2xl border border-[#5e87c2]/25 bg-[radial-gradient(circle_at_top_right,rgba(88,157,255,0.16),transparent_45%),linear-gradient(180deg,#252f3c_0%,#1f2833_100%)] p-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_14px_32px_rgba(0,0,0,0.22)]">
            {isEditorLoading && (
              <div className="mb-3 flex items-center gap-2 rounded-lg bg-[#1b2024] px-3 py-2 text-sm text-[#9fadbc]">
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang tải trình soạn thảo CKEditor...
              </div>
            )}

            {editorError ? (
              <div className="space-y-3">
                <div className="flex items-start gap-2 rounded-lg bg-[#3d2022] px-3 py-2 text-sm text-[#ffb4b4]">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{editorError}</span>
                </div>
                <textarea
                  autoFocus
                  value={fallbackText}
                  onChange={handleFallbackChange}
                  rows={6}
                  placeholder="Thêm mô tả chi tiết hơn..."
                  className="w-full resize-y rounded-lg bg-[#1b2024] px-3 py-2 text-sm text-[#d1d7e0] placeholder:text-[#6b7785] outline-none focus:ring-2 focus:ring-[#579dff]"
                />
              </div>
            ) : (
              <div className="card-description-editor min-h-[420px]" ref={editorHostRef} />
            )}
          </div>

          {saveError && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-[#3d2022] px-3 py-2 text-sm text-[#ffb4b4]">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || isEditorLoading}
              className="inline-flex items-center gap-2 rounded-md bg-[#579dff] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-[#6cabff] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Lưu
            </button>
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSaving}
              className="rounded-md px-3 py-1.5 text-sm font-semibold text-[#9fadbc] transition-colors hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-70"
            >
              Hủy
            </button>
            </div>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.06] px-3 py-1.5 text-sm font-medium text-[#b8c4d0] transition-colors hover:bg-white/[0.1] hover:text-white"
            >
              <HelpCircle className="h-4 w-4" />
              Trợ giúp định dạng
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={handleEdit}
          className="description-view-surface group min-h-[120px] cursor-text rounded-xl border border-white/10 bg-[radial-gradient(circle_at_top_left,rgba(124,196,255,0.1),transparent_44%),linear-gradient(180deg,#26303b_0%,#1f2832_100%)] px-4 py-3.5 text-sm transition-all hover:-translate-y-[1px] hover:border-[#7cc4ff]/45 hover:shadow-[0_10px_24px_rgba(6,14,24,0.38)]"
        >
          {renderedDescription ? (
            <div
              className="card-rich-text text-[#d1d7e0]"
              dangerouslySetInnerHTML={{ __html: renderedDescription }}
            />
          ) : (
            <div className="flex items-center gap-2 text-[#6b7785] transition-colors group-hover:text-[#9fadbc]">
              <PenSquare className="h-4 w-4" />
              <span>Thêm mô tả chi tiết hơn...</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default CardDescription;

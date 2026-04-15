import { useState } from "react";
import api from "../lib/api";

const DEFAULT_FORM = {
  name: "",
  type: "",
  description: "",
  visibility: "private",
  color: "#2f67ff",
};

export function useSidebar({ workspaces, onCreateWorkspace, onDeleteWorkspace, onUpdateWorkspace, onLogout }) {
  const [showCreateWorkspace, setShowCreateWorkspace] = useState(false);
  const [editingWorkspace, setEditingWorkspace] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const setField = (field) => (value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const getWorkspaceApiId = (ws) => ws?.apiId || ws?._id || ws?.workspaceId || null;

  const normalizeColorForApi = (color) => {
    if (!color || typeof color !== "string") return "#2f67ff";
    const match = color.match(/#([0-9a-fA-F]{3,8})/);
    return match ? `#${match[1]}` : color;
  };

  const openCreateForm = () => {
    setForm(DEFAULT_FORM);
    setEditingWorkspace(null);
    setShowCreateWorkspace(true);
  };

  const openEditModal = (workspace) => {
    setEditingWorkspace(workspace);
    setForm({
      name: workspace.name || "",
      type: workspace.type === "default" ? "" : workspace.type || "",
      description: workspace.description || "",
      visibility: workspace.visibility || "private",
      color: normalizeColorForApi(workspace.color) || "#2f67ff",
    });
    setShowCreateWorkspace(false);
  };

  const closeForm = () => {
    setShowCreateWorkspace(false);
    setEditingWorkspace(null);
    setForm(DEFAULT_FORM);
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || submitting) return;

    const apiPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      visibility: form.visibility,
    };

    try {
      setSubmitting(true);
      const response = await api.post("/api/workspaces", apiPayload);
      const created = response.data;
      if (onCreateWorkspace) {
        onCreateWorkspace({
          ...created,
          name: created?.name || apiPayload.name,
          description: created?.description || apiPayload.description,
          visibility: created?.visibility,
          logoUrl: created?.logoUrl,
          apiId: getWorkspaceApiId(created),
          type: form.type || "default",
          color: normalizeColorForApi(form.color),
          isOpen: true,
          boards: created.boards || [],
        });
      }
      closeForm();
    } catch (error) {
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
        if (typeof onLogout === "function") onLogout();
      } else {
        alert(apiMessage || "Không thể tạo workspace. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateWorkspace = async (e) => {
    e.preventDefault();
    if (!editingWorkspace || !form.name.trim() || submitting) return;

    const apiId = getWorkspaceApiId(editingWorkspace);
    const apiPayload = {
      name: form.name.trim(),
      description: form.description.trim(),
      visibility: form.visibility,
    };

    try {
      setSubmitting(true);
      let updatedWorkspace = null;
      if (apiId) {
        const response = await api.patch(`/api/workspaces/${apiId}`, apiPayload);
        updatedWorkspace = response.data;
      }
      if (typeof onUpdateWorkspace === "function") {
        onUpdateWorkspace({
          ...editingWorkspace,
          ...updatedWorkspace,
          name: form.name.trim(),
          description: form.description.trim(),
          type: form.type || editingWorkspace.type || "default",
          visibility: form.visibility,
          color: normalizeColorForApi(form.color),
          isOpen: editingWorkspace.isOpen,
        });
      }
      closeForm();
    } catch (error) {
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
        if (typeof onLogout === "function") onLogout();
      } else {
        alert(apiMessage || error.message || "Không thể cập nhật workspace. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteWorkspace = async (wsId) => {
    if (submitting) return;
    const ws = workspaces.find((w) => w.id === wsId);
    const apiId = getWorkspaceApiId(ws);
    if (!apiId) {
      alert("Workspace này đang là dữ liệu local nên không thể xóa qua API.");
      return;
    }
    try {
      setSubmitting(true);
      await api.delete(`/api/workspaces/${apiId}`);
      if (onDeleteWorkspace) onDeleteWorkspace(apiId);
    } catch (error) {
      const status = error.response?.status;
      const apiMessage = error.response?.data?.message || error.response?.data?.error;
      if (status === 401) {
        alert("Bạn chưa đăng nhập hoặc token hết hạn. Vui lòng đăng nhập lại.");
        if (typeof onLogout === "function") onLogout();
      } else {
        alert(apiMessage || "Không thể xóa workspace. Vui lòng thử lại.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return {
    showCreateWorkspace,
    editingWorkspace,
    submitting,
    form,
    setField,
    openCreateForm,
    openEditModal,
    closeForm,
    handleCreateWorkspace,
    handleUpdateWorkspace,
    handleDeleteWorkspace,
  };
}

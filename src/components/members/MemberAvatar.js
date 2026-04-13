import React from "react";

const AVATAR_BG_PALETTE = [
  "#2f67ff",
  "#00a3bf",
  "#0ea76d",
  "#ff9f1a",
  "#8a63ff",
  "#d64e8a",
];

const pickAvatarColor = (seed = "") => {
  if (!seed) return AVATAR_BG_PALETTE[0];
  const hash = String(seed)
    .split("")
    .reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return AVATAR_BG_PALETTE[hash % AVATAR_BG_PALETTE.length];
};

const getInitials = (name = "", username = "") => {
  const candidate = String(name || username).trim();
  if (!candidate) return "NA";
  const parts = candidate.split(/\s+/).filter(Boolean);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
};

function MemberAvatar({
  name,
  fullName,
  username,
  initials,
  avatarUrl,
  accentColor,
  size = 40,
  className = "",
}) {
  const displayName = fullName || name || username || "";
  const resolvedInitials = initials || getInitials(displayName);
  const resolvedBg = accentColor || pickAvatarColor(displayName);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={displayName || "Member avatar"}
        className={`rounded-full object-cover ${className}`}
        style={{ height: size, width: size }}
      />
    );
  }

  return (
    <div
      className={`flex items-center justify-center rounded-full text-sm font-bold text-white ${className}`}
      style={{
        backgroundColor: resolvedBg,
        height: size,
        width: size,
      }}
      aria-hidden
    >
      {resolvedInitials}
    </div>
  );
}

export default MemberAvatar;

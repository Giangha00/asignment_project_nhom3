import React from "react";
import Header from "../../components/Header";
import CardDetailModal from "../../components/board/CardDetailModal";
import ListColumn from "../../components/board/ListColumn";
import AddListComposer from "../../components/board/AddListComposer";
import InviteMemberModal from "../../components/board/InviteMemberModal";
import BoardHeader from "../../components/board/BoardHeader";
import BoardBanner from "../../components/board/BoardBanner";
import BottomNav from "../../components/board/BottomNav";
import { useBoardDetail } from "../../hooks/useBoardDetail";

function BoardDetail({ currentUser, onLogout }) {
  const {
    boardMeta, loading, loadError,
    boardMembers, bannerVisible, setBannerVisible,
    selectedCard, setSelectedCard,
    addingForListId, composerTitle, setComposerTitle,
    composerStartAt, composerDueAt, composerRangeError,
    draggingCardId, dragOverListId, dragOverCardId,
    listComposerOpen, newListTitle, setNewListTitle, newListError,
    inviteOpen, setInviteOpen, inviteEmail, setInviteEmail,
    inviteLoading, inviteError, inviteSuccess,
    listColumns,
    handleSaveCard, handleDeleteCard,
    handleCardDragStart, handleCardDragEnd, handleCardDragOver,
    handleListDragOver, handleListDragLeave, handleListDrop, handleCardDrop,
    openComposer, closeComposer, submitCard,
    setComposerStartAt, setComposerDueAt, setComposerRangeError,
    openListComposer, closeListComposer, submitNewList,
    handleInviteMember,
    navigate,
  } = useBoardDetail(currentUser);

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0f1214] px-4 text-center text-[#9fadbc]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#579dff] border-t-transparent"></div>
        <p className="text-lg text-white font-medium">Đang tải bảng...</p>
      </div>
    );
  }

  if (loadError || !boardMeta) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[#0f1214] px-4 text-center text-[#9fadbc]">
        <div className="rounded-full bg-red-500/10 p-4">
          <svg className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <div className="space-y-2">
          <p className="text-xl text-white font-bold">Không tìm thấy bảng</p>
          <p className="max-w-md text-sm leading-relaxed">{loadError || "Bảng có thể đã bị xóa hoặc liên kết không đúng."}</p>
        </div>
        <button 
          onClick={() => navigate("/home")}
          className="rounded-md bg-[#579dff] px-6 py-2.5 text-sm font-semibold text-[#0c1f3d] hover:bg-[#6cabff] transition-colors shadow-lg shadow-blue-500/20"
        >
          Trở về Trang chủ
        </button>
      </div>
    );
  }

  const boardName = boardMeta?.name ?? "Bảng";
  const workspaceName = boardMeta?.workspaceName || "";
  const selectedCardList = selectedCard ? listColumns.find((l) => l.id === selectedCard.listId) : null;

  return (
    <div
      className="relative flex min-h-screen flex-col text-[#d1d7e0] overflow-hidden"
      style={{
        background: `
          linear-gradient(125deg, rgba(12,14,18,0.92) 0%, rgba(35,18,45,0.85) 45%, rgba(12,28,42,0.92) 100%),
          radial-gradient(ellipse 80% 60% at 20% 20%, rgba(236,72,153,0.3), transparent 55%),
          radial-gradient(ellipse 70% 50% at 85% 30%, rgba(56,189,248,0.25), transparent 50%),
          radial-gradient(ellipse 60% 40% at 50% 90%, rgba(167,139,250,0.15), transparent 45%),
          #0d1114
        `,
      }}
    >
      <Header onCreateBoard={() => navigate("/home")} backTo="/home" user={currentUser} onLogout={onLogout} />

      {/* Card detail modal */}
      {selectedCard && (
        <CardDetailModal
          card={selectedCard}
          listName={selectedCardList?.name || ""}
          boardMembers={boardMembers}
          onClose={() => setSelectedCard(null)}
          onSave={(patch, options) => handleSaveCard(selectedCard, patch, options)}
          onDelete={() => handleDeleteCard(selectedCard)}
        />
      )}

      <div className="relative z-10 flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          
          <BoardHeader
            boardName={boardName}
            workspaceName={workspaceName}
            onInviteClick={() => setInviteOpen(true)}
            boardMembers={boardMembers}
          />

          {bannerVisible && <BoardBanner onHeaderClose={() => setBannerVisible(false)} />}

          {/* List Canvas */}
          <div className="flex flex-1 gap-3 overflow-x-auto overflow-y-hidden px-3 pb-24 pt-1 sm:px-4 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {listColumns.map((list) => (
              <ListColumn
                key={list.id}
                list={list}
                draggingCardId={draggingCardId}
                dragOverCardId={dragOverCardId}
                dragOverListId={dragOverListId}
                addingForListId={addingForListId}
                composerTitle={composerTitle}
                composerStartAt={composerStartAt}
                composerDueAt={composerDueAt}
                composerRangeError={composerRangeError}
                setComposerTitle={setComposerTitle}
                setComposerStartAt={setComposerStartAt}
                setComposerDueAt={setComposerDueAt}
                setComposerRangeError={setComposerRangeError}
                onCardDragStart={handleCardDragStart}
                onCardDragEnd={handleCardDragEnd}
                onCardDragOver={handleCardDragOver}
                onCardDrop={handleCardDrop}
                onListDragOver={handleListDragOver}
                onListDragLeave={handleListDragLeave}
                onListDrop={handleListDrop}
                onCardClick={setSelectedCard}
                onOpenComposer={openComposer}
                onCloseComposer={closeComposer}
                onSubmitCard={submitCard}
              />
            ))}

            <AddListComposer
              open={listComposerOpen}
              value={newListTitle}
              error={newListError}
              onChange={setNewListTitle}
              onSubmit={submitNewList}
              onOpen={openListComposer}
              onClose={closeListComposer}
            />
          </div>
        </div>
      </div>

      {/* Invite member modal */}
      {inviteOpen && (
        <InviteMemberModal
          boardName={boardName}
          currentUserId={currentUser?._id || currentUser?.id}
          boardMembers={boardMembers}
          inviteEmail={inviteEmail}
          setInviteEmail={setInviteEmail}
          inviteLoading={inviteLoading}
          inviteError={inviteError}
          inviteSuccess={inviteSuccess}
          onSubmit={handleInviteMember}
          onClose={() => setInviteOpen(false)}
        />
      )}

      <BottomNav />
    </div>
  );
}

export default BoardDetail;

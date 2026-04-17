import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import CardItem from "./CardItem";
import CardDetailModal from "./CardDetailModal";
import api from "../../lib/api";

jest.mock("../../lib/api", () => ({
  get: jest.fn(),
}));

jest.mock("./CardModalHeader", () => function CardModalHeaderMock({ title }) {
  return <div>{title}</div>;
});

jest.mock("./CardDescription", () => function CardDescriptionMock() {
  return <div>Description</div>;
});

jest.mock("./CardActivity", () => function CardActivityMock() {
  return <div>Activity</div>;
});

jest.mock("./CardSideActions", () => function CardSideActionsMock() {
  return <div>Actions</div>;
});

jest.mock("./QuickTaskDateRangeField", () => function QuickTaskDateRangeFieldMock() {
  return <div>Date range</div>;
});

jest.mock("./CardMembers", () => function CardMembersMock() {
  return <div>Members</div>;
});

jest.mock("./CardMembersModal", () => function CardMembersModalMock() {
  return <div>Members modal</div>;
});

describe("Card priority UI", () => {
  beforeEach(() => {
    api.get.mockResolvedValue({ data: [] });
  });

  it("renders fallback medium priority badge on card when old data has no priority", () => {
    render(
      <CardItem
        card={{ id: "1", title: "Task A", priority: undefined }}
        listId="list-1"
        draggingCardId={null}
        dragOverCardId={null}
        onDragStart={() => {}}
        onDragEnd={() => {}}
        onDragOver={() => {}}
        onDrop={() => {}}
        onClick={() => {}}
      />
    );

    expect(screen.getByText(/bình thường/i)).toBeInTheDocument();
  });

  it("updates priority from modal and calls save", async () => {
    const onSave = jest.fn().mockResolvedValue(undefined);

    render(
      <CardDetailModal
        card={{ id: "card-1", title: "Task B", description: "", priority: "low", startAt: null, dueAt: null }}
        listName="Todo"
        boardMembers={[]}
        onClose={() => {}}
        onSave={onSave}
        onDelete={() => {}}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /nhãn/i }));
    fireEvent.click(screen.getByRole("button", { name: /chọn nhãn priority rất quan trọng/i }));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith({ priority: "urgent" }, { silent: true });
    });

    expect(screen.getByText(/cập nhật priority thành công/i)).toBeInTheDocument();
  });
});

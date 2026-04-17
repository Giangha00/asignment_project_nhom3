import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import QuickTaskDateRangeField from "./QuickTaskDateRangeField";

describe("QuickTaskDateRangeField", () => {
  it("sets date range and emits ISO payload", () => {
    const onChange = jest.fn();
    render(<QuickTaskDateRangeField startAt={null} dueAt={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /chưa chọn ngày/i }));

    fireEvent.click(screen.getByLabelText(/bật ngày bắt đầu/i));
    fireEvent.change(screen.getByLabelText(/ngày bắt đầu \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ bắt đầu \(time\)/i), {
      target: { value: "09:15" },
    });

    fireEvent.click(screen.getByLabelText(/bật ngày kết thúc/i));
    fireEvent.change(screen.getByLabelText(/ngày kết thúc \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ kết thúc \(time\)/i), {
      target: { value: "10:30" },
    });

    const calls = onChange.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const last = calls[calls.length - 1][0];
    expect(last.startAt).toContain("2026-04-17T");
    expect(last.dueAt).toContain("2026-04-17T");
    expect(last.isValid).toBe(true);
    expect(last.status).toBe("full");
  });

  it("clears date range", () => {
    const onChange = jest.fn();
    render(<QuickTaskDateRangeField startAt={null} dueAt={null} onChange={onChange} />);

    fireEvent.click(screen.getByRole("button", { name: /chưa chọn ngày/i }));
    fireEvent.click(screen.getByLabelText(/bật ngày bắt đầu/i));
    fireEvent.change(screen.getByLabelText(/ngày bắt đầu \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ bắt đầu \(time\)/i), {
      target: { value: "09:15" },
    });

    fireEvent.click(screen.getByLabelText(/bật ngày kết thúc/i));
    fireEvent.change(screen.getByLabelText(/ngày kết thúc \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ kết thúc \(time\)/i), {
      target: { value: "10:30" },
    });

    fireEvent.click(screen.getByRole("button", { name: /xóa/i }));

    const calls = onChange.mock.calls;
    const last = calls[calls.length - 1][0];
    expect(last.startAt).toBeNull();
    expect(last.dueAt).toBeNull();
    expect(last.status).toBe("empty");
    expect(last.isValid).toBe(true);
  });

  it("shows invalid range message when start is after due", () => {
    render(<QuickTaskDateRangeField startAt={null} dueAt={null} onChange={() => {}} />);

    fireEvent.click(screen.getByRole("button", { name: /chưa chọn ngày/i }));
    fireEvent.click(screen.getByLabelText(/bật ngày bắt đầu/i));
    fireEvent.change(screen.getByLabelText(/ngày bắt đầu \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ bắt đầu \(time\)/i), {
      target: { value: "11:30" },
    });

    fireEvent.click(screen.getByLabelText(/bật ngày kết thúc/i));
    fireEvent.change(screen.getByLabelText(/ngày kết thúc \(date\)/i), {
      target: { value: "2026-04-17" },
    });
    fireEvent.change(screen.getByLabelText(/giờ kết thúc \(time\)/i), {
      target: { value: "10:30" },
    });

    expect(screen.getByText(/thời gian bắt đầu phải trước hoặc bằng thời gian kết thúc/i)).toBeInTheDocument();
  });
});

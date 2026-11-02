import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ModalDialog } from "@/components/ui/ModalDialog";

const renderDialog = (onClose = vi.fn()) => {
  render(
    <ModalDialog labelledBy="t" onClose={onClose} testId="dlg">
      <h2 id="t">Title</h2>
      <button type="button" data-autofocus>
        First
      </button>
      <button type="button">Last</button>
    </ModalDialog>,
  );
  return onClose;
};

describe("ModalDialog", () => {
  it("focuses the autofocus control and traps Tab inside", () => {
    renderDialog();
    const first = screen.getByRole("button", { name: "First" });
    const last = screen.getByRole("button", { name: "Last" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "Tab", shiftKey: true });
    expect(last).toHaveFocus();
    fireEvent.keyDown(last, { key: "Tab" });
    expect(first).toHaveFocus();
    fireEvent.keyDown(first, { key: "a" }); // other keys do nothing
    expect(first).toHaveFocus();
  });

  it("closes on Escape and on a backdrop click", () => {
    const onClose = renderDialog();
    fireEvent.keyDown(screen.getByTestId("dlg"), { key: "Escape" });
    fireEvent.click(screen.getByTestId("dlg").previousElementSibling!);
    expect(onClose).toHaveBeenCalledTimes(2);
  });

  it("returns focus to the opener when closed", () => {
    const opener = document.createElement("button");
    document.body.appendChild(opener);
    opener.focus();
    const { unmount } = render(
      <ModalDialog labelledBy="t" onClose={() => {}}>
        <h2 id="t">No buttons</h2>
      </ModalDialog>,
    );
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Tab" }); // nothing focusable: no-op
    unmount();
    expect(opener).toHaveFocus();
    opener.remove();
  });
});

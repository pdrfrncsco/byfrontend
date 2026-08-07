import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { PlayerAvatarUpload } from "@/modules/players/components/PlayerAvatarUpload";

describe("PlayerAvatarUpload Component", () => {
  it("renders upload button correctly", () => {
    const onUpload = vi.fn();

    render(
      <PlayerAvatarUpload
        avatarUrl={null}
        initials="MS"
        onUploaded={onUpload}
      />
    );

    expect(screen.getByRole("button")).toBeDefined();
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlayerAvatarUpload from "@/modules/players/components/PlayerAvatarUpload";
import { playerApi } from "@/modules/players/services/player.api";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/modules/players/services/player.api", () => ({
  playerApi: {
    uploadAvatar: vi.fn(),
    deleteAvatar: vi.fn(),
  },
}));

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createFile(name: string, type: string, size = 1024): File {
  const blob = new Blob(["x".repeat(size)], { type });
  return new File([blob], name, { type });
}

function setup(props: Partial<React.ComponentProps<typeof PlayerAvatarUpload>> = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  const defaults = { playerId: "player-1", avatarUrl: undefined, ...props };
  return render(
    <QueryClientProvider client={qc}>
      <PlayerAvatarUpload {...defaults} />
    </QueryClientProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlayerAvatarUpload", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (playerApi.uploadAvatar as ReturnType<typeof vi.fn>).mockResolvedValue({
      avatarUrl: "https://cdn.example.com/avatar.jpg",
    });
    (playerApi.deleteAvatar as ReturnType<typeof vi.fn>).mockResolvedValue(undefined);
  });

  it("renders upload button when no avatar is set", () => {
    setup();
    expect(
      screen.getByRole("button", { name: /upload/i }) ||
      screen.getByText(/upload/i)
    ).toBeInTheDocument();
  });

  it("renders avatar image when avatarUrl is provided", () => {
    setup({ avatarUrl: "https://cdn.example.com/avatar.jpg" });
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("avatar.jpg"));
  });

  it("accepts valid JPEG file and calls uploadAvatar", async () => {
    setup();
    const file = createFile("photo.jpg", "image/jpeg", 512 * 1024); // 512 KB
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    await waitFor(() => {
      expect(playerApi.uploadAvatar).toHaveBeenCalledWith("player-1", file);
    });
  });

  it("accepts valid PNG file", async () => {
    setup();
    const file = createFile("photo.png", "image/png");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    await waitFor(() => {
      expect(playerApi.uploadAvatar).toHaveBeenCalled();
    });
  });

  it("rejects files larger than 5 MB", async () => {
    setup();
    const file = createFile("big.jpg", "image/jpeg", 6 * 1024 * 1024); // 6 MB
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    expect(await screen.findByText(/5 MB/i)).toBeInTheDocument();
    expect(playerApi.uploadAvatar).not.toHaveBeenCalled();
  });

  it("rejects non-image files", async () => {
    setup();
    const file = createFile("doc.pdf", "application/pdf");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    expect(await screen.findByText(/image/i)).toBeInTheDocument();
    expect(playerApi.uploadAvatar).not.toHaveBeenCalled();
  });

  it("shows upload progress indicator while uploading", async () => {
    let resolve!: (v: { avatarUrl: string }) => void;
    (playerApi.uploadAvatar as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise((r) => { resolve = r; })
    );
    setup();
    const file = createFile("photo.jpg", "image/jpeg");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    // Loading indicator should be visible before resolve
    expect(
      screen.queryByRole("progressbar") ||
      screen.queryByText(/uploading/i) ||
      document.querySelector("[aria-busy]")
    ).not.toBeNull();

    resolve({ avatarUrl: "https://cdn.example.com/new.jpg" });
  });

  it("shows error message when upload fails", async () => {
    (playerApi.uploadAvatar as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Upload failed")
    );
    setup();
    const file = createFile("photo.jpg", "image/jpeg");
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    await user.upload(input, file);

    expect(await screen.findByText(/failed|error/i)).toBeInTheDocument();
  });

  it("shows delete button when avatar exists and calls deleteAvatar on click", async () => {
    setup({ avatarUrl: "https://cdn.example.com/avatar.jpg" });
    const deleteBtn = screen.getByRole("button", { name: /remove|delete/i });
    await user.click(deleteBtn);

    await waitFor(() => {
      expect(playerApi.deleteAvatar).toHaveBeenCalledWith("player-1");
    });
  });

  it("hides delete button when no avatar is set", () => {
    setup({ avatarUrl: undefined });
    expect(
      screen.queryByRole("button", { name: /remove|delete/i })
    ).not.toBeInTheDocument();
  });

  it("is accessible — file input has a visible label", () => {
    setup();
    const input = document.querySelector<HTMLInputElement>('input[type="file"]')!;
    const id = input?.id;
    if (id) {
      expect(document.querySelector(`label[for="${id}"]`)).toBeInTheDocument();
    } else {
      // aria-label fallback
      expect(input).toHaveAttribute("aria-label");
    }
  });
});

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlayerCareerTimeline from "@/modules/players/components/PlayerCareerTimeline";
import { playerApi } from "@/modules/players/services/player.api";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/modules/players/services/player.api", () => ({
  playerApi: {
    getCareerHistory: vi.fn(),
    addCareerEntry: vi.fn(),
    updateCareerEntry: vi.fn(),
    deleteCareerEntry: vi.fn(),
  },
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockCareerHistory = [
  {
    id: "entry-1",
    clubName: "Sporting CP",
    startDate: "2018-07-01",
    endDate: "2021-06-30",
    position: "CAM",
    appearances: 87,
    goals: 23,
    assists: 31,
    isLoan: false,
  },
  {
    id: "entry-2",
    clubName: "FC Porto",
    startDate: "2021-07-01",
    endDate: undefined, // current club
    position: "CAM",
    appearances: 45,
    goals: 14,
    assists: 18,
    isLoan: false,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function setup(props: { playerId?: string; editable?: boolean } = {}) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={qc}>
      <PlayerCareerTimeline
        playerId={props.playerId ?? "player-1"}
        editable={props.editable ?? false}
      />
    </QueryClientProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlayerCareerTimeline", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (playerApi.getCareerHistory as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCareerHistory
    );
    (playerApi.addCareerEntry as ReturnType<typeof vi.fn>).mockResolvedValue({
      id: "entry-3",
      clubName: "Benfica",
      startDate: "2024-01-01",
      position: "CAM",
    });
    (playerApi.updateCareerEntry as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockCareerHistory[0]
    );
    (playerApi.deleteCareerEntry as ReturnType<typeof vi.fn>).mockResolvedValue(
      undefined
    );
  });

  // ── Rendering ──────────────────────────────────────────────────────────────

  it("renders career entries once data loads", async () => {
    setup();
    expect(await screen.findByText("Sporting CP")).toBeInTheDocument();
    expect(await screen.findByText("FC Porto")).toBeInTheDocument();
  });

  it("shows current club without an end date", async () => {
    setup();
    const porto = await screen.findByText("FC Porto");
    const entry = porto.closest("[data-testid='career-entry']") ?? porto.parentElement!;
    expect(within(entry as HTMLElement).queryByText(/2021/)).toBeInTheDocument();
    expect(
      within(entry as HTMLElement).queryByText(/present|current/i)
    ).toBeInTheDocument();
  });

  it("shows a loan badge when isLoan is true", async () => {
    (playerApi.getCareerHistory as ReturnType<typeof vi.fn>).mockResolvedValue([
      { ...mockCareerHistory[0], isLoan: true },
    ]);
    setup();
    expect(await screen.findByText(/loan/i)).toBeInTheDocument();
  });

  it("displays stats when available", async () => {
    setup();
    expect(await screen.findByText("87")).toBeInTheDocument(); // appearances
    expect(screen.getByText("23")).toBeInTheDocument(); // goals
    expect(screen.getByText("31")).toBeInTheDocument(); // assists
  });

  it("renders entries in reverse-chronological order (most recent first)", async () => {
    setup();
    const entries = await screen.findAllByText(/Sporting CP|FC Porto/);
    // FC Porto (current) should appear before Sporting CP (older)
    const firstText = entries[0].textContent ?? "";
    expect(firstText).toMatch(/FC Porto/);
  });

  it("shows empty state when career history is empty", async () => {
    (playerApi.getCareerHistory as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    setup();
    expect(
      await screen.findByText(/no career history|add your first/i)
    ).toBeInTheDocument();
  });

  it("shows loading skeleton while fetching", () => {
    // Delay resolution so loading state is visible
    (playerApi.getCareerHistory as ReturnType<typeof vi.fn>).mockReturnValue(
      new Promise(() => {})
    );
    setup();
    // Skeleton or spinner should be present before data loads
    expect(
      document.querySelector("[data-testid='career-skeleton']") ||
      document.querySelector("[aria-busy='true']") ||
      document.querySelector(".animate-pulse")
    ).not.toBeNull();
  });

  // ── Read-only mode ─────────────────────────────────────────────────────────

  it("hides add/edit/delete buttons in read-only mode", async () => {
    setup({ editable: false });
    await screen.findByText("Sporting CP");
    expect(screen.queryByRole("button", { name: /add|edit|delete|remove/i })).toBeNull();
  });

  // ── Editable mode ──────────────────────────────────────────────────────────

  it("shows 'Add career entry' button in editable mode", async () => {
    setup({ editable: true });
    await screen.findByText("Sporting CP");
    expect(
      screen.getByRole("button", { name: /add.*career|add.*entry/i })
    ).toBeInTheDocument();
  });

  it("opens add form when 'Add career entry' is clicked", async () => {
    setup({ editable: true });
    await screen.findByText("Sporting CP");
    await user.click(screen.getByRole("button", { name: /add.*career|add.*entry/i }));
    expect(
      await screen.findByRole("dialog") ||
      await screen.findByLabelText(/club name/i)
    ).toBeInTheDocument();
  });

  it("submits add form and calls addCareerEntry", async () => {
    setup({ editable: true });
    await screen.findByText("Sporting CP");
    await user.click(screen.getByRole("button", { name: /add.*career|add.*entry/i }));

    const clubInput = await screen.findByLabelText(/club name/i);
    const startInput = screen.getByLabelText(/start date/i);

    await user.type(clubInput, "Benfica");
    await user.type(startInput, "2024-01-01");
    await user.click(screen.getByRole("button", { name: /save|add|confirm/i }));

    await waitFor(() => {
      expect(playerApi.addCareerEntry).toHaveBeenCalledWith(
        "player-1",
        expect.objectContaining({ clubName: "Benfica", startDate: "2024-01-01" })
      );
    });
  });

  it("shows validation error when club name is empty on submit", async () => {
    setup({ editable: true });
    await screen.findByText("Sporting CP");
    await user.click(screen.getByRole("button", { name: /add.*career|add.*entry/i }));
    await user.click(await screen.findByRole("button", { name: /save|add|confirm/i }));

    expect(await screen.findByText(/club name is required/i)).toBeInTheDocument();
    expect(playerApi.addCareerEntry).not.toHaveBeenCalled();
  });

  it("shows edit button per entry and opens edit form", async () => {
    setup({ editable: true });
    const editButtons = await screen.findAllByRole("button", { name: /edit/i });
    expect(editButtons.length).toBeGreaterThan(0);
    await user.click(editButtons[0]);
    // Form should be populated with existing values
    expect(await screen.findByDisplayValue(/FC Porto|Sporting CP/)).toBeInTheDocument();
  });

  it("confirms before deleting a career entry", async () => {
    // Mock window.confirm
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);
    setup({ editable: true });
    const deleteButtons = await screen.findAllByRole("button", { name: /delete|remove/i });
    await user.click(deleteButtons[0]);

    await waitFor(() => {
      expect(playerApi.deleteCareerEntry).toHaveBeenCalled();
    });
    confirmSpy.mockRestore();
  });

  it("does NOT delete when user cancels confirmation", async () => {
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);
    setup({ editable: true });
    const deleteButtons = await screen.findAllByRole("button", { name: /delete|remove/i });
    await user.click(deleteButtons[0]);
    expect(playerApi.deleteCareerEntry).not.toHaveBeenCalled();
    confirmSpy.mockRestore();
  });

  // ── Error state ─────────────────────────────────────────────────────────────

  it("shows error state when API call fails", async () => {
    (playerApi.getCareerHistory as ReturnType<typeof vi.fn>).mockRejectedValue(
      new Error("Server error")
    );
    setup();
    expect(
      await screen.findByText(/error|failed|try again/i)
    ).toBeInTheDocument();
  });
});

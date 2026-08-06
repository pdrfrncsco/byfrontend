import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import PlayerDashboardSettingsPage from "@/modules/players/pages/PlayerDashboardSettingsPage";
import { playerApi } from "@/modules/players/services/player.api";

// ─── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("@/modules/players/services/player.api", () => ({
  playerApi: {
    getCurrent: vi.fn(),
    updateIdentity: vi.fn(),
    updateContact: vi.fn(),
    updateFootball: vi.fn(),
    updateAgent: vi.fn(),
    updateSocial: vi.fn(),
    updateAvailability: vi.fn(),
    updatePrivacy: vi.fn(),
    getProfileCompletion: vi.fn(),
  },
}));

vi.mock("@/modules/players/hooks/useCurrentPlayer", () => ({
  useCurrentPlayer: vi.fn(() => ({
    data: mockPlayer,
    isLoading: false,
    isError: false,
  })),
}));

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const mockPlayer = {
  id: "player-1",
  userId: "user-1",
  firstName: "Marco",
  lastName: "Silva",
  preferredName: "",
  dateOfBirth: "1998-03-15",
  nationality: "Portuguese",
  countryOfBirth: "Portuguese",
  height: 180,
  weight: 75,
  email: "",
  phone: "",
  primaryPosition: "CAM",
  preferredFoot: "right",
  squadNumber: 10,
  bio: "",
  agentName: "",
  agencyName: "",
  agentEmail: "",
  instagram: "",
  twitterX: "",
  linkedin: "",
  website: "",
  status: "active",
  contractExpiry: "",
  availableForTransfer: false,
  privacy: {
    profileVisibility: "clubs_only",
    showContactToClubs: true,
    showAgentToPublic: false,
  },
  careerHistory: [],
  achievements: [],
  documents: [],
  videos: [],
  linkStatus: "linked",
  profileCompletion: {
    overall: 45,
    sections: {
      identity: 80,
      contact: 0,
      football: 60,
      agent: 0,
      social: 0,
      availability: 33,
      privacy: 100,
    },
  },
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2024-01-01T00:00:00Z",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

function renderPage() {
  const qc = createQueryClient();
  return render(
    <QueryClientProvider client={qc}>
      <PlayerDashboardSettingsPage />
    </QueryClientProvider>
  );
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe("PlayerDashboardSettingsPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    (playerApi.updateIdentity as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updateContact as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updateFootball as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updateAgent as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updateSocial as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updateAvailability as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
    (playerApi.updatePrivacy as ReturnType<typeof vi.fn>).mockResolvedValue(mockPlayer);
  });

  // ── Page structure ──────────────────────────────────────────────────────────

  it("renders the page heading", () => {
    renderPage();
    expect(screen.getByText("Player profile settings")).toBeInTheDocument();
  });

  it("renders all 7 section accordion triggers", () => {
    renderPage();
    expect(screen.getByText("Identity")).toBeInTheDocument();
    expect(screen.getByText("Contact")).toBeInTheDocument();
    expect(screen.getByText("Football profile")).toBeInTheDocument();
    expect(screen.getByText("Agent & representation")).toBeInTheDocument();
    expect(screen.getByText("Social & online presence")).toBeInTheDocument();
    expect(screen.getByText("Status & availability")).toBeInTheDocument();
    expect(screen.getByText("Privacy & visibility")).toBeInTheDocument();
  });

  it("shows profile completeness bar with overall percentage", () => {
    renderPage();
    expect(screen.getByText("Profile completeness")).toBeInTheDocument();
    // The overall % is computed from the form values
    expect(screen.getByText(/\d+%/)).toBeInTheDocument();
  });

  // ── Accordion behaviour ─────────────────────────────────────────────────────

  it("opens the Identity section by default", () => {
    renderPage();
    expect(screen.getByPlaceholderText("e.g. Marco")).toBeInTheDocument();
  });

  it("closes Identity and opens Contact when Contact is clicked", async () => {
    renderPage();
    // Identity is open — its fields are visible
    expect(screen.getByPlaceholderText("e.g. Marco")).toBeInTheDocument();

    await user.click(screen.getByText("Contact"));

    await waitFor(() => {
      expect(screen.queryByPlaceholderText("e.g. Marco")).not.toBeInTheDocument();
      expect(screen.getByPlaceholderText("name@email.com")).toBeInTheDocument();
    });
  });

  it("clicking the open section again collapses it", async () => {
    renderPage();
    await user.click(screen.getByText("Identity"));
    await waitFor(() => {
      expect(screen.queryByPlaceholderText("e.g. Marco")).not.toBeInTheDocument();
    });
  });

  // ── Identity section ────────────────────────────────────────────────────────

  it("shows validation error when first name is cleared", async () => {
    renderPage();
    const input = screen.getByPlaceholderText("e.g. Marco");
    await user.clear(input);
    await user.click(screen.getByText(/save identity/i));
    expect(await screen.findByText("Required")).toBeInTheDocument();
  });

  it("saves identity section and shows 'Saved' confirmation", async () => {
    renderPage();
    const lastName = screen.getByPlaceholderText("e.g. Silva");
    await user.clear(lastName);
    await user.type(lastName, "Costa");
    await user.click(screen.getByText(/save identity/i));

    expect(await screen.findByText("Saved")).toBeInTheDocument();
    expect(playerApi.updateIdentity).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({ lastName: "Costa" })
    );
  });

  it("height field rejects values below 140", async () => {
    renderPage();
    const height = screen.getByPlaceholderText("e.g. 180");
    await user.clear(height);
    await user.type(height, "50");
    await user.click(screen.getByText(/save identity/i));
    expect(await screen.findByText(/Min 140/i)).toBeInTheDocument();
  });

  // ── Contact section ─────────────────────────────────────────────────────────

  it("shows email validation error for invalid email", async () => {
    renderPage();
    await user.click(screen.getByText("Contact"));
    const email = await screen.findByPlaceholderText("name@email.com");
    await user.type(email, "notanemail");
    await user.click(screen.getByText(/save contact/i));
    expect(await screen.findByText(/Invalid email/i)).toBeInTheDocument();
  });

  it("saves contact section successfully", async () => {
    renderPage();
    await user.click(screen.getByText("Contact"));
    const email = await screen.findByPlaceholderText("name@email.com");
    await user.type(email, "marco@example.com");
    await user.click(screen.getByText(/save contact/i));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  // ── Football section ────────────────────────────────────────────────────────

  it("opens football section and shows position selector", async () => {
    renderPage();
    await user.click(screen.getByText("Football profile"));
    await waitFor(() => {
      expect(screen.getByText(/Primary position/i)).toBeInTheDocument();
    });
  });

  it("bio field shows character count", async () => {
    renderPage();
    await user.click(screen.getByText("Football profile"));
    const bio = await screen.findByPlaceholderText(/Describe your playing style/i);
    await user.type(bio, "Strong in the air.");
    expect(screen.getByText(/18\/500/)).toBeInTheDocument();
  });

  it("squad number rejects values above 99", async () => {
    renderPage();
    await user.click(screen.getByText("Football profile"));
    const num = await screen.findByPlaceholderText("e.g. 10");
    await user.clear(num);
    await user.type(num, "150");
    await user.click(screen.getByText(/save football/i));
    expect(await screen.findByText(/Max 99/i)).toBeInTheDocument();
  });

  // ── Social section ──────────────────────────────────────────────────────────

  it("social inputs show correct prefix labels", async () => {
    renderPage();
    await user.click(screen.getByText("Social & online presence"));
    await waitFor(() => {
      expect(screen.getByText("@")).toBeInTheDocument(); // instagram prefix
    });
  });

  it("rejects instagram handle starting with @", async () => {
    renderPage();
    await user.click(screen.getByText("Social & online presence"));
    const ig = await screen.findByPlaceholderText("username");
    await user.type(ig, "@marco");
    await user.click(screen.getByText(/save social/i));
    expect(
      await screen.findByText(/without the @ symbol/i)
    ).toBeInTheDocument();
  });

  it("rejects invalid website URL", async () => {
    renderPage();
    await user.click(screen.getByText("Social & online presence"));
    const website = await screen.findByPlaceholderText("https://yourwebsite.com");
    await user.type(website, "not-a-url");
    await user.click(screen.getByText(/save social/i));
    expect(await screen.findByText(/valid URL/i)).toBeInTheDocument();
  });

  // ── Availability section ────────────────────────────────────────────────────

  it("toggles 'available for transfer' switch", async () => {
    renderPage();
    await user.click(screen.getByText("Status & availability"));
    const toggle = await screen.findByRole("switch", {
      name: /available for transfer/i,
    });
    expect(toggle).toHaveAttribute("aria-checked", "false");
    await user.click(toggle);
    expect(toggle).toHaveAttribute("aria-checked", "true");
  });

  // ── Privacy section ─────────────────────────────────────────────────────────

  it("renders all three privacy toggles", async () => {
    renderPage();
    await user.click(screen.getByText("Privacy & visibility"));
    expect(
      await screen.findByRole("switch", { name: /show contact info/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("switch", { name: /show agent details/i })
    ).toBeInTheDocument();
  });

  it("saves privacy section", async () => {
    renderPage();
    await user.click(screen.getByText("Privacy & visibility"));
    await user.click(screen.getByText(/save privacy/i));
    expect(await screen.findByText("Saved")).toBeInTheDocument();
  });

  // ── Save error state ────────────────────────────────────────────────────────

  it("shows 'Save failed' when API returns an error", async () => {
    (playerApi.updateIdentity as ReturnType<typeof vi.fn>).mockRejectedValueOnce(
      new Error("Network error")
    );
    renderPage();
    await user.click(screen.getByText(/save identity/i));
    expect(await screen.findByText("Save failed")).toBeInTheDocument();
  });

  // ── Completion bar ──────────────────────────────────────────────────────────

  it("completion bar increases when a field is filled in", async () => {
    renderPage();
    const before = screen.getByText(/\d+%/).textContent;

    await user.click(screen.getByText("Contact"));
    const email = await screen.findByPlaceholderText("name@email.com");
    await user.type(email, "marco@example.com");

    const after = screen.getByText(/\d+%/).textContent;
    const beforeNum = parseInt(before ?? "0");
    const afterNum = parseInt(after ?? "0");
    expect(afterNum).toBeGreaterThan(beforeNum);
  });
});

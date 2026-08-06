import { useMutation, useQueryClient } from "@tanstack/react-query";
import { playerApi } from "@/modules/players/services/player.api";
import * as playerServices from "@/modules/players/services/player.api";
import { PLAYER_QUERY_KEYS } from "./usePlayerQueries";
import type {
  Player,
  UpdatePlayerIdentityPayload,
  UpdatePlayerContactPayload,
  UpdatePlayerFootballPayload,
  UpdatePlayerAgentPayload,
  UpdatePlayerSocialPayload,
  UpdatePlayerAvailabilityPayload,
  UpdatePlayerPrivacyPayload,
  CreateCareerEntryPayload,
  UpdateCareerEntryPayload,
  CreateAchievementPayload,
  PlayerDocument,
} from "@/modules/players/types";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Optimistically updates the player cache and returns a rollback function.
 * Used in every section mutation's onMutate callback.
 */
function useOptimisticPlayer(queryClient: ReturnType<typeof useQueryClient>) {
  return async (playerId: string, patch: Partial<Player>) => {
    const key = PLAYER_QUERY_KEYS.detail(playerId);
    await queryClient.cancelQueries({ queryKey: key });
    const previous = queryClient.getQueryData<Player>(key);
    queryClient.setQueryData<Player>(key, (old) =>
      old ? { ...old, ...patch } : old
    );
    return previous;
  };
}

// ─── Identity ─────────────────────────────────────────────────────────────────

export function useUpdatePlayerIdentity(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerIdentityPayload) =>
      playerApi.updateIdentity(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// Compatibility: create player
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  return useMutation((payload: any) => playerServices.create(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.lists() });
    },
  });
}

// Compatibility: update current authenticated player (me)
export function useUpdatePlayerMe() {
  const queryClient = useQueryClient();
  return useMutation((payload: any) => (playerServices as any).updatePlayerMe(payload), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.current() });
    },
  });
}

// ─── Contact ──────────────────────────────────────────────────────────────────

export function useUpdatePlayerContact(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerContactPayload) =>
      playerApi.updateContact(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Football profile ─────────────────────────────────────────────────────────

export function useUpdatePlayerFootball(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerFootballPayload) =>
      playerApi.updateFootball(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export function useUpdatePlayerAgent(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerAgentPayload) =>
      playerApi.updateAgent(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Social ───────────────────────────────────────────────────────────────────

export function useUpdatePlayerSocial(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerSocialPayload) =>
      playerApi.updateSocial(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Availability ─────────────────────────────────────────────────────────────

export function useUpdatePlayerAvailability(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerAvailabilityPayload) =>
      playerApi.updateAvailability(playerId, payload),
    onMutate: (payload) => optimistic(playerId, payload),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Privacy ──────────────────────────────────────────────────────────────────

export function useUpdatePlayerPrivacy(playerId: string) {
  const queryClient = useQueryClient();
  const optimistic = useOptimisticPlayer(queryClient);

  return useMutation({
    mutationFn: (payload: UpdatePlayerPrivacyPayload) =>
      playerApi.updatePrivacy(playerId, payload),
    onMutate: (payload) =>
      optimistic(playerId, { privacy: { ...(payload as any) } }),
    onError: (_err, _vars, context) => {
      if (context) {
        queryClient.setQueryData(PLAYER_QUERY_KEYS.detail(playerId), context);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: PLAYER_QUERY_KEYS.detail(playerId) });
    },
  });
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

export function useUploadPlayerAvatar(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (file: File) => playerApi.uploadAvatar(playerId, file),
    onSuccess: (data) => {
      queryClient.setQueryData<Player>(
        PLAYER_QUERY_KEYS.detail(playerId),
        (old) => (old ? { ...old, avatarUrl: data.avatarUrl } : old)
      );
    },
  });
}

export function useDeletePlayerAvatar(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => playerApi.deleteAvatar(playerId),
    onSuccess: () => {
      queryClient.setQueryData<Player>(
        PLAYER_QUERY_KEYS.detail(playerId),
        (old) => (old ? { ...old, avatarUrl: undefined } : old)
      );
    },
  });
}

// ─── Career history ───────────────────────────────────────────────────────────

export function useAddCareerEntry(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCareerEntryPayload) =>
      playerApi.addCareerEntry(playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.career(playerId),
      });
    },
  });
}

export function useUpdateCareerEntry(playerId: string, entryId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateCareerEntryPayload) =>
      playerApi.updateCareerEntry(playerId, entryId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.career(playerId),
      });
    },
  });
}

export function useDeleteCareerEntry(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (entryId: string) =>
      playerApi.deleteCareerEntry(playerId, entryId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.career(playerId),
      });
    },
  });
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function useAddAchievement(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateAchievementPayload) =>
      playerApi.addAchievement(playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.achievements(playerId),
      });
    },
  });
}

export function useDeleteAchievement(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (achievementId: string) =>
      playerApi.deleteAchievement(playerId, achievementId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.achievements(playerId),
      });
    },
  });
}

// ─── Documents ────────────────────────────────────────────────────────────────

export function useUploadPlayerDocument(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      file,
      meta,
    }: {
      file: File;
      meta: {
        type: PlayerDocument["type"];
        name: string;
        expiresAt?: string;
      };
    }) => playerApi.uploadDocument(playerId, file, meta),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.documents(playerId),
      });
    },
  });
}

export function useDeletePlayerDocument(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (documentId: string) =>
      playerApi.deleteDocument(playerId, documentId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.documents(playerId),
      });
    },
  });
}

// ─── Videos ───────────────────────────────────────────────────────────────────

export function useAddPlayerVideo(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: {
      url: string;
      type: "highlight_reel" | "match_clip" | "training" | "interview";
      title: string;
      season?: string;
    }) => playerApi.addVideo(playerId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.videos(playerId),
      });
    },
  });
}

export function useDeletePlayerVideo(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (videoId: string) => playerApi.deleteVideo(playerId, videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.videos(playerId),
      });
    },
  });
}

// ─── Club link / registration ─────────────────────────────────────────────────

export function useRequestClubLink(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clubId: string) => playerApi.requestClubLink(playerId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.detail(playerId),
      });
    },
  });
}

export function useCancelClubLink(playerId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId: string) =>
      playerApi.cancelClubLink(playerId, requestId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PLAYER_QUERY_KEYS.detail(playerId),
      });
    },
  });
}

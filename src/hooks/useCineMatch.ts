import { useMutation } from "@tanstack/react-query";
import { getCineMatchSuggestion } from "../service/appData";
import type { CineMatchMode } from "../types";

export function useCineMatch() {
  return useMutation({
    mutationFn: ({
      currentUserId,
      friendUserId,
      mode,
    }: {
      currentUserId: string;
      friendUserId: string;
      mode: CineMatchMode;
    }) => getCineMatchSuggestion(currentUserId, friendUserId, mode),
  });
}

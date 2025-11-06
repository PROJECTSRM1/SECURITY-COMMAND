import type { RootState } from "../../store.ts";

export const selectPosts = (state: RootState) => state.posts;
export const selectLoading = (state: RootState) => state.posts;
export const selectError = (state: RootState) => state.posts;

import { configureStore } from "@reduxjs/toolkit";
import themeReducer from "./features/theme/themeSlice";
import userReducer from "./features/user/userSlice";
import postsReducer from "./features/posts/postsSlice";

export const store = configureStore({
  reducer: {
    theme: themeReducer,
    user: userReducer,
    posts: postsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

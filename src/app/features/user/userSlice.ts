import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import type { User, UserState } from "./userTypes";
import { baseUrl } from "../../../utils/constants/config";

export const fetchUserById = createAsyncThunk<User, number>(
  "user/fetchUserById",
  async (userId) => {
    const response = await fetch(`${baseUrl}/users/${userId}`);
    if (!response.ok) throw new Error("Failed to fetch user data");
    const data = await response.json();
    return data as User;
  }
);

export const loginUser = createAsyncThunk<any, { email: string; password: string }>(
  "user/loginUser",
  async (credentials, { rejectWithValue }) => {
    const options:any = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    try {
      const response = await fetch(`${baseUrl}/Login/login?email=${credentials.email}&password=${credentials.password}`, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Login failed");
      }

      const data = await response.json();
      return data as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const registerUser = createAsyncThunk<any, { first_name: string; last_name: string; email: string; mobile:string; password: string }>(
  "user/registerUser",
  async (credentials, { rejectWithValue }) => {
    const options:any = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      }
    try {
      const response = await fetch(`${baseUrl}/User/register`, options);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Register failed");
      }

      const data = await response.json();
      return data as User;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const initialState: UserState = {
  user: null,
  loading: false,
  error: null,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Something went wrong";
      })
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error =
          (action.payload as string) || "Invalid username or password";
      });
  },
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;

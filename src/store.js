import { configureStore } from "@reduxjs/toolkit";
import { Api } from "./services/Api";
import userReducer from "./features/user/userSlice";

export const store = configureStore({
  reducer: {
    [Api.reducerPath]: Api.reducer,
    user: userReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(Api.middleware),
});

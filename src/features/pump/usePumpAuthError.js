import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { clearUser } from "../user/userSlice";

export const usePumpAuthError = (error) => {
  const navigate = useNavigate(); const dispatch = useDispatch();
  useEffect(() => {
    if (error?.status !== 401) return;
    localStorage.removeItem("accessToken"); dispatch(clearUser()); dispatch({ type: "api/resetApiState" }); navigate("/login", { replace: true });
  }, [dispatch, error, navigate]);
};

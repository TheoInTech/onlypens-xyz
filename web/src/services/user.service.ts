import { IApiResponseOnboarding, IUser } from "@/schema/user.schema";
import axios from "axios";

export const saveProfileOnboarding = async (payload: IUser) => {
  return axios
    .post<IApiResponseOnboarding>(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    )
    .then((res) => res.data);
};

export const getUserProfile = async () => {
  return axios
    .get<IUser>(`${process.env.NEXT_PUBLIC_SITE_URL}/api/users/me`, {
      withCredentials: true,
    })
    .then((res) => res.data);
};

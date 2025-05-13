import { IDashboardResponse } from "@/schema/dashboard.schema";
import axios from "axios";

export const getDashboardData = async (): Promise<IDashboardResponse> => {
  return axios
    .get<IDashboardResponse>(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/dashboard`,
      {
        withCredentials: true,
      }
    )
    .then((res) => res.data);
};

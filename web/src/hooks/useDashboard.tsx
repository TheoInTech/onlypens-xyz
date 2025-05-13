import { getDashboardData } from "@/services/dashboard.service";
import { useQuery } from "@tanstack/react-query";

const useDashboard = () => {
  const { data: dashboardData, isLoading: isLoadingDashboard } = useQuery({
    queryKey: ["dashboard"],
    queryFn: getDashboardData,
  });

  return { dashboardData, isLoadingDashboard };
};

export default useDashboard;

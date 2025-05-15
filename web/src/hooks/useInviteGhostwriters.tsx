import { getGhostwriterProfiles } from "@/services/matchmaker.service";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";

const useInviteGhostwriters = (gigId: string) => {
  const { address } = useAccount();
  const {
    data: ghostwriterProfiles,
    isLoading: isLoadingGhostwriterProfiles,
    refetch: refetchGhostwriterProfiles,
  } = useQuery({
    queryKey: ["gig", gigId, "ghostwriter-profiles"],
    queryFn: () => getGhostwriterProfiles(gigId, address?.toString() || ""),
    enabled: gigId !== undefined && gigId !== "" && gigId !== null && !!address,
  });

  return {
    ghostwriterProfiles,
    isLoadingGhostwriterProfiles,
    refetchGhostwriterProfiles,
  };
};

export default useInviteGhostwriters;

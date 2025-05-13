import { getGig } from "@/services/gigs.service";
import { useQuery } from "@tanstack/react-query";

const useGig = (gigId: string) => {
  const { data: gigData, isLoading: isLoadingGig } = useQuery({
    queryKey: ["gig", gigId],
    queryFn: () => getGig(gigId),
    // Gig ID can be 0
    enabled: gigId !== undefined && gigId !== "" && gigId !== null,
  });

  return { gigData, isLoadingGig };
};

export default useGig;

import { getGigs } from "@/services/gigs.service";
import { useQuery } from "@tanstack/react-query";

const useGigs = () => {
  const { data: gigsData, isLoading: isLoadingGigs } = useQuery({
    queryKey: ["gigs"],
    queryFn: () => getGigs(),
  });

  return { gigsData, isLoadingGigs };
};

export default useGigs;

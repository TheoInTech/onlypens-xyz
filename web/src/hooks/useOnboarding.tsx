import { saveProfileOnboarding } from "@/services/user.service";
import { useMutation } from "@tanstack/react-query";

const useOnboarding = () => {
  const { mutateAsync: saveProfile, isPending: isSavingProfile } = useMutation({
    mutationFn: saveProfileOnboarding,
    mutationKey: ["profile-onboarding"],
  });

  return { saveProfile, isSavingProfile };
};

export default useOnboarding;

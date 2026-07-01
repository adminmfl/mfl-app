import { useMutation } from '@tanstack/react-query';
import { setPassword } from '../services/password-setup.service';
import { useAuth } from '../../../core/auth';
import { reportError } from '../../../core/utils/report-error';

interface SetPasswordInput {
  password: string;
}

export function useSetPassword() {
  const { completePasswordSetup } = useAuth();

  return useMutation<void, Error, SetPasswordInput>({
    mutationFn: async ({ password }) => {
      await setPassword(password);
    },
    onSuccess: () => {
      completePasswordSetup();
    },
    onError: (error) => {
      reportError(error);
    },
  });
}

import { View } from 'react-native';
import { Button } from 'heroui-native';
import { useRouter } from 'expo-router';

import { AppText } from '../../../components/app-text';
import { mflColors } from '../../../constants/colors';
import { AppRoutes } from '../../../core/config/routes';

interface SubmissionRejectionAlertProps {
  status: string;
  rejectionReason: string | null | undefined;
  submissionId: string;
  canReuploadNow: boolean;
  windowExpired: boolean;
}

export function SubmissionRejectionAlert({
  status,
  rejectionReason,
  submissionId,
  canReuploadNow,
  windowExpired,
}: SubmissionRejectionAlertProps) {
  const router = useRouter();
  const isPermanent = status === 'rejected_permanent';

  return (
    <View className="rounded-lg p-3" style={{ backgroundColor: mflColors.dangerLight }}>
      <AppText className="text-xs font-semibold" style={{ color: mflColors.danger }}>
        {isPermanent ? 'Permanently Rejected' : 'Submission Rejected'}
      </AppText>

      {isPermanent ? (
        <View>
          <AppText className="text-xs mt-1" style={{ color: mflColors.danger }}>
            This submission has been permanently rejected. You cannot resubmit.
          </AppText>
          {rejectionReason ? (
            <AppText className="text-xs mt-2 font-medium" style={{ color: mflColors.danger }}>
              Reason: {rejectionReason}
            </AppText>
          ) : null}
        </View>
      ) : (
        <View>
          {canReuploadNow ? (
            <View className="mt-1">
              <AppText className="text-xs" style={{ color: mflColors.danger }}>
                You can resubmit this workout with updated proof or corrections.
              </AppText>
              {rejectionReason ? (
                <AppText className="text-xs mt-1 italic font-medium" style={{ color: mflColors.danger }}>
                  Reason: "{rejectionReason}"
                </AppText>
              ) : null}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onPress={() =>
                  router.push({
                    pathname: AppRoutes.reuploadSubmission,
                    params: { submissionId },
                  })
                }
              >
                <Button.Label>Resubmit</Button.Label>
              </Button>
            </View>
          ) : null}
          {windowExpired ? (
            <View className="mt-1">
              <AppText className="text-xs" style={{ color: mflColors.danger }}>
                Reupload window closed (allowed until next-day 11:59pm local time after rejection).
              </AppText>
              {rejectionReason ? (
                <AppText className="text-xs mt-1 italic font-medium" style={{ color: mflColors.danger }}>
                  Reason: "{rejectionReason}"
                </AppText>
              ) : null}
            </View>
          ) : null}
        </View>
      )}
    </View>
  );
}

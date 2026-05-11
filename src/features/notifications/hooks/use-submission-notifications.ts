import { useMemo } from 'react';
import { mflColors } from '../../../constants/colors';
import { useMySubmissions } from '../../submissions';
import type { AppNotification } from '../types/notification.types';

export function useSubmissionNotifications(
  leagueId: string,
  leagueName: string,
): AppNotification[] {
  const { data: submissionsData } = useMySubmissions(leagueId);

  return useMemo(() => {
    const submissions = submissionsData?.submissions;
    if (!submissions) return [];

    const recentCutoff = new Date();
    recentCutoff.setDate(recentCutoff.getDate() - 7);

    return submissions
      .filter((s) => {
        const date = new Date(s.createdDate);
        return (
          date >= recentCutoff &&
          (s.status === 'approved' || s.status === 'rejected')
        );
      })
      .map((s): AppNotification => {
        const isApproved = s.status === 'approved';
        const label = s.customActivityName ?? s.workoutType ?? s.type;
        return {
          id: `submission-${s.id}`,
          type: isApproved ? 'submission_approved' : 'submission_rejected',
          title: isApproved ? 'Submission Approved' : 'Submission Rejected',
          message: isApproved
            ? `Your ${label} activity in ${leagueName} was approved (+${s.effectivePoints ?? s.rrValue ?? 0} RR).`
            : `Your ${label} activity in ${leagueName} was rejected${
                s.rejectionReason ? `: ${s.rejectionReason}` : '.'
              }`,
          timestamp: s.createdDate,
          isRead: isApproved,
          icon: isApproved ? 'check-circle' : 'x-circle',
          iconColor: isApproved ? mflColors.brand : mflColors.danger,
          iconBg: isApproved ? mflColors.brandLight : mflColors.dangerLight,
        };
      });
  }, [submissionsData, leagueName]);
}

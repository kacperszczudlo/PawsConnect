import { supabase } from '../supabase';
import type { ProfileSyncIdentity } from './resolveProfileSyncPlan';
import { runBatchUpdates } from './runBatchUpdates';

export const syncUserApplicantRowsInApplications = async (params: {
  applicantUserId: string;
  identity: ProfileSyncIdentity;
}): Promise<void> => {
  const { applicantUserId, identity } = params;
  const { nextName, originalFullName } = identity;

  const { errors } = await runBatchUpdates([
    supabase.from('applications').update({ applicant_name: nextName }).eq('applicant_id', applicantUserId).select('id'),
    originalFullName
      ? supabase
          .from('applications')
          .update({ applicant_name: nextName })
          .eq('applicant_name', originalFullName)
          .select('id')
      : null,
  ]);

  if (errors.length > 0) {
    throw errors[0];
  }
};

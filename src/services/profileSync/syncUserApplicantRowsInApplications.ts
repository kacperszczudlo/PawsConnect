import { supabase } from '../supabase';
import type { ProfileSyncIdentity } from './resolveProfileSyncPlan';
import { runBatchUpdates } from './runBatchUpdates';

export const syncUserApplicantRowsInApplications = async (params: {
  applicantUserId: string;
  identity: ProfileSyncIdentity;
}): Promise<void> => {
  const { applicantUserId, identity } = params;
  const { originalFullName } = identity;

  const { errors } = await runBatchUpdates([
    supabase
      .from('applications')
      .update({
        applicant_name: identity.nextName,
        applicant_email: identity.nextEmail,
        applicant_phone: identity.nextPhone,
        applicant_city: identity.nextCity,
        applicant_avatar_url: identity.nextAvatarUrl ?? '',
      })
      .eq('applicant_id', applicantUserId)
      .select('id'),
    originalFullName
      ? supabase
          .from('applications')
          .update({ applicant_name: identity.nextName })
          .eq('applicant_name', originalFullName)
          .select('id')
      : null,
  ]);

  if (errors.length > 0) {
    throw errors[0];
  }
};

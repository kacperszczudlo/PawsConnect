import type { User } from '@supabase/supabase-js';
import type { ProfileSyncShelterPort } from './profileSync/profileSyncShelterPort';
import { commitAuthProfileUpdate } from './profileSync/commitAuthProfileUpdate';
import { resolveProfileSyncPlan } from './profileSync/resolveProfileSyncPlan';
import { syncAdminShelterDenormalizedTables } from './profileSync/syncAdminShelterDenormalizedTables';
import { syncUserApplicantRowsInApplications } from './profileSync/syncUserApplicantRowsInApplications';
import type { ProfileSyncDraft } from './profileSync/types';

export type { EditableProfileRole, ProfileSyncDraft } from './profileSync/types';

export const syncProfileEverywhere = async (
  draft: ProfileSyncDraft,
  shelterPort: ProfileSyncShelterPort,
): Promise<User> => {
  const plan = resolveProfileSyncPlan(draft);
  const user = await commitAuthProfileUpdate(plan.authPayload);

  if (draft.role === 'admin') {
    await syncAdminShelterDenormalizedTables({ draft, identity: plan.identity, shelterPort });
  } else {
    await syncUserApplicantRowsInApplications({ applicantUserId: user.id, identity: plan.identity });
    shelterPort.applyUserApplicantNameLocalSync({
      userId: user.id,
      originalFullName: plan.identity.originalFullName,
      nextName: plan.identity.nextName,
      nextEmail: plan.identity.nextEmail,
      nextPhone: plan.identity.nextPhone,
      nextCity: plan.identity.nextCity,
      nextAvatarUrl: plan.identity.nextAvatarUrl,
    });
  }

  await shelterPort.refreshShelterLists();

  return user;
};

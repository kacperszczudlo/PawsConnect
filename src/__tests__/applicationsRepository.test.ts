import type { SupabaseClient } from '@supabase/supabase-js';
import { createApplicationsRepository } from '../repositories/applicationsRepository';

const clone = <T>(value: T): T => JSON.parse(JSON.stringify(value));
const createRepository = (client: unknown) =>
  createApplicationsRepository(client as SupabaseClient);

describe('applicationsRepository', () => {
  describe('submitUserApplication', () => {
    it('retries without optional applicant snapshot columns when schema is missing them', async () => {
      const insertedRows: Array<Record<string, unknown>> = [];
      const insert = jest
        .fn()
        .mockImplementationOnce(
          async (rows: Array<Record<string, unknown>>) => {
            insertedRows.push(clone(rows[0]));
            return {
              error: {
                code: '42703',
                message: 'column applicant_phone does not exist',
              },
            };
          },
        )
        .mockImplementationOnce(
          async (rows: Array<Record<string, unknown>>) => {
            insertedRows.push(clone(rows[0]));
            return { error: null };
          },
        );
      const client = {
        from: jest.fn(() => ({ insert })),
      };

      const result = await createRepository(client).submitUserApplication({
        animal_id: 'animal-1',
        shelter_user_id: 'shelter-1',
        applicant_email: 'user@example.com',
        applicant_phone: '123456789',
        applicant_city: 'Warszawa',
        applicant_avatar_url: 'avatar.jpg',
        applicant_message: 'Proszę o kontakt',
      });

      expect(result).toEqual({ ok: true });
      expect(insertedRows[0]).toMatchObject({
        shelter_user_id: 'shelter-1',
        applicant_phone: '123456789',
      });
      expect(insertedRows[1]).toEqual({
        animal_id: 'animal-1',
        shelter_user_id: 'shelter-1',
      });
    });

    it('retries without shelter_user_id when legacy schema does not have ownership column', async () => {
      const insertedRows: Array<Record<string, unknown>> = [];
      const insert = jest
        .fn()
        .mockImplementationOnce(
          async (rows: Array<Record<string, unknown>>) => {
            insertedRows.push(clone(rows[0]));
            return {
              error: {
                code: '42703',
                message: 'column shelter_user_id does not exist',
              },
            };
          },
        )
        .mockImplementationOnce(
          async (rows: Array<Record<string, unknown>>) => {
            insertedRows.push(clone(rows[0]));
            return { error: null };
          },
        );
      const client = {
        from: jest.fn(() => ({ insert })),
      };

      const result = await createRepository(client).submitUserApplication({
        animal_id: 'animal-1',
        shelter_user_id: 'shelter-1',
        applicant_email: 'user@example.com',
      });

      expect(result).toEqual({ ok: true });
      expect(insertedRows[0]).toHaveProperty('shelter_user_id', 'shelter-1');
      expect(insertedRows[1]).toEqual({
        animal_id: 'animal-1',
        applicant_email: 'user@example.com',
      });
    });
  });

  describe('getAcceptedWalkConflict', () => {
    const createConflictClient = (rows: unknown[], error: unknown = null) => {
      const query: Record<string, jest.Mock> = {
        select: jest.fn(() => query),
        eq: jest.fn(() => query),
        neq: jest.fn(() => query),
        limit: jest.fn(async () => ({ data: rows, error })),
      };

      return {
        client: { from: jest.fn(() => query) },
        query,
      };
    };

    it('returns conflict details for already accepted walk on same animal and date', async () => {
      const { client, query } = createConflictClient([
        {
          applicant_name: 'Anna',
          date: '2026-05-20 12:00',
          animal_name: 'Mika',
        },
      ]);

      const result = await createRepository(client).getAcceptedWalkConflict({
        animalId: 'animal-1',
        date: '2026-05-20 12:00',
        excludeApplicationId: 'app-2',
      });

      expect(client.from).toHaveBeenCalledWith('applications');
      expect(query.eq).toHaveBeenCalledWith('animal_id', 'animal-1');
      expect(query.eq).toHaveBeenCalledWith('type', 'Spacer');
      expect(query.eq).toHaveBeenCalledWith('status', 'Zaakceptowane');
      expect(query.neq).toHaveBeenCalledWith('id', 'app-2');
      expect(result).toEqual({
        ok: false,
        reason: 'conflict',
        conflict: {
          applicantName: 'Anna',
          date: '2026-05-20 12:00',
          animalName: 'Mika',
        },
      });
    });

    it('allows reservation when there is no accepted walk conflict', async () => {
      const { client } = createConflictClient([]);

      await expect(
        createRepository(client).getAcceptedWalkConflict({
          animalId: 'animal-1',
          date: '2026-05-20 12:00',
          excludeApplicationId: 'app-2',
        }),
      ).resolves.toEqual({ ok: true, conflict: null });
    });
  });
});

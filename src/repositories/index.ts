import { supabase } from '../services/supabase';
import { createAnimalsRepository } from './animalsRepository';
import { createApplicationsRepository } from './applicationsRepository';

export const animalsRepository = createAnimalsRepository(supabase);
export const applicationsRepository = createApplicationsRepository(supabase);

export type { AnimalsRepository } from './animalsRepository';
export type { ApplicationsRepository } from './applicationsRepository';

import { z } from 'zod';

export const organizationStepSchema = z.object({
  name: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  type: z.string().min(1, 'Selecione o tipo de entidade'),
  location: z.string().min(3, 'A localização é obrigatória'),
  slug: z.string().optional(),
});

export const brandingStepSchema = z.object({
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida'),
  secondaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, 'Cor inválida'),
  logoUrl: z.string().url('URL inválido').optional().or(z.literal('')),
});

export const competitionStepSchema = z.object({
  name: z.string().optional(),
  competition_type: z.enum(['league', 'tournament', 'cup']),
  modality: z.enum(['futebol_11', 'futebol_7', 'futsal', 'praia']),
  season: z.string(),
});

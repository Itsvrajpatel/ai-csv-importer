import { z } from 'zod';

export const CRMLeadSchema = z.object({
  created_at: z.string().nullable().default(null),
  name: z.string().nullable().default(null),
  email: z.string().nullable().default(null),
  country_code: z.string().nullable().default(null),
  mobile_without_country_code: z.string().nullable().default(null),
  company: z.string().nullable().default(null),
  city: z.string().nullable().default(null),
  state: z.string().nullable().default(null),
  country: z.string().nullable().default(null),
  lead_owner: z.string().nullable().default(null),
  crm_status: z.string().nullable().default(null),
  crm_note: z.string().nullable().default(null),
  data_source: z.string().nullable().default(null),
  possession_time: z.string().nullable().default(null),
  description: z.string().nullable().default(null),
});

export const CRMLeadArraySchema = z.array(CRMLeadSchema);

export type CRMLead = z.infer<typeof CRMLeadSchema>;

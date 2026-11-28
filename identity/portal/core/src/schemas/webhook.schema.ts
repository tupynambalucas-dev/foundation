import { z } from 'zod';

export const PullRequestWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  repository: z
    .object({
      name: z.string().optional(),
      owner: z.object({ login: z.string().optional() }).optional(),
    })
    .optional(),
  pull_request: z
    .object({
      number: z.number().int().positive().optional(),
      draft: z.boolean().optional(),
      title: z.string().optional(),
      body: z.string().nullable().optional(),
      head: z.object({ sha: z.string().optional() }).optional(),
      user: z
        .object({
          id: z.number().int().positive().optional(),
          login: z.string().optional(),
          type: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});
export type PullRequestWebhookPayload = z.infer<typeof PullRequestWebhookPayloadSchema>;

export const CheckWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  repository: z
    .object({
      name: z.string().optional(),
      owner: z.object({ login: z.string().optional() }).optional(),
    })
    .optional(),
  check_suite: z
    .object({
      head_sha: z.string().optional(),
      conclusion: z.string().nullable().optional(),
      pull_requests: z.array(z.object({ number: z.number().optional() })).optional(),
    })
    .optional(),
  check_run: z
    .object({
      head_sha: z.string().optional(),
      conclusion: z.string().nullable().optional(),
      pull_requests: z.array(z.object({ number: z.number().optional() })).optional(),
    })
    .optional(),
});
export type CheckWebhookPayload = z.infer<typeof CheckWebhookPayloadSchema>;

export const InstallationWebhookPayloadSchema = z.object({
  action: z.string().optional(),
  installation: z
    .object({
      id: z.number().optional(),
      app_slug: z.string().optional(),
    })
    .optional(),
});
export type InstallationWebhookPayload = z.infer<typeof InstallationWebhookPayloadSchema>;

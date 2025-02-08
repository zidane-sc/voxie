import * as z from 'zod';

export const ThreadValidationSchema = z.object({
  thread: z.string().min(3).max(1000).nonempty(),
  accountId: z.string().nonempty(),
});

export const CommentValidationSchema = z.object({
  thread: z.string().min(3).max(1000).nonempty(),
});
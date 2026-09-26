import { z } from 'zod';

const templateCategoryEnum = z.enum([
  'FULL_TIME',
  'PART_TIME',
  'CONTRACT',
  'INTERNSHIP',
  'EXECUTIVE',
  'CONSULTANT',
]);

export const createTemplateSchema = z.object({
  title: z.string().min(3, 'Template title must be at least 3 characters long'),
  description: z.string().optional(),
  category: templateCategoryEnum.default('FULL_TIME'),
  contentMarkup: z.string().min(10, 'Template content markup must be at least 10 characters long'),
  headerMarkup: z.string().optional(),
  footerMarkup: z.string().optional(),
  styleCss: z.string().optional(),
  placeholdersSchema: z.array(z.string()).optional(),
});

export const updateTemplateSchema = z.object({
  title: z.string().min(3, 'Template title must be at least 3 characters long').optional(),
  description: z.string().optional(),
  category: templateCategoryEnum.optional(),
  contentMarkup: z.string().min(10).optional(),
  headerMarkup: z.string().optional(),
  footerMarkup: z.string().optional(),
  styleCss: z.string().optional(),
  placeholdersSchema: z.array(z.string()).optional(),
  changeSummary: z.string().optional(),
});

export const duplicateTemplateSchema = z.object({
  title: z.string().min(3).optional(),
});

export const toggleActiveSchema = z.object({
  isActive: z.boolean(),
});

export const aiSuggestSchema = z.object({
  contentMarkup: z.string().min(10, 'Markup or text must be at least 10 characters long'),
});

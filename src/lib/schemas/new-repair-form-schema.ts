import { z } from 'zod'
import { RefObject } from 'react'
import { REPAIR_TYPE_LIST } from '@/data/repair-type-list'

export const createFormSchema = ({
  maxDropsRef,
  maxLevelsRef,
}: {
  maxDropsRef?: RefObject<number | undefined>
  maxLevelsRef?: RefObject<number | undefined>
}) =>
  z
    .object({
      project_id: z.number().min(1, 'Project is required'),
      elevation: z.string().min(1, 'Elevation is required'),
      drop: z
        .number({ invalid_type_error: 'Drop must be a number' })
        .min(1, 'Drop must be at least 1')
        .refine(
          (value) => {
            const maxDrops = maxDropsRef?.current
            return maxDrops !== undefined ? value <= maxDrops : true
          },
          () => ({
            message: `Drop cannot exceed ${maxDropsRef?.current ?? 'unknown'}`,
          })
        ),
      level: z
        .number({ invalid_type_error: 'Level must be a number' })
        .min(1, 'Level must be at least 1')
        .refine(
          (value) => {
            const maxLevels = maxLevelsRef?.current
            return maxLevels !== undefined ? value <= maxLevels : true
          },
          () => ({
            message: `Level cannot exceed ${
              maxLevelsRef?.current ?? 'unknown'
            }`,
          })
        ),
      repair_type: z.string().min(1, 'Repair type is required'),
      repair_index: z.number().min(1, 'Repair index is required'),
      measurements: z.record(z.string(), z.number()),
      survey_image: z
        .string()
        .min(1, 'Survey image is required')
        .refine((val) => ['camera', 'uploaded'].includes(val), {
          message: 'Invalid survey image source',
        }),
      progress_image: z
        .array(
          z.string().refine((val) => ['camera', 'uploaded'].includes(val), {
            message: 'Invalid progress image source',
          })
        )
        .min(1, 'At least one progress image is required'),
      finish_image: z
        .string()
        .min(1, 'Finish image is required')
        .refine((val) => ['camera', 'uploaded'].includes(val), {
          message: 'Invalid finish image source',
        }),
    })
    .superRefine((data, ctx) => {
      const repairTypeData = REPAIR_TYPE_LIST.find(
        (rt) => rt.type === data.repair_type && rt.status === 'active'
      )

      if (!repairTypeData) {
        ctx.addIssue({
          path: ['repair_type'],
          code: z.ZodIssueCode.custom,
          message: 'Invalid repair type',
        })
        return
      }

      const requiredDims = repairTypeData.unit_measure.dimensions || []

      for (const dim of requiredDims) {
        const hasDefault = !!repairTypeData.unit_measure.default_values?.[dim]
        const userValue = data.measurements?.[dim]

        if (!hasDefault && (!userValue || userValue <= 0)) {
          ctx.addIssue({
            path: ['measurements', dim],
            code: z.ZodIssueCode.custom,
            message: `Measurement "${dim}" is required and must be greater than 0`,
          })
        }
      }
    })
// z.object({
//   project_id: z.number().min(1, 'Project is required'),
//   elevation: z.string().min(1, 'Elevation is required'),
//   drop: z
//     .number({ invalid_type_error: 'Drop must be a number' })
//     .min(1, 'Drop must be at least 1')
//     .refine(
//       (value) => {
//         const maxDrops = maxDropsRef?.current
//         return maxDrops !== undefined ? value <= maxDrops : true
//       },
//       () => ({
//         message: `Drop cannot exceed ${maxDropsRef?.current ?? 'unknown'}`,
//       })
//     ),
//   level: z
//     .number({ invalid_type_error: 'Level must be a number' })
//     .min(1, 'Level must be at least 1')
//     .refine(
//       (value) => {
//         const maxLevels = maxLevelsRef?.current
//         return maxLevels !== undefined ? value <= maxLevels : true
//       },
//       () => ({
//         message: `Level cannot exceed ${maxLevelsRef?.current ?? 'unknown'}`,
//       })
//     ),
//   repair_type: z.string().min(1, 'Repair type is required'),
//   repair_index: z.number().min(1, 'Repair index is required'),

//   measurements: z.object({}).refine(
//     (data) => {
//       const repairTypeData = REPAIR_TYPE_LIST.find(
//         (rt) => rt.type === data.repair_type && rt.status === 'active'
//       )
//       if (!repairTypeData) return false
//       return repairTypeData.unit_measure.dimensions?.every(
//         (dim) =>
//           repairTypeData.unit_measure.default_values?.[dim] ||
//           (data[dim] && data[dim] > 0)
//       )
//     },
//     { message: 'All required measurements must be provided' }
//   ),
//   survey_image: z
//     .string()
//     .min(1, 'Survey image is required')
//     .refine((val) => ['camera', 'uploaded'].includes(val), {
//       message: 'Invalid survey image source',
//     }),
//   progress_image: z
//     .array(
//       z.string().refine((val) => ['camera', 'uploaded'].includes(val), {
//         message: 'Invalid progress image source',
//       })
//     )
//     .min(1, 'At least one progress image is required'),
//   finish_image: z
//     .string()
//     .min(1, 'Finish image is required')
//     .refine((val) => ['camera', 'uploaded'].includes(val), {
//       message: 'Invalid finish image source',
//     }),
// })

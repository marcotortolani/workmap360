import { z } from 'zod'
import { RefObject } from 'react'

export const createFormSchema = ({
  maxDropsRef,
  maxLevelsRef,
}: {
  maxDropsRef?: RefObject<number | undefined>
  maxLevelsRef?: RefObject<number | undefined>
}) =>
  z.object({
    projectId: z.number().min(1, 'Project is required'),
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
          message: `Level cannot exceed ${maxLevelsRef?.current ?? 'unknown'}`,
        })
      ),
    repairType: z.string().min(1, 'Repair type is required'),
    repairIndex: z.number().min(1, 'Repair index is required'),
    surveyImage: z
      .string()
      .min(1, 'Survey image is required')
      .refine((val) => ['camera', 'uploaded'].includes(val), {
        message: 'Invalid survey image source',
      }),
    progressImage: z
      .array(
        z.string().refine((val) => ['camera', 'uploaded'].includes(val), {
          message: 'Invalid progress image source',
        })
      )
      .min(1, 'At least one progress image is required'),
    finishImage: z
      .string()
      .min(1, 'Finish image is required')
      .refine((val) => ['camera', 'uploaded'].includes(val), {
        message: 'Invalid finish image source',
      }),
  })

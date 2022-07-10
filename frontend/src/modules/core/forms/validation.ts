import { useCallback } from 'react'
import { BaseSchema, ValidationError } from 'yup'

export const useYupValidationResolver = <FormValues>(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  validationSchema: BaseSchema<any, any, FormValues>,
) =>
  useCallback(
    async (data: FormValues) => {
      try {
        const values = await validationSchema.validate(data, {
          abortEarly: false,
        })

        return {
          values,
          errors: {},
        }
      } catch (errors) {
        if (!(errors instanceof ValidationError)) {
          throw errors
        }

        return {
          values: {},
          errors: errors.inner.reduce(
            (allErrors, currentError) => ({
              ...allErrors,
              [currentError.path!]: {
                type: currentError.type ?? 'validation',
                message: currentError.message,
              },
            }),
            {},
          ),
        }
      }
    },
    [validationSchema],
  )

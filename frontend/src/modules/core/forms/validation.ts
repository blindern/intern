import { useCallback } from "react"
import { Schema, ValidationError } from "yup"

export const useYupValidationResolver = <FormValues>(
  validationSchema: Schema<FormValues, any, any>,
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
                type: currentError.type ?? "validation",
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

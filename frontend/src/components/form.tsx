import classNames from 'classnames'
import { ErrorMessage, Field, FieldProps } from 'formik'
import React, { ReactNode } from 'react'

const HelpBlockError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {msg => <p className='help-block'>{msg}</p>}
  </ErrorMessage>
)

export const CustomField = ({
  containerClassName,
  id,
  name,
  placeholder,
  autoFocus,
  helpBlock,
  type = 'text',
}: {
  containerClassName: string
  id?: string
  name: string
  placeholder: string
  autoFocus?: boolean
  helpBlock?: ReactNode
  type?: 'text' | 'password'
}) => (
  <Field name={name}>
    {({ field, form }: FieldProps) => (
      <div
        className={classNames(containerClassName, {
          'has-error': form.errors[field.name] && form.touched[field.name],
        })}
      >
        <input
          {...field}
          type={type}
          placeholder={placeholder}
          className='form-control'
          id={id}
          autoFocus={autoFocus}
        />
        {helpBlock !== null && <span className='help-block'>{helpBlock}</span>}
        <HelpBlockError name={field.name} />
      </div>
    )}
  </Field>
)

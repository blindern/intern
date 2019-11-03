import classNames from 'classnames'
import { ErrorMessage, Field, FieldProps } from 'formik'
import React, { ReactNode, Ref } from 'react'

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
  inputRef,
}: {
  containerClassName: string
  id?: string
  name: string
  placeholder: string
  autoFocus?: boolean
  helpBlock?: ReactNode
  type?: 'text' | 'password'
  inputRef?: Ref<HTMLInputElement>,
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
          ref={inputRef}
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

export const CustomTextareaField = ({
  containerClassName,
  id,
  name,
  placeholder,
  autoFocus,
  helpBlock,
  inputRef,
}: {
  containerClassName: string
  id?: string
  name: string
  placeholder: string
  autoFocus?: boolean
  helpBlock?: ReactNode
  inputRef?: Ref<HTMLTextAreaElement>,
}) => (
  <Field name={name}>
    {({ field, form }: FieldProps) => (
      <div
        className={classNames(containerClassName, {
          'has-error': form.errors[field.name] && form.touched[field.name],
        })}
      >
        <textarea
          {...field}
          ref={inputRef}
          placeholder={placeholder}
          className='form-control'
          id={id}
          autoFocus={autoFocus}
          rows={4}
        />
        {helpBlock !== null && <span className='help-block'>{helpBlock}</span>}
        <HelpBlockError name={field.name} />
      </div>
    )}
  </Field>
)

const GroupBase = ({
  label,
  labelFor,
  field,
}: {
  label: ReactNode
  labelFor: string
  field: ReactNode
}) => (
  <div className='form-group'>
    <label htmlFor={labelFor} className='col-sm-3 control-label'>
      {label}
    </label>
    {field}
  </div>
)

export const InputGroup = ({
  autoFocus,
  name,
  label,
  placeholder,
  inputRef,
}: {
  autoFocus?: boolean
  name: string
  label: string
  placeholder: string
  inputRef?: Ref<HTMLInputElement>
}) => (
  <GroupBase
    label={label}
    labelFor={name}
    field={
      <CustomField
        inputRef={inputRef}
        autoFocus={autoFocus}
        containerClassName='col-sm-6'
        name={name}
        id={name}
        placeholder={placeholder}
      />
    }
  />
)

export const TextAreaGroup = ({
  autoFocus,
  name,
  label,
  placeholder,
  inputRef,
}: {
  autoFocus?: boolean
  name: string
  label: string
  placeholder: string
  inputRef?: Ref<HTMLTextAreaElement>
}) => (
  <GroupBase
    label={label}
    labelFor={name}
    field={
      <CustomTextareaField
        inputRef={inputRef}
        autoFocus={autoFocus}
        containerClassName='col-sm-6'
        name={name}
        id={name}
        placeholder={placeholder}
      />
    }
  />
)

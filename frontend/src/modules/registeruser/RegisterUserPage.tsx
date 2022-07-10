import classNames from 'classnames'
import { ErrorMessage, Field, FieldProps, Form, Formik } from 'formik'
import { PageTitle } from 'modules/core/title/PageTitle'
import React, { ReactNode, useState } from 'react'
import { Link } from 'react-router-dom'
import * as Yup from 'yup'
import { RegisterData, useRegisterUserMutation } from './api'

const RegisterSchema = Yup.object().shape({
  username: Yup.string()
    .min(4, 'Brukernavn må være mellom 4 og 20 tegn')
    .max(20, 'Brukernavn må være mellom 4 og 20 tegn')
    .matches(/^[a-z][a-z0-9]+$/)
    .required('Brukernavn må være mellom 4 og 20 tegn'),
  firstname: Yup.string().required('Fornavn må oppgis'),
  lastname: Yup.string().required('Etternavn må oppgis'),
  email: Yup.string()
    .email('Du må oppgi en korrekt e-postadresse')
    .required('Du må oppgi en korrekt e-postadresse'),
  phone: Yup.string().matches(
    /^(|[1-9][0-9]{7})$/,
    'Kun norske nummer med 8 tall kan registreres',
  ),
  password: Yup.string()
    .min(8, 'Passordet må være på minst 8 tegn')
    .required('Passordet må være på minst 8 tegn'),
})

const HelpBlockError = ({ name }: { name: string }) => (
  <ErrorMessage name={name}>
    {(msg) => <p className='help-block'>{msg}</p>}
  </ErrorMessage>
)

const CustomField = ({
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
        {helpBlock != null && <span className='help-block'>{helpBlock}</span>}
        <HelpBlockError name={field.name} />
      </div>
    )}
  </Field>
)

const UsernameGroup = () => (
  <div className='form-group'>
    <label htmlFor='regform_username' className='col-lg-4 control-label'>
      Brukernavn
    </label>
    <CustomField
      containerClassName='col-lg-8'
      id='regform_username'
      name='username'
      placeholder='Brukernavn'
      autoFocus
      helpBlock={
        <>
          (<b>Små bokstaver</b>, uten mellomrom, bruk gjerne UiO-brukernavn evt.
          fornavn med to bokstaver fra etternavn)
        </>
      }
    />
  </div>
)

const NameGroup = () => (
  <div className='form-group'>
    <label htmlFor='regform_fornavn' className='col-lg-4 control-label'>
      Fullt navn
    </label>
    <CustomField
      id='regform_fornavn'
      containerClassName='col-lg-4'
      name='firstname'
      placeholder='Fornavn'
    />
    <CustomField
      containerClassName='col-lg-4'
      name='lastname'
      placeholder='Etternavn'
    />
  </div>
)

const EmailGroup = () => (
  <div className='form-group'>
    <label htmlFor='regform_email' className='col-lg-4 control-label'>
      E-post
    </label>
    <CustomField
      containerClassName='col-lg-8'
      id='regform_email'
      name='email'
      placeholder='E-postadresse'
    />
  </div>
)

const PhoneGroup = () => (
  <div className='form-group'>
    <label htmlFor='regform_phone' className='col-lg-4 control-label'>
      Mobil (valgfritt)
    </label>
    <CustomField
      containerClassName='col-lg-8'
      id='regform_phone'
      name='phone'
      placeholder='Mobilnummer (valgfritt)'
    />
  </div>
)

const PasswordGroup = () => (
  <div className='form-group'>
    <label htmlFor='regform_pw' className='col-lg-4 control-label'>
      Passord
    </label>
    <CustomField
      containerClassName='col-lg-8'
      id='regform_pw'
      name='password'
      placeholder='Passord'
      type='password'
      helpBlock={
        <>
          (Minst 8 tegn. Passordet overføres kryptert og blir lagret uten
          mulighet for å lese passordet.)
        </>
      }
    />
  </div>
)

const RegisterForm = () => {
  const [isSent, setIsSent] = useState(false)
  const { mutateAsync: registerUser } = useRegisterUserMutation()

  if (isSent) return <p>Din forespørsel er sendt inn.</p>

  return (
    <Formik<RegisterData>
      initialValues={{
        username: '',
        firstname: '',
        lastname: '',
        email: '',
        phone: '',
        password: '',
      }}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          await registerUser(values)
          setIsSent(true)
        } catch (e) {
          console.error('register failed', e)
          setIsSent(true)
          // TODO: Better error handling
        } finally {
          setSubmitting(false)
        }
      }}
      validationSchema={RegisterSchema}
    >
      {() => (
        <>
          <p style={{ color: '#FF0000' }}>
            Opplysningene du oppgir, med unntak av passord, vil bli gjort kjent
            for andre brukere.
          </p>
          <p>
            Du vil kunne bruke dette brukernavnet og passordet til å logge inn
            på forskjellige tjenester på BS (som f.eks. printeren i biblionette,
            wikien og Blindernåret).
          </p>

          <Form className='form-horizontal' role='form' autoComplete='off'>
            <UsernameGroup />
            <NameGroup />
            <EmailGroup />
            <PhoneGroup />
            <PasswordGroup />

            <div className='form-group'>
              <div className='col-lg-offset-4 col-lg-8'>
                Når du registrerer deg vil du etter hvert også bli lagt inn på
                lista bs-info@foreningenbs.no som benyttes til å informere om
                større begivenheter som f.eks. revy, som kan være relevant også
                etter botiden. Denne listen kan man melde seg av om ønskelig.
              </div>
            </div>

            <div className='form-group'>
              <div className='col-lg-offset-4 col-lg-8'>
                <input
                  type='submit'
                  value='Registrer'
                  className='btn btn-default'
                />
                <span className='help-block'>
                  Du vil bli lagt til manuelt, så noe ventetid må påregnes.
                </span>
              </div>
            </div>
          </Form>
        </>
      )}
    </Formik>
  )
}

const RegisterUserPage = () => (
  <>
    <PageTitle title='Registrering for beboere/GB-ere' />
    <div className='row'>
      <div className='col-md-6'>
        <p>
          <Link to='/login'>&laquo; Logg inn</Link>
        </p>

        <p>
          Dette er en tjeneste for beboere ved Blindern Studenterhjem. Har du
          øvrige spørsmål ta kontakt med{' '}
          <a href='http://blindern-studenterhjem.no/administrasjonen'>
            hjemmets administrasjon
          </a>
          .
        </p>

        <RegisterForm />
      </div>
    </div>
  </>
)

export default RegisterUserPage

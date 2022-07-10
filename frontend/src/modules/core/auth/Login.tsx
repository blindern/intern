import { Field, Form, Formik } from 'formik'
import React, { useContext } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { authService } from '.'
import { PageTitle } from '../title/PageTitle'
import { AuthContext } from './UserProvider'

interface FormValues {
  username: string
  password: string
  rememberMe: boolean
}

const Login = () => {
  const { isLoggedIn } = useContext(AuthContext)

  if (isLoggedIn) {
    return <Navigate to='/' />
  }

  return (
    <>
      <PageTitle title='Logg inn' />
      <p>
        For å logge inn her må du benytte foreningsbrukeren din. Det er den du
        også bruker på foreningens printer, wiki m.v.
      </p>

      <div className='row'>
        <div className='col-md-6'>
          <Formik<FormValues>
            initialValues={{
              username: '',
              password: '',
              rememberMe: true,
            }}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await authService.login(
                  values.username,
                  values.password,
                  values.rememberMe,
                )
              } catch (e) {
                // ignore
              } finally {
                setSubmitting(false)
              }
            }}
          >
            {({ isSubmitting }) => (
              <Form className='form-horizontal' role='form'>
                <div className='form-group'>
                  <label
                    htmlFor='form_username'
                    className='col-lg-4 control-label'
                  >
                    Brukernavn eller e-post
                  </label>
                  <div className='col-lg-8'>
                    <Field
                      name='username'
                      type='text'
                      placeholder='Brukernavn eller e-postadresse'
                      className='form-control'
                      autoFocus
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <label
                    htmlFor='form_password'
                    className='col-lg-4 control-label'
                  >
                    Passord
                  </label>
                  <div className='col-lg-8'>
                    <Field
                      name='password'
                      type='password'
                      placeholder='Passord'
                      className='form-control'
                    />
                  </div>
                </div>

                <div className='form-group'>
                  <div className='col-lg-offset-4 col-lg-8'>
                    <div className='checkbox'>
                      <label>
                        <Field type='checkbox' name='rememberMe' /> Forbli
                        pålogget
                      </label>
                    </div>
                  </div>
                </div>

                <div className='form-group'>
                  <div className='col-lg-offset-4 col-lg-8'>
                    <button
                      disabled={isSubmitting}
                      type='submit'
                      className='btn btn-default'
                    >
                      Logg inn
                    </button>
                    <Link to='/registrer' style={{ marginLeft: '10px' }}>
                      Opprett bruker
                    </Link>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </>
  )
}

export default Login

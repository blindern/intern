import { useAuthService } from 'modules/core/auth/AuthServiceProvider'
import React from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate } from 'react-router-dom'
import { useTitle } from '../title/PageTitle'
import { useAuthInfo } from './AuthInfoProvider'

interface FormValues {
  username: string
  password: string
  rememberMe: boolean
}

export const LoginPage = () => {
  useTitle('Logg inn')
  const authService = useAuthService()
  const { isLoggedIn } = useAuthInfo()

  const { handleSubmit, formState, register } = useForm<FormValues>({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: true,
    },
  })

  async function onSubmit(values: FormValues) {
    // TODO: handle failure
    await authService.login(values.username, values.password, values.rememberMe)
  }

  if (isLoggedIn) {
    return <Navigate to='/' />
  }

  return (
    <>
      <p>
        For å logge inn her må du benytte foreningsbrukeren din. Det er den du
        også bruker på foreningens printer, wiki m.v.
      </p>

      <div className='row'>
        <div className='col-md-6'>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className='form-horizontal'
            role='form'
          >
            <div className='form-group'>
              <label htmlFor='form_username' className='col-lg-4 control-label'>
                Brukernavn eller e-post
              </label>
              <div className='col-lg-8'>
                <input
                  {...register('username', { required: true })}
                  type='text'
                  placeholder='Brukernavn eller e-postadresse'
                  className='form-control'
                  autoFocus
                />
              </div>
            </div>

            <div className='form-group'>
              <label htmlFor='form_password' className='col-lg-4 control-label'>
                Passord
              </label>
              <div className='col-lg-8'>
                <input
                  {...register('password', { required: true })}
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
                    <input {...register('rememberMe')} type='checkbox' /> Forbli
                    pålogget
                  </label>
                </div>
              </div>
            </div>

            <div className='form-group'>
              <div className='col-lg-offset-4 col-lg-8'>
                <button
                  disabled={formState.isSubmitting}
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
          </form>
        </div>
      </div>
    </>
  )
}

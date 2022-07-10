import { post } from 'api'
import { useMutation } from 'react-query'

export interface RegisterData {
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
}

export function useRegisterUserMutation() {
  return useMutation(async (data: RegisterData) => {
    await post('register', data)

    // TODO: Return something?
  })
}

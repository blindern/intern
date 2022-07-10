import { post } from 'api'

export interface RegisterData {
  username: string
  firstname: string
  lastname: string
  email: string
  phone: string
  password: string
}

class RegisterUserService {
  async register(data: RegisterData) {
    await post('register', data)

    // TODO: Return something?
  }
}

export const registerUserService = new RegisterUserService()

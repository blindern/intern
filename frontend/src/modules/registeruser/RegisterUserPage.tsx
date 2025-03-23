import { ErrorMessage } from "@hookform/error-message"
import classNames from "classnames"
import { useYupValidationResolver } from "modules/core/forms/validation.js"
import { useTitle } from "modules/core/title/PageTitle.js"
import { ReactNode, useState } from "react"
import {
  FieldName,
  FormProvider,
  get,
  useForm,
  useFormContext,
  useFormState,
} from "react-hook-form"
import * as Yup from "yup"
import { RegisterData, useRegisterUserMutation } from "./api.js"

const validationSchema = Yup.object({
  username: Yup.string()
    .min(4, "Brukernavn må være mellom 4 og 20 tegn")
    .max(20, "Brukernavn må være mellom 4 og 20 tegn")
    .matches(/^[a-z][a-z0-9]+$/)
    .required("Brukernavn må være mellom 4 og 20 tegn"),
  firstname: Yup.string().required("Fornavn må oppgis"),
  lastname: Yup.string().required("Etternavn må oppgis"),
  email: Yup.string()
    .email("Du må oppgi en korrekt e-postadresse")
    .required("Du må oppgi en korrekt e-postadresse"),
  phone: Yup.string()
    .matches(
      /^(|[1-9][0-9]{7})$/,
      "Kun norske nummer med 8 tall kan registreres",
    )
    .ensure(),
  password: Yup.string()
    .min(8, "Passordet må være på minst 8 tegn")
    .required("Passordet må være på minst 8 tegn"),
})

const HelpBlockError = ({ name }: { name: FieldName<RegisterData> }) => {
  const { errors } = useFormState<RegisterData>()

  return (
    <ErrorMessage
      errors={errors}
      name={name}
      render={({ message }) => <p className="help-block">{message}</p>}
    />
  )
}

const CustomField = ({
  containerClassName,
  id,
  name,
  placeholder,
  autoFocus,
  helpBlock,
  type = "text",
}: {
  containerClassName: string
  id?: string
  name: keyof RegisterData
  placeholder: string
  autoFocus?: boolean
  helpBlock?: ReactNode
  type?: "text" | "password"
}) => {
  const {
    register,
    formState: { errors },
  } = useFormContext<RegisterData>()

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const hasErrors: boolean = get(errors, name)

  return (
    <div
      className={classNames(containerClassName, {
        "has-error": hasErrors,
      })}
    >
      <input
        {...register(name)}
        type={type}
        placeholder={placeholder}
        className="form-control"
        id={id}
        autoFocus={autoFocus}
      />
      {helpBlock != null && <span className="help-block">{helpBlock}</span>}
      <HelpBlockError name={name} />
    </div>
  )
}

const UsernameGroup = () => (
  <div className="form-group">
    <label htmlFor="regform_username" className="col-lg-4 control-label">
      Brukernavn
    </label>
    <CustomField
      containerClassName="col-lg-8"
      id="regform_username"
      name="username"
      placeholder="Brukernavn"
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
  <div className="form-group">
    <label htmlFor="regform_fornavn" className="col-lg-4 control-label">
      Fullt navn
    </label>
    <CustomField
      id="regform_fornavn"
      containerClassName="col-lg-4"
      name="firstname"
      placeholder="Fornavn"
    />
    <CustomField
      containerClassName="col-lg-4"
      name="lastname"
      placeholder="Etternavn"
    />
  </div>
)

const EmailGroup = () => (
  <div className="form-group">
    <label htmlFor="regform_email" className="col-lg-4 control-label">
      E-post
    </label>
    <CustomField
      containerClassName="col-lg-8"
      id="regform_email"
      name="email"
      placeholder="E-postadresse"
    />
  </div>
)

const PhoneGroup = () => (
  <div className="form-group">
    <label htmlFor="regform_phone" className="col-lg-4 control-label">
      Mobil (valgfritt)
    </label>
    <CustomField
      containerClassName="col-lg-8"
      id="regform_phone"
      name="phone"
      placeholder="Mobilnummer (valgfritt)"
    />
  </div>
)

const PasswordGroup = () => (
  <div className="form-group">
    <label htmlFor="regform_pw" className="col-lg-4 control-label">
      Passord
    </label>
    <CustomField
      containerClassName="col-lg-8"
      id="regform_pw"
      name="password"
      placeholder="Passord"
      type="password"
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
  const { isPending, mutateAsync: registerUser } = useRegisterUserMutation()

  const resolver = useYupValidationResolver<RegisterData>(validationSchema)

  const methods = useForm<RegisterData>({
    defaultValues: {
      username: "",
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      password: "",
    },
    resolver,
  })

  async function onSubmit(values: RegisterData) {
    await registerUser(values)
    setIsSent(true)
  }

  if (isSent)
    return (
      <p>
        <b>Din forespørsel er sendt inn.</b>
      </p>
    )

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="form-horizontal"
        role="form"
        autoComplete="off"
      >
        <UsernameGroup />
        <NameGroup />
        <EmailGroup />
        <PhoneGroup />
        <PasswordGroup />

        <div className="form-group">
          <div className="col-lg-offset-4 col-lg-8">
            <input
              type="submit"
              value={
                isPending ? "Send inn forespørsel ..." : "Send inn forespørsel"
              }
              className="btn btn-primary"
              disabled={isPending}
            />
            <span className="help-block">
              Du vil bli lagt til manuelt, så noe ventetid må påregnes.
            </span>
          </div>
        </div>
      </form>
    </FormProvider>
  )
}

export const RegisterUserPage = () => {
  useTitle("Registrering for beboere/GB-ere")

  return (
    <div className="row">
      <div className="col-md-6">
        <p>
          Dette er en tjeneste for beboere ved Blindern Studenterhjem. Har du
          øvrige spørsmål ta kontakt med{" "}
          <a href="https://www.blindern-studenterhjem.no/kontakt/">
            hjemmets administrasjon
          </a>
          .
        </p>

        <p>
          Du vil kunne bruke dette brukernavnet og passordet til å logge inn på
          forskjellige tjenester på BS (som f.eks. printeren i biblionette,
          wikien og Blindernåret). Vi omtaler denne brukeren som din{" "}
          <em>Foreningsbruker</em>.
        </p>

        <p style={{ color: "#FF0000" }}>
          Opplysningene du oppgir, med unntak av passord, vil bli gjort kjent
          for andre brukere.
        </p>

        <RegisterForm />
      </div>
    </div>
  )
}

import { useId } from "modules/core/forms/ids.js"
import { Controller, useFormContext } from "react-hook-form"

export function TextareaField({
  label,
  name,
  placeholder,
  rows,
}: {
  label: string
  name: string
  placeholder: string
  rows?: number
}) {
  const id = useId()
  const { register } = useFormContext()

  return (
    <div className="form-group">
      <label htmlFor={id} className="col-sm-3 control-label">
        {label}
      </label>
      <div className="col-sm-6">
        <textarea
          {...register(name)}
          className="form-control"
          id={id}
          placeholder={placeholder}
          rows={rows}
        />
      </div>
    </div>
  )
}

export function TextField({
  label,
  name,
  placeholder,
  autoFocus,
  required,
}: {
  label: string
  name: string
  placeholder: string
  autoFocus?: boolean | undefined
  required?: boolean | undefined
}) {
  const id = useId()
  const { register } = useFormContext()

  return (
    <div className="form-group">
      <label htmlFor={id} className="col-sm-3 control-label">
        {label}
      </label>
      <div className="col-sm-6">
        <input
          {...register(name)}
          type="text"
          className="form-control"
          id={id}
          placeholder={placeholder}
          autoFocus={autoFocus}
          required={required}
        />
      </div>
    </div>
  )
}

export function MultiTextField({
  label,
  name,
  placeholder,
}: {
  label: string
  name: string
  placeholder: string
}) {
  const id = useId()
  const { control } = useFormContext()

  return (
    <div className="form-group">
      <label htmlFor={id} className="col-sm-3 control-label">
        {label}
      </label>
      <div className="col-sm-6">
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <input
              {...field}
              type="text"
              className="form-control"
              id={id}
              placeholder={placeholder}
              value={(field.value as string[] | null)?.join(",") ?? ""}
              onChange={(e) => field.onChange(e.target.value.split(","))}
            />
          )}
        />
      </div>
    </div>
  )
}

export function TitleField({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <TextField
      name="title"
      label="Tittel"
      placeholder="Tittel på boka"
      autoFocus={autoFocus}
      required
    />
  )
}
export function SubtitleField() {
  return (
    <TextField
      name="subtitle"
      label="Undertittel"
      placeholder="Evt. undertittel"
    />
  )
}
export function AuthorsField() {
  return (
    <MultiTextField
      name="authors"
      label="Forfattere"
      placeholder="Forfattere separert med komma"
    />
  )
}
export function PubdateField() {
  return (
    <TextField
      name="pubdate"
      label="Publisert dato/år"
      placeholder="yyyy-mm-dd eller yyyy-mm eller yyyy eller yyyy? eller yy?"
    />
  )
}

export function DescriptionField({ rows }: { rows: number }) {
  return (
    <TextareaField
      name="description"
      label="Beskrivelse"
      placeholder="Evt. beskrivelse om boka"
      rows={rows}
    />
  )
}

export function BibRoomField() {
  return (
    <TextField
      name="bib_room"
      label="Rom"
      placeholder="I hvilket rom tilhører boka?"
    />
  )
}

export function BibSectionField() {
  return (
    <TextField
      name="bib_section"
      label="Seksjon i rommet"
      placeholder="Hvor i biblioteket boka tilhører"
    />
  )
}

export function BibCommentField({ rows }: { rows: number }) {
  return (
    <TextareaField
      name="bib_comment"
      label="Biblioteksutvalgets kommentar"
      placeholder="Evt. kommentar hvis man vil si noe om tilstand til boka eller liknende"
      rows={rows}
    />
  )
}

export function IsbnField({ autoFocus }: { autoFocus?: boolean }) {
  return (
    <TextField
      name="isbn"
      label="ISBN"
      placeholder="ISBN-kode"
      autoFocus={autoFocus}
    />
  )
}

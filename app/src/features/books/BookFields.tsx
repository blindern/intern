import { useId } from "react"
import { Controller, useFormContext } from "react-hook-form"

function TextField({
  label,
  name,
  placeholder,
  autoFocus,
  required,
}: {
  label: string
  name: string
  placeholder: string
  autoFocus?: boolean
  required?: boolean
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

function TextareaField({
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

function MultiTextField({
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

export const BookFields = {
  TitleField: ({ autoFocus }: { autoFocus?: boolean }) => (
    <TextField
      name="title"
      label="Tittel"
      placeholder="Tittel på boka"
      autoFocus={autoFocus}
      required
    />
  ),
  SubtitleField: () => (
    <TextField
      name="subtitle"
      label="Undertittel"
      placeholder="Evt. undertittel"
    />
  ),
  AuthorsField: () => (
    <MultiTextField
      name="authors"
      label="Forfattere"
      placeholder="Forfattere separert med komma"
    />
  ),
  PubdateField: () => (
    <TextField
      name="pubdate"
      label="Publisert dato/år"
      placeholder="yyyy-mm-dd eller yyyy-mm eller yyyy eller yyyy? eller yy?"
    />
  ),
  DescriptionField: ({ rows }: { rows: number }) => (
    <TextareaField
      name="description"
      label="Beskrivelse"
      placeholder="Evt. beskrivelse om boka"
      rows={rows}
    />
  ),
  BibRoomField: () => (
    <TextField
      name="bib_room"
      label="Rom"
      placeholder="I hvilket rom tilhører boka?"
    />
  ),
  BibSectionField: () => (
    <TextField
      name="bib_section"
      label="Seksjon i rommet"
      placeholder="Hvor i biblioteket boka tilhører"
    />
  ),
  IsbnField: ({ autoFocus }: { autoFocus?: boolean }) => (
    <TextField
      name="isbn"
      label="ISBN"
      placeholder="ISBN-kode"
      autoFocus={autoFocus}
    />
  ),
  BibCommentField: ({ rows }: { rows: number }) => (
    <TextareaField
      name="bib_comment"
      label="Biblioteksutvalgets kommentar"
      placeholder="Evt. kommentar hvis man vil si noe om tilstand til boka eller liknende"
      rows={rows}
    />
  ),
}

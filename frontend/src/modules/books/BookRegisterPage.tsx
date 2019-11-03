import { CustomTextareaField, TextAreaGroup, InputGroup } from 'components/form'
import { Form, Formik } from 'formik'
import { PageTitle } from 'modules/core/title/PageTitle'
import React, { useEffect, useRef, useState } from 'react'
import history from 'utils/history'
import { BookAddData, booksService } from './BooksService'

const useStoreRoomAndSection = (values: BookAddData) => {
  const [isInitial, setIsInitial] = useState<boolean>(false)
  useEffect(
    () => {
      if (isInitial) {
        setIsInitial(false)
      } else {
        // save some parameters for later usage
        sessionStorage.bookRoom = values.bib_room
        sessionStorage.bookSection = values.bib_section
      }
    },
    [values.bib_room, values.bib_section],
  )
}

const initialValues = {
  bib_room: '',
  bib_section: '',
  isbn: '',
  title: '',
  subtitle: '',
  authors: [],
  pubdate: '',
  description: '',
  bib_comment: '',
}

const ifNull = <T extends any>(value: T | null, nullValue: T): T =>
  value === null ? nullValue : value

const blankForNull = (value: string | null): string => ifNull(value, '')

const BookRegisterForm = ({
  values,
  setFieldValue,
  setValues,
}: {
  values: BookAddData
  setFieldValue(field: keyof BookAddData, value: any): void
  setValues(values: BookAddData): void
}) => {
  const restoreParams = () => {
    setFieldValue('bib_room', sessionStorage.bookRoom || 'Biblioteket')
    setFieldValue('bib_section', sessionStorage.bookSection || '')
  }

  useEffect(() => {
    restoreParams()
  }, [])

  useStoreRoomAndSection(values)

  const titleRef = useRef<HTMLInputElement>(null)

  const [isbnIsSearching, setIsbnIsSearching] = useState<boolean>(false)

  const isbnSearch = async (isbn: string) => {
    isbn = isbn.replace(/-/g, '')
    if (isbn === '' || isbnIsSearching) {
      return
    }

    try {
      setIsbnIsSearching(true)
      const result = await booksService.isbnSearch(isbn)

      if (result.data !== null && 'title' in result.data) {
        setValues({
          ...initialValues,
          title: blankForNull(result.data.title),
          subtitle: blankForNull(result.data.subtitle),
          authors: blankForNull(result.data.authors),
          // 'categories': blankForNull(result.data.categories),
          description: blankForNull(result.data.description),
          pubdate: blankForNull(result.data.pubdate),
          isbn,
        })

        restoreParams()
        if (titleRef.current !== null) {
          titleRef.current.focus()
        }
      }
    } finally {
      setIsbnIsSearching(false)
    }
  }

  return (
    <div className='form-horizontal'>
      <p>
        Dette skjemaet benyttes til å registrere bøker i biblioteket. ISBN-søket
        benytter Google Books til å søke etter bokinformasjon, og vil fylle inn
        feltene automatisk hvis boka blir funnet.
      </p>
      <Form autoComplete='off'>
        <InputGroup
          name='bib_room'
          label='Rom'
          placeholder='I hvilket rom tilhører boka?'
        />
        <InputGroup
          name='bib_section'
          label='Seksjon i rommet'
          placeholder='Hvor i biblioteket boka tilhører'
        />
        <InputGroup name='isbn' label='ISBN' placeholder='ISBN-kode' autoFocus />
        <div className='form-group'>
          <div className='col-sm-6 col-sm-offset-3'>
            <button
              type='button'
              onClick={() => {
                isbnSearch(values.isbn)
              }}
              // TODO
              // ladda='isbn_is_searching'
              // data-style='expand-right'
              className='btn btn-primary'
            >
              Søk etter bokinformasjon
            </button>
          </div>
        </div>
        <InputGroup
          inputRef={titleRef}
          name='title'
          label='Tittel'
          placeholder='Tittel på boka'
        />
        <InputGroup
          name='subtitle'
          label='Undertittel'
          placeholder='Evt. undertittel'
        />
        <InputGroup
          name='authors'
          label='Forfattere'
          // Forfattere ({book.authors.length || 0}} forfatter{book.authors.length == 1 ? '' : 'e'}})
          placeholder='Forfattere separert med komma'
          // TODO: ng-list=','
        />
        <InputGroup
          name='pubdate'
          label='Publisert dato/år'
          placeholder='yyyy-mm-dd eller yyyy-mm eller yyyy eller yyyy? eller yy?'
        />
        <TextAreaGroup
          name='description'
          label='Beskrivelse'
          placeholder='Evt. beskrivelse om boka'
        />
        <TextAreaGroup
          name='bib_comment'
          label='Biblioteksutvalgets kommentar'
          placeholder='Evt. kommentar hvis man vil si noe om tilstand til boka eller liknende'
        />
        {/*
          <div className="form-group">
              <label htmlFor="categories">Kategorier ({book.categories.length||0} kategori{book.categories.length==1?'':'er'})</label>
              <input type="text" className="form-control" ng-model="book.categories" ng-list="," id="categories" placeholder="Kategorier separert med komma" />
          </div>
          */}
        <div className='form-group'>
          <div className='col-sm-8 col-sm-offset-3'>
            <input
              type='submit'
              className='btn btn-primary'
              value='Registrer bok i databasen'
            />
          </div>
        </div>
      </Form>
    </div>
  )
}

const BookRegisterPage = () => {
  // TODO
  // !AuthService.requireGroup('biblioteksutvalget')
  const noaccess = false

  return (
    <>
      <PageTitle title='Registrer bok' />
      {noaccess ? (
        <p ng-show='noaccess'>
          Denne siden er kun tilgjengelig for{' '}
          <a href='group/biblioteksutvalget'>biblioteksutvalget</a>.
        </p>
      ) : (
        <Formik<BookAddData>
          initialValues={initialValues}
          onSubmit={async values => {
            const result = await booksService.addBook(values)
            history.push(`/books/${result._id}`)
          }}
        >
          {({ values, setFieldValue, setValues }) => (
            <BookRegisterForm
              values={values}
              setFieldValue={setFieldValue}
              setValues={setValues}
            />
          )}
        </Formik>
      )}
    </>
  )
}

export default BookRegisterPage

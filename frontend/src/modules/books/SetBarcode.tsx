import { Book, useSetBookBarcodeMutation } from 'modules/books/api'
import React, { useState } from 'react'

export function SetBarcode({ book }: { book: Book }) {
  const [newBarcode, setNewBarcode] = useState('')

  const { mutate: mutateBarcode } = useSetBookBarcodeMutation()

  function registerBarcode() {
    if (newBarcode.substring(0, 3) != 'BS-') {
      alert('Ugyldig strekkode for biblioteket.')
    } else {
      mutateBarcode({
        book: book,
        barcode: newBarcode,
      })
    }
  }

  return (
    <div className='panel panel-default panel-warning'>
      <div className='panel-heading'>
        <h3 className='panel-title'>Mangler strekkode</h3>
      </div>
      <div className='panel-body'>
        <p>
          Denne boka er ikke tilknyttet noen strekkode. Alle bøkene bør påføres
          klistrelapp med strekkode som identifiserer denne oppføringen i
          bokdatabasen.
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            registerBarcode()
          }}
        >
          <div className='row'>
            <div className='col-sm-10'>
              <input
                type='text'
                className='form-control'
                value={newBarcode}
                onChange={(ev) => setNewBarcode(ev.target.value)}
                placeholder='Scan bibliotekets strekkode som påføres boken'
                autoFocus
              />
            </div>
            <div className='col-sm-2'>
              <input
                type='submit'
                className='form-control btn-primary'
                value='Registrer'
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

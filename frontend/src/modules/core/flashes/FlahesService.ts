import { BehaviorSubject } from "rxjs"

export interface Flash {
  type: FlashType
  message: string
  date: Date
}

type FlashType = "danger" | "success"

export interface FlashArgs {
  message: string
  type?: FlashType
}

export class FlashesService {
  flashesSubject = new BehaviorSubject<Flash[]>([])
  getFlashesObservable = () => this.flashesSubject

  addFlash({ type = "danger", message }: FlashArgs) {
    const flashObj: Flash = {
      type,
      message,
      date: new Date(),
    }

    this.flashesSubject.next(this.flashesSubject.value.concat([flashObj]))

    setTimeout(() => {
      this.flashesSubject.next(
        this.flashesSubject.value.filter((item) => item !== flashObj),
      )
    }, 3000)
  }
}

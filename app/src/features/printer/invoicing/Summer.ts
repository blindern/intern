export class Summer {
  prev?: Summer | undefined

  numJobs = 0
  numPages = 0
  numPagesReal = 0
  numPagesAlt = 0
  amount = 0
  amountReal = 0
  amountAlt = 0
  countByCost: Record<number, number> = {}

  constructor(prev?: Summer) {
    this.prev = prev
  }

  add(props: {
    jobCount: number
    totalJobSize: number
    costEach: number
    isAlt: boolean
  }) {
    this.numJobs += props.jobCount
    this.numPages += props.totalJobSize
    this.amount += props.costEach * props.totalJobSize

    if (props.isAlt) {
      this.amountAlt += props.costEach * props.totalJobSize
      this.numPagesAlt += props.totalJobSize
    } else {
      this.amountReal += props.costEach * props.totalJobSize
      this.numPagesReal += props.totalJobSize
    }

    this.countByCost[props.costEach] ??= 0
    this.countByCost[props.costEach] += props.totalJobSize

    if (this.prev) {
      this.prev.add(props)
    }
  }
}

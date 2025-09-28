import { getConfluenceEvents } from "./confluence/confluence.ts"
import { getAllEvents } from "./event-mapper.ts"
import { sortEventsByTimeAndTitle, type FbsEventOrComment } from "./event.ts"
import { getMediawikiEvents } from "./mediawiki/mediawiki.ts"

interface Cache {
  timestamp: number
  data: FbsEventOrComment[]
}

async function retrieveEvents() {
  return [
    //
    ...(await getMediawikiEvents()),
    ...(await getConfluenceEvents()),
  ]
}

export class EventService {
  #eventsPromise: Promise<FbsEventOrComment[]> | undefined = undefined
  private cache: Cache | null = null

  public invalidateCache() {
    this.cache = null
  }

  public preload() {
    void (async () => {
      try {
        await this.#triggerFetch()
      } catch (error) {
        console.error("Error preloading events", error)
      }
    })()
  }

  #triggerFetch() {
    this.#eventsPromise = retrieveEvents()
      .then((list) => {
        list = [...list].sort(sortEventsByTimeAndTitle)

        // Reuse existing object if same contents.
        const lastList = this.cache?.data
        if (lastList && JSON.stringify(lastList) === JSON.stringify(list)) {
          list = lastList
        } else {
          console.log("New list of events")
        }

        this.cache = {
          timestamp: new Date().getTime(),
          data: list,
        }

        // Trigger eager mapping to save time on first request.
        // This will store a cached variant.
        getAllEvents(list)

        return list
      })
      .finally(() => {
        this.#eventsPromise = undefined
      })
    return this.#eventsPromise
  }

  #getCacheAge() {
    if (!this.cache) return undefined
    return new Date().getTime() - this.cache.timestamp
  }

  #shouldFetch() {
    const cacheAge = this.#getCacheAge()
    if (this.#eventsPromise) return false
    if (cacheAge == null) return true
    return cacheAge > 10_000
  }

  public async getOrderedEvents(options: { fresh: boolean }) {
    if (options.fresh) {
      return await this.#triggerFetch()
    }

    if (this.#shouldFetch()) {
      void this.#triggerFetch()
    }

    if (this.cache != null) {
      return this.cache.data
    }

    this.#eventsPromise ??= this.#triggerFetch()
    return await this.#eventsPromise
  }
}

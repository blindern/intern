# calendar-api

This is a small service that exposes all calendar events, combining
data from Confluence with older events.

Events are exposed as JSON (consumer in the frontend) and as iCalendar file.

https://foreningenbs.no/calendar-api/events
https://foreningenbs.no/calendar-api/events.ics
https://foreningenbs.no/calendar-api/events/next

## Running locally

```bash
pnpm install
pnpm run serve
```

http://localhost:8000/events
http://localhost:8000/events.ics
http://localhost:8000/events/next

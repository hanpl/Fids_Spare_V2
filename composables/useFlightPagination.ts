import { parse } from 'date-fns'

export const useFlightPagination = () => {
  const formatTime = (datetime: string): string => {
    if (!datetime) return ''
    try {
      const date = parse(datetime, 'dd/MM/yyyy h:mm:ss a', new Date())
      if (isNaN(date.getTime())) return ''
      return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
    } catch {
      return ''
    }
  }

  const formatDateToFlightMessage = (dateString: string): string => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December']
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    return `FLIGHTS FOR ${days[date.getDay()].toUpperCase()} ${months[date.getMonth()].toUpperCase()} ${date.getDate()}, ${date.getFullYear()}`
  }

  const groupFlightsByDayWithBreak = (flights: any[]): any[] => {
    if (!flights.length) return []
    const result: any[] = []
    let currentDay = flights[0].scheduledDate
    for (const flight of flights) {
      const dateKey = flight.scheduledDate
      if (dateKey !== currentDay) {
        result.push({ isDaybreak: true, date: dateKey })
        currentDay = dateKey
      }
      result.push({ ...flight, isDaybreak: false, date: dateKey })
    }
    return result
  }

  const paginateFlights = (flightList: any[], pageSize: number, maxPages: number): any[][] => {
    const pages: any[][] = []
    let page: any[] = []
    let rowCount = 0
    for (const item of flightList) {
      const linesNeeded = item.isDaybreak ? 2 : 1
      if (rowCount + linesNeeded > pageSize) {
        pages.push(page)
        if (pages.length >= maxPages) break
        page = []
        rowCount = 0
      }
      page.push(item)
      rowCount += linesNeeded
    }
    if (page.length > 0) pages.push(page)
    return pages
  }

  return { formatTime, formatDateToFlightMessage, groupFlightsByDayWithBreak, paginateFlights }
}

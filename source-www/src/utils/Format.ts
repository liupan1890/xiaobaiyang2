export function FormatSize(size: number): string {
  let string
  if (size >= ((1024 * 1024 * 1024 * 1024) / 10) * 9) {
    size = size / ((1024 * 1024 * 1024 * 1024) / 10)
    string = 'TB'
  } else if (size >= ((1024 * 1024 * 1024) / 10) * 9) {
    size = size / ((1024 * 1024 * 1024) / 10)
    string = 'GB'
  } else if (size >= ((1024 * 1024) / 10) * 9) {
    size = size / ((1024 * 1024) / 10)
    string = 'MB'
  } else if (size >= (1024 / 10) * 9) {
    size = size / (1024 / 10)
    string = 'KB'
  } else {
    size = size * 10
    string = 'b'
  }
  return Math.round(size) / 10 + string
}

export function FormatDate(date: Date, format: string) {
  const week = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', '日', '一', '二', '三', '四', '五', '六']
  return format.replace(/YYYY|YY|MM|M|DD|D|hh|mm|ss|www|week/g, function (a: string) {
    switch (a) {
      case 'YYYY':
        return date.getFullYear() + ''
      case 'YY':
        return (date.getFullYear() + '').slice(2)
      case 'MM':
        return (date.getMonth() + 1 + '').length < 2 ? '0' + (date.getMonth() + 1) : '' + (date.getMonth() + 1)
      case 'M':
        return '' + (date.getMonth() + 1)
      case 'DD':
        return (date.getDate() + '').length < 2 ? '0' + date.getDate() : '' + date.getDate()
      case 'D':
        return '' + date.getDate()
      case 'hh':
        return (date.getHours() + '').length < 2 ? '0' + date.getHours() : '' + date.getHours()
      case 'mm':
        return (date.getMinutes() + '').length < 2 ? '0' + date.getMinutes() : '' + date.getMinutes()
      case 'ss':
        return (date.getSeconds() + '').length < 2 ? '0' + date.getSeconds() : '' + date.getSeconds()
      case '星期':
        return '星期' + week[date.getDay() + 7]
      case 'week':
        return week[date.getDay()]
      case 'www':
        return week[date.getDay()].slice(0, 3)
      default:
        return ''
    }
  })
}

import { IFile } from './pan'

export function GetSorterFileList(filelist: IFile[], field: string, orderasc: boolean): IFile[] {
  if (field === 'filename') {
    if (orderasc) {
      return filelist.sort(SortNumber1)
    } else {
      return filelist.sort(SortNumber2)
    }
  } else if (field === 'sizestr') {
    if (orderasc) {
      return filelist.sort(function (a, b) {
        return a.sizeint - b.sizeint
      })
    } else {
      return filelist.sort(function (a, b) {
        return b.sizeint - a.sizeint
      })
    }
  }

  if (orderasc) {
    return filelist.sort(function (a, b) {
      return a.dateint - b.dateint
    })
  } else {
    return filelist.sort(function (a, b) {
      return b.dateint - a.dateint
    })
  }
}

export function SortLikeWin1(v1: IFile, v2: IFile) {
  let a = v1.name
  let b = v2.name
  const reg = /[0-9]+/g
  const lista = a.match(reg)
  const listb = b.match(reg)
  if (!lista || !listb) {
    return a.localeCompare(b)
  }
  for (let i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
    const indexa = a.indexOf(lista[i])
    const indexb = b.indexOf(listb[i])
    const prefixa = a.substring(0, indexa)
    const prefixb = a.substring(0, indexb)
    const stra = lista[i]
    const strb = listb[i]
    const numa = parseInt(stra)
    const numb = parseInt(strb)
    if (indexa !== indexb || prefixa !== prefixb) {
      return a.localeCompare(b)
    } else {
      if (stra === strb) {
        if (i === minLen - 1) {
          return a.substring(indexa).localeCompare(b.substring(indexb))
        } else {
          a = a.substring(indexa + stra.length)
          b = b.substring(indexa + stra.length)
        }
      } else if (numa === numb) {
        return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '')
      }
      return numa - numb
    }
  }

  return a.localeCompare(b)
}

export function SortLikeWin2(v2: IFile, v1: IFile) {
  let a = v1.name
  let b = v2.name
  const reg = /[0-9]+/g
  const lista = a.match(reg)
  const listb = b.match(reg)
  if (!lista || !listb) {
    return a.localeCompare(b)
  }
  for (let i = 0, minLen = Math.min(lista.length, listb.length); i < minLen; i++) {
    const indexa = a.indexOf(lista[i])
    const indexb = b.indexOf(listb[i])
    const prefixa = a.substring(0, indexa)
    const prefixb = a.substring(0, indexb)
    const stra = lista[i]
    const strb = listb[i]
    const numa = parseInt(stra)
    const numb = parseInt(strb)
    if (indexa !== indexb || prefixa !== prefixb) {
      return a.localeCompare(b)
    } else {
      if (stra === strb) {
        if (i === minLen - 1) {
          return a.substring(indexa).localeCompare(b.substring(indexb))
        } else {
          a = a.substring(indexa + stra.length)
          b = b.substring(indexa + stra.length)
        }
      } else if (numa === numb) {
        return strb.lastIndexOf(numb + '') - stra.lastIndexOf(numa + '')
      }
      return numa - numb
    }
  }
  return a.localeCompare(b)
}
export function SortNumber1(v1: IFile, v2: IFile) {
  let a = v1.name
  let b = v2.name

  const aNums = a.match(/[0-9]+/g)
  const bNums = b.match(/[0-9]+/g)

  if (!aNums || !bNums) {
    return a.localeCompare(b, 'zh-Hans')
  }
  for (let i = 0, minLen = Math.min(aNums.length, bNums.length); i < minLen; i++) {
    const aIndex = a.indexOf(aNums[i])
    const bIndex = b.indexOf(bNums[i])

    const aPrefix = a.substring(0, aIndex)
    const bPrefix = a.substring(0, bIndex)

    if (aIndex !== bIndex || aPrefix !== bPrefix) {
      return a.localeCompare(b)
    }

    if (aNums[i] === bNums[i]) {
      if (i === minLen - 1) {
        return a.substring(aIndex).localeCompare(b.substring(bIndex))
      } else {
        a = a.substring(aIndex + aNums[i].length)
        b = b.substring(bIndex + bNums[i].length)
      }
    } else if (~~aNums[i] === ~~bNums[i]) {
      return aNums[i].lastIndexOf(~~aNums[i] + '') - bNums[i].lastIndexOf(~~bNums[i] + '')
    } else {
      return ~~aNums[i] - ~~bNums[i]
    }
  }
  return a.localeCompare(b, 'zh-Hans')
}

export function SortNumber2(v1: IFile, v2: IFile) {
  let a = v2.name
  let b = v1.name

  const aNums = a.match(/[0-9]+/g)
  const bNums = b.match(/[0-9]+/g)

  if (!aNums || !bNums) {
    return a.localeCompare(b, 'zh-Hans')
  }
  for (let i = 0, minLen = Math.min(aNums.length, bNums.length); i < minLen; i++) {
    const aIndex = a.indexOf(aNums[i])
    const bIndex = b.indexOf(bNums[i])

    const aPrefix = a.substring(0, aIndex)
    const bPrefix = a.substring(0, bIndex)

    if (aIndex !== bIndex || aPrefix !== bPrefix) {
      return a.localeCompare(b)
    }

    if (aNums[i] === bNums[i]) {
      if (i === minLen - 1) {
        return a.substring(aIndex).localeCompare(b.substring(bIndex))
      } else {
        a = a.substring(aIndex + aNums[i].length)
        b = b.substring(bIndex + bNums[i].length)
      }
    } else if (~~aNums[i] === ~~bNums[i]) {
      return aNums[i].lastIndexOf(~~aNums[i] + '') - bNums[i].lastIndexOf(~~bNums[i] + '')
    } else {
      return ~~aNums[i] - ~~bNums[i]
    }
  }
  return a.localeCompare(b, 'zh-Hans')
}

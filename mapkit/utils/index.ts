const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

function createUUID(len = 16): string {
  const uuid = new Array(16)
  const radix = chars.length
  for (let i = 0; i < len; i++) {
    uuid[i] = chars[0 | (Math.random() * radix)]
  }
  return uuid.join('')
}

function getArrayLevel(arr) {
  let num = 0
  if (arr instanceof Array) {
    num++
    num = num + getArrayLevel(arr[0])
  }
  return num
}

export { createUUID, getArrayLevel }

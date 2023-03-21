function multiarr(arr) {
    let num = 0
    if (arr instanceof Array) {
        num++
        num = num + multiarr(arr[0])
    }
    return num
}
export { multiarr }
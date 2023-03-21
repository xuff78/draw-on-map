export async function loadImage(urls: string[]) {
    const taskArray = urls.map(url => getImageByUrl(url))
    const allPImage = await Promise.allSettled(taskArray)
    return allPImage
}

const getImageByUrl = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
        const image = new Image()
        image.src = url
        image.onload = function () {
            resolve(image)
        }
        image.onerror = function (e) {
            reject(e)
        }
    })
}
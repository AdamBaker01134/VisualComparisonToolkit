/**
 * *Async Process*
 * Load file strings into an array and return.
 * Similar to the loadStrings function in p5.
 * */
export async function processFileStrings(filepath) {

    const fileReader = new FileReader();
    let fileContents = await fileReader.readAsText(new File([], filepath));

    let fileStrings = [];

    for await (const line of fileContents) {
        fileStrings.push(line);
    }

    return fileStrings;
}
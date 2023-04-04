import clipboard from "clipboardy"
import fs from "fs/promises"
import path from "path"
import { GlobalKeyboardListener } from "node-global-key-listener"
import { keyboard, Key } from "@nut-tree/nut-js"
import { Step } from "./Step.js"
import chalk from "chalk"

// set up global key listener
const keyListener = new GlobalKeyboardListener()

// set keyboard delay to 0
keyboard.config.autoDelayMs = 0

export async function writeSectionFromFile(filePath) {
    const content = await fs.readFile(filePath, "utf-8")
    await writeSection(content)
}

export async function writeSection(text) {
    await clipboard.write(text)
    await keyboard.type(Key.LeftControl, Key.V)
}

/**
 * Starts a sequence of steps.
 *
 * @export
 * @param {object} [options]
 * @param {string | RegExp | (fileName: string) => boolean} [options.filter] Filter files in the directory. Can be a string, Regex, or a function.
 * @return {*}
 */
export function startSequence({
    filter,
    dir = "./",
    title = "New Sequence",
} = {}) {
    console.log("\n=======")
    console.log(chalk.bold.blue(title))
    console.log("=======\n")

    return new Promise(async resolve => {
        // find all files in directory
        let fileNames = await fs.readdir(dir)

        // apply filter
        if (filter) {
            if (typeof filter === "function")
                fileNames = fileNames.filter(filter)
            else if (typeof filter === "string")
                fileNames = fileNames.filter(fileName =>
                    fileName.includes(filter)
                )
            else if (filter instanceof RegExp)
                fileNames = fileNames.filter(fileName => filter.test(fileName))
        }

        // load steps
        const steps = await Promise.all(
            fileNames.map(fileName =>
                Step.loadFromFile(path.join(dir, fileName))
            )
        )

        // sort steps in order of their label
        steps.sort((a, b) =>
            a.label.localeCompare(b.label, undefined, {
                numeric: true,
            })
        )

        let stepIndex = 0

        // log first step's header & comments
        steps[0]?.printStepHeader()
        steps[0]?.printComments()

        // when the shortcut is pressed...
        let stopListening
        stopListening = registerShortcutListener(async () => {
            // write out content for current step
            await steps[stepIndex].write()
            steps[stepIndex].printCompleted()

            // increment step index
            stepIndex++

            // if we're out of steps, stop listening and return
            if (stepIndex >= steps.length) {
                stopListening()
                resolve()
                return
            }

            // log comments for next step
            steps[stepIndex].printStepHeader()
            steps[stepIndex].printComments()
        })
    })
}

export function registerShortcutListener(callback) {
    // watch for right shift
    const listener = event => {
        if (event.state == "UP" && event.name == "RIGHT CTRL") callback?.()
    }

    // add listener
    keyListener.addListener(listener)

    // return remove function
    return () => keyListener.removeListener(listener)
}

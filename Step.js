import { executeCommand, waitPromise, writeSection } from "./util.js"
import fs from "fs/promises"
import chalk from "chalk"
import path from "path"

const CONTENT_REGEX = /---\r?\n(.+?)\r?\n---/ms
const COMMENT_REGEX = /\[#(.*?)\]\s+(.+)/g
const START_CMD_REGEX = /\[start-cmd]\s+(.+)/g
const END_CMD_REGEX = /\[end-cmd]\s+(.+)/g
const DEFAULT_COMMENT_FUNCTIONS = "white"

export class Step {
    static async loadFromFile(filePath) {
        return new Step(
            await fs.readFile(filePath, "utf-8"),
            path.basename(filePath).replace(path.extname(filePath), "")
        )
    }

    /**
     * Creates an instance of Step.
     * @param {string} fileContent
     * @param {string} [label="?"]
     * @memberof Step
     */
    constructor(fileContent, label = "?") {
        this.label = label

        // pull content
        this.content = fileContent.match(CONTENT_REGEX)?.[1] ?? ""

        // whatever is remaining is commands
        const remaining = fileContent.replace(CONTENT_REGEX, "")

        // comments
        this.comments = ([...remaining.matchAll(COMMENT_REGEX)]).map(match => {
            const chalkFunction = (match[1] || DEFAULT_COMMENT_FUNCTIONS)
                .split(",").reduce((a, b) => a[b.trim()], chalk)
            return chalkFunction(match[2])
        })

        // palette commands
        this.startCommands = ([...remaining.matchAll(START_CMD_REGEX)]).map(match => match[1])
        this.endCommands = ([...remaining.matchAll(END_CMD_REGEX)]).map(match => match[1])
    }

    async start() {
        // print step header
        console.log(chalk.gray(`\nStep ${this.label}`))
        
        // print comments
        this.comments.forEach(comment => console.log(comment))
        
        // execute start commands
        for(let i = 0; i < this.startCommands.length; i++) {
            await executeCommand(this.startCommands[i])
            i != this.startCommands.length - 1 && await waitPromise(100)
        }
    }

    async finish() {
        // write content
        await writeSection(this.content)
        
        // execute end commands
        for(let i = 0; i < this.endCommands.length; i++) {
            await executeCommand(this.endCommands[i])
            i != this.endCommands.length - 1 && await waitPromise(100)
        }
        
        // print completed
        console.log(chalk.green.bold("✔"))
    }
}

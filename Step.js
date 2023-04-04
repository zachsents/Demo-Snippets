import { writeSection } from "./util.js"
import fs from "fs/promises"
import chalk from "chalk"
import path from "path"

const COMMENT_REGEX = /^#([\w,]+)?/
const DEFAULT_COMMENT_FUNCTIONS = ["white"]

export class Step {

    static async loadFromFile(filePath) {
        return new Step(
            await fs.readFile(filePath, "utf-8"),
            path.basename(filePath).replace(path.extname(filePath), "")
        )
    }

    constructor(fileContent, label = "?") {
        const lines = fileContent.split("\n")
        this.comments = lines.filter(line => line.startsWith("#"))
            .map(line => {
                const chalkFunctions = line.match(COMMENT_REGEX)?.[1]?.split(",") ?? DEFAULT_COMMENT_FUNCTIONS
                const totalFunction = chalkFunctions.reduce((a, b) => a[b], chalk)
                return totalFunction(line.replace(COMMENT_REGEX, "").trim())
            })
        this.content = lines.filter(line => !line.startsWith("#")).join("\n")
        this.label = label
    }

    printStepHeader() {
        console.log(chalk.gray(`\nStep ${this.label}`))
    }

    printComments() {
        this.comments.forEach(comment => console.log(comment))
    }

    printCompleted() {
        console.log(chalk.green.bold("✔"))
    }

    async write() {
        await writeSection(this.content)
    }
}
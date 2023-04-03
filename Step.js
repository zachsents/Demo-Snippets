import { writeSection } from "./util.js"
import fs from "fs/promises"
import chalk from "chalk"
import path from "path"


export class Step {

    static async loadFromFile(filePath) {
        return new Step(
            await fs.readFile(filePath, "utf-8"),
            path.basename(filePath).match(/\d+\w?/)?.[0]
        )
    }

    constructor(fileContent, label = "?") {
        const lines = fileContent.split("\n")
        this.comments = lines.filter(line => line.startsWith("#"))
        this.content = lines.filter(line => !line.startsWith("#")).join("\n")
        this.label = label
    }

    printStepHeader() {
        console.log(chalk.gray(`\nStep ${this.label}`))
    }

    printComments() {
        this.comments.forEach(comment => console.log(chalk.bold.yellow(comment.replace(/^#/, ""))))
    }

    async write() {
        await writeSection(this.content)
    }
}
import { startSequence } from "../../util.js"
import { fileURLToPath } from "url"

await startSequence({
    prefix: "html",
    title: "HTML",
    dir: fileURLToPath(new URL("./", import.meta.url)),
})

await startSequence({
    prefix: "css",
    title: "CSS",
    dir: fileURLToPath(new URL("./", import.meta.url)),
})

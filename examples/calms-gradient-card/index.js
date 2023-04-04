import { startSequence } from "../../util.js"
import { fileURLToPath } from "url"

await startSequence({
    title: "HTML",
    dir: fileURLToPath(new URL("./html", import.meta.url)),
})

await startSequence({
    title: "CSS",
    dir: fileURLToPath(new URL("./css", import.meta.url)),
})

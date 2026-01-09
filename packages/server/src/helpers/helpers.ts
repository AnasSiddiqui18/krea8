// import "../../temp"

import fs from "fs"
import puppeteer_core from "puppeteer-core"
import path from "path"
import chromium from "@sparticuz/chromium-min"
import { getPort } from "get-port-please"
import { NextTemplate } from "@/data"
import { PutObjectCommand } from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import { env } from "@/env/env"
import { s3Client } from "@/aws/aws"
import axios from "axios"
import { db } from "@/db/db"
import { project } from "@/db/schema"
import { eq } from "drizzle-orm"
import { extractCodeContent } from "@repo/shared/utils/extract-code-content"
import { extractFilePath } from "@repo/shared/utils/extract-file-path"
import { sendError, sendSuccess } from "@repo/shared/utils/response"

const getFoldersPath = (filePath: string) => {
    const segments = filePath.split("/").filter(Boolean)
    return segments.slice(0, -1).join("/")
}

const getSbxRoot = (sbxId: string) => `./sandboxes/sandbox-${sbxId}`

export async function createFolderTree(sbxId: string, files: Record<string, string>) {
    try {
        const sandboxRoot = getSbxRoot(sbxId)

        fs.mkdirSync(sandboxRoot, { recursive: true })

        for (let [filePath, content] of Object.entries(files)) {
            filePath = filePath.replace(/^\//, "")

            const folderPath = getFoldersPath(filePath)
            if (folderPath) {
                fs.mkdirSync(path.join(sandboxRoot, folderPath), { recursive: true })
            }

            fs.writeFileSync(path.join(sandboxRoot, filePath), content)
        }

        return { success: true }
    } catch (error) {
        console.error("Failed to create sandbox folder tree:", error)
        return { success: false }
    }
}

export function getFile(filePath: string, sbxId: string) {
    try {
        const sandboxRoot = getSbxRoot(sbxId)
        const updatedFilePath = filePath.replace(/^\//, "")
        const fileContent = fs.readFileSync(path.join(sandboxRoot, updatedFilePath), "utf-8")
        return { success: true as const, file: fileContent }
    } catch (error) {
        return { success: false as const, file: null }
    }
}

export async function getAvailablePort() {
    try {
        const port = await getPort()
        return { success: true as const, data: port }
    } catch (error) {
        console.log("Failed to get port", error)
        return { success: false as const, data: null }
    }
}

export async function updateFile(filePath: string, updatedContent: string, sbxId: string) {
    try {
        const root = getSbxRoot(sbxId)
        const fullPath = path.join(root, filePath)
        fs.writeFileSync(fullPath, updatedContent)
        return { success: true, message: "file updated" }
    } catch (error) {
        return { success: false, message: "failed to update" }
    }
}

export async function updateOrCreateFiles(updatedFiles: { rawFileBlock: string }[], sbxId: string) {
    try {
        const rootPath = getSbxRoot(sbxId)

        updatedFiles.forEach(({ rawFileBlock }) => {
            const filePath = extractFilePath(rawFileBlock)

            if (!filePath) {
                console.error("failed to extract filePath")
                return null
            }

            const code = extractCodeContent(rawFileBlock)
            if (code) fs.writeFileSync(`${path.join(rootPath, filePath)}`, code)
        })
    } catch (error) {
        console.log("update or create failed")
    }
}

export function getProjectStructure(sbxId: string) {
    const object: Record<string, string> = {}
    const rootPath = getSbxRoot(sbxId)
    const fullPath = path.join(rootPath, "src")
    const rootFolder = fs.readdirSync(fullPath)

    rootFolder.forEach((dir) => {
        const dirPath = path.join(fullPath, dir)
        const files = fs.readdirSync(dirPath)
        files.forEach((file) => {
            const filePath = path.join("src", dir, file)
            const content = getFile(filePath, sbxId)
            if (!content.success) {
                console.log(`failed to read file ${filePath}`)
                return
            }

            object[path.join("src", dir, file)] = content.file
        })
    })

    // fs.writeFileSync("data.json", JSON.stringify(object, null, 2));

    return object
}

export async function generateWebsiteScreenshotAndStoreImage(url: string, projectId: string) {
    const tempImagePath = path.resolve(__dirname, "temp")

    fs.promises.readdir(tempImagePath).catch(() => fs.mkdirSync(tempImagePath))

    try {
        const dirWithFile = `${tempImagePath + `web-image-${projectId}.png`}`

        console.log("Screenshot process started", url)

        const remoteExecutablePath =
            "https://github.com/Sparticuz/chromium/releases/download/v121.0.0/chromium-v121.0.0-pack.tar"

        const browser = await puppeteer_core.launch({
            args: chromium.args,
            executablePath: await chromium.executablePath(remoteExecutablePath),
        })

        const page = await browser.newPage()
        await page.goto(url, { waitUntil: "networkidle0" })

        await page.setViewport({
            width: 1024,
            height: 768,
            deviceScaleFactor: 2,
        })

        await page.screenshot({
            type: "png",
            path: dirWithFile,
        })

        const uploadResult = await uploadImageToStorageAndPersistUrl(projectId, dirWithFile)

        await browser.close()

        return sendSuccess(uploadResult.data)
    } catch (error) {
        console.error("Screenshot generation failed", error)
        return sendError("Failed to generate screenshoy")
    }
}

export async function uploadImageToStorageAndPersistUrl(projectId: string, localFilePath: string) {
    try {
        console.log("uploading image to s3")

        const fileKey = `web-image-${projectId}.png`
        const fileType = "image/png"

        const fileBuffer = fs.readFileSync(localFilePath)

        const command = new PutObjectCommand({
            Bucket: env.AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: fileType,
            CacheControl: "public, max-age=31536000, immutable",
        })

        const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 })

        await axios.put(presignedUrl, fileBuffer, { headers: { "Content-Type": fileType } })

        const cloudfrontUrl = `https://dymlcu2g4m3ry.cloudfront.net/krea8/${fileKey}`

        const [updatedProject] = await db
            .update(project)
            .set({ image: cloudfrontUrl })
            .where(eq(project.id, projectId))
            .returning()

        if (!updatedProject?.image) {
            throw new Error("DB update failed")
        }

        return sendSuccess("Image stored successfully")
    } catch (error) {
        console.error("Image upload failed", error)
        return sendError("Image upload failed")
    } finally {
        fs.rmSync(localFilePath)
    }
}

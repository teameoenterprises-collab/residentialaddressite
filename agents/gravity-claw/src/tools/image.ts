import { GoogleGenAI } from "@google/genai";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY,
});

export const generateImageToolDefinition = {
    name: "generate_image",
    description: "Generates an AI image using Nano Banana Pro (powered by Google Imagen 3) based on a highly detailed prompt.",
    parameters: {
        type: "OBJECT",
        properties: {
            prompt: {
                type: "STRING",
                description: "A highly detailed prompt describing the image to generate over Nano Banana Pro.",
            },
        },
        required: ["prompt"],
    },
};

export async function executeGenerateImage(args: { prompt: string }): Promise<{ type: "image"; path: string } | string> {
    console.log(`[Nano Banana Pro] Generating image for prompt: "${args.prompt}"...`);
    try {
        const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-001",
            prompt: args.prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: "1:1",
                outputMimeType: "image/jpeg",
            }
        });

        if (response.generatedImages && response.generatedImages.length > 0) {
            // Check if .image.imageBytes exists based on newer SDK structures
            let base64Image = response.generatedImages[0].image?.imageBytes;

            // Fallbacks for older SDK formats
            if (!base64Image) {
                const imgObj = response.generatedImages[0] as any;
                base64Image = imgObj.imageBytes || imgObj.image?.imageBytes;
            }

            if (!base64Image) {
                return "Failed to generate image: API returned an empty image buffer.";
            }

            const buffer = Buffer.from(base64Image, 'base64');
            const filename = `generated_${crypto.randomBytes(4).toString('hex')}.jpg`;
            const filepath = path.join("/tmp", filename);
            fs.writeFileSync(filepath, buffer);
            console.log(`[Nano Banana Pro] Image saved to ${filepath}`);
            return { type: "image", path: filepath };
        } else {
            return "Failed to generate image: API returned empty result.";
        }
    } catch (error: any) {
        console.error("[Nano Banana Pro] Error:", error);
        return `Error generating image: ${error.message}`;
    }
}

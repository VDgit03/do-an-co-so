import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

async function generateWithRetry(prompt) {

    for (let i = 0; i < 3; i++) {

        try {

            const response =
                await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt
                });

            return response.text;

        } catch (error) {

            if (error.status !== 503)
                throw error;

            await new Promise(
                resolve =>
                    setTimeout(resolve, 3000)
            );
        }
    }

    throw new Error("Gemini overloaded");
}

async function chat(system, messages) {
    const conversation = messages
        .map(m => {
            const role =
                m.role === "assistant"
                    ? "AI"
                    : "User";

            return `${role}: ${m.content}`;
        })
        .join("\n");

    const prompt = `
${system}

${conversation}
`;

    return await generateWithRetry(
        prompt
    );
}


export { chat };
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

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

    const response =
        await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt
        });

    return response.text;
}

export { chat };
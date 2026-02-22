export async function findBrazilianBusinesses(city: string, lat?: number, lng?: number) {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  const model = "gemini-2.5-flash";
  const prompt = `Encontre negócios brasileiros (restaurantes, mercados, serviços) em ${city}. Forneça uma lista com nome, tipo de negócio e uma breve descrição.`;
  
  const config: any = {
    tools: [{ googleMaps: {} }],
  };

  if (lat && lng) {
    config.toolConfig = {
      retrievalConfig: {
        latLng: {
          latitude: lat,
          longitude: lng
        }
      }
    };
  }

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config,
  });

  return {
    text: response.text,
    sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || []
  };
}

export async function askAIGuide(question: string, context: string = "Geral") {
  const { GoogleGenAI } = await import("@google/genai");
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY as string });
  const model = "gemini-3-flash-preview";
  const response = await ai.models.generateContent({
    model,
    contents: `Você é o "Guia Brasil no Mundo", um assistente prestativo para brasileiros que moram ou pretendem morar no exterior. 
    Contexto atual: ${context}
    Pergunta: ${question}`,
    config: {
      systemInstruction: "Responda de forma acolhedora, em português brasileiro, focando em dicas práticas, cultura e suporte à comunidade."
    }
  });

  return response.text;
}

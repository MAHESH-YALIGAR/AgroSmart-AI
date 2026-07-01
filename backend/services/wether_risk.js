// D:\resume-project\Agrosmart-AI\backend\services\wether_risk.js
const { GoogleGenAI } = require("@google/genai");

// Explicitly pass the apiKey object to protect against empty environment states
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// Express route handler: receives req, res
exports.generateWeatherAlert = async (req, res) => {
  const weatherData = req.body || {};
  console.log("received data in service:", weatherData);

  try {
 const prompt = `
You are AgroSmart AI, an intelligent agricultural weather risk advisor.

Analyze the weather data and generate a short, farmer-friendly alert.

Weather Information:
Temperature: ${weatherData.temperature ?? "N/A"}°C
Humidity: ${weatherData.humidity ?? "N/A"}%
Rain Probability: ${weatherData.rainProbability ?? "N/A"}%
Wind Speed: ${weatherData.windSpeed ?? "N/A"} km/h
Weather Code: ${weatherData.weatherCode ?? "N/A"}
Location: ${weatherData.location ?? "N/A"}

Rules:
1. Do NOT mention any specific crop.
2. Keep the alert under 20 words.
3. Risk must be one of:
   - Low
   - Medium
   - High
   - Critical
4. Recommendations must be simple and actionable.
5. Avoid scientific language.
6. Focus on weather-related farming risks.
7. If weather is normal, provide preventive advice.
8. Return ONLY valid JSON.

Response Format:

{
  "alert": "",
  "risk": "",
  "recommendation": [
    "",
    "",
    ""
  ]
}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    // response.text should contain the JSON string per prompt
    const text = response?.text ?? "";
    let parsed = null;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      // If parsing fails, return raw text for debugging
      console.warn("Failed to parse Gemini response as JSON", e.message);
      return res.status(502).json({ success: false, message: "Invalid AI response", raw: text });
    }

    return res.json({ success: true, data: parsed });
  } catch (error) {
    console.error("Gemini API Error details:", error?.message || error);
    return res.status(500).json({ success: false, message: error?.message || "Server error" });
  }
};

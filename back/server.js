import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'; // <-- Import CORS
import { generateChefResponse, clearChefHistory } from './chefService.js';

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_URL || '*'
}));
app.use(express.json({ limit: '10mb' }));
app.post('/chef/chat', async (req, res) => {
    try {
        // Look for image_base64 directly from React!
        const { message, image_base64 } = req.body;

        // Basic debug info about incoming image payload (do not log full base64 in production)
        if (image_base64) {
            const isDataUrl = typeof image_base64 === 'string' && image_base64.startsWith('data:');
            console.log(`Received image. dataUrl=${isDataUrl} length=${typeof image_base64 === 'string' ? image_base64.length : 0}`);
        }

        if (!message && !image_base64) {
            return res.status(400).json({ error: "Please provide a message or an image." });
        }

        // Pass the message and base64 image string to our AI service
        const aiResponse = await generateChefResponse(message, image_base64);

        // We check if the AI returned a JSON string (meaning it gave us recipes).
        try {
            // The AI might include conversational text along with the JSON.
            // We use a regular expression to extract just the JSON array part.
            const jsonMatch = aiResponse.match(/\[\s*\{[\s\S]*\}\s*\]/);
            
            // If we found a match, parse that. Otherwise, try parsing the whole response.
            const stringToParse = jsonMatch ? jsonMatch[0] : aiResponse;
            const jsonResponse = JSON.parse(stringToParse);
            
            // If successful, send it back to the React frontend with type "recipes"
            // The frontend will see this type and render the RecipeCard components!
            return res.json({ type: "recipes", data: jsonResponse });
        } catch (e) {
            // If JSON.parse fails, it means the AI just returned conversational text
            // (e.g. asking for allergies, or refusing a non-cooking question).
            // We send it back with type "chat" so the frontend renders a normal chat bubble.
            return res.json({ type: "chat", data: aiResponse });
        }
    } catch (error) {
        console.error("Chef Error:", error);
        res.status(500).json({ error: "The kitchen is on fire." });
    }
});

app.post('/chef/reset', (req, res) => {
    clearChefHistory();
    res.json({ message: "Kitchen reset!" });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running on port ${port}`));
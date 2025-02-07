import express, { Router, Request, Response } from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';


// Router
const router: Router = Router();


const genAI = new GoogleGenerativeAI('AIzaSyB4lPYfC5xllnHoHBcsvD_hNmLwev3_qFo');

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Chat instance
let chat = initializeChat();

// Function to initialize chat
function initializeChat() {
    return model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: "Hello" }],
            },
            {
                role: "model",
                parts: [{ text: "Great to meet you. What would you like to know?" }],
            },
        ],
    });
}

interface ChatRequestBody {
    message: string;
}

interface ChatResponse {
    response: string;
}

// Reinitialize the chat every time the page is refreshed
router.get('/', async (_req: Request, res: Response) => {
    try {
        chat = initializeChat();
        res.status(200).json({ message: "Chat reinitialized successfully" });
    } catch (error) {
        console.error('Error initializing chat:', error);
        res.status(500).json({ error: "Failed to initialize chat" });
    }
});

// API endpoint for chat
router.post('/', async (
    req: Request<{}, {}, ChatRequestBody>,
    res: Response<ChatResponse>
) => {
    try {
        const { message } = req.body;
        
        if (!message?.trim()) {
            return res.status(400).json({ response: "Message is required" });
        }

        const result = await chat.sendMessage(message);
        const response = await result.response.text();
        
        res.json({ response });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ response: "An error occurred while processing your request" });
    }
});

export default router;
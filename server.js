import express from 'express';
import cors from 'cors';
import { DefaultAzureCredential } from "@azure/identity";
import { AIProjectClient } from "@azure/ai-projects";

const app = express();
app.use(cors()); // Permite que el HTML (frontend) llame a esta API
app.use(express.json());

const endpoint = "https://ai-ecommerce-resource.services.ai.azure.com/api/projects/ai-ecommerce";
const agentName = "Ai-innoventas";
const agentVersion = "5";

const projectClient = new AIProjectClient(endpoint, new DefaultAzureCredential());
const openAIClient = projectClient.getOpenAIClient();

// Endpoint que será consumido por el HTML
app.post('/api/chat', async (req, res) => {
    try {
        const userMessage = req.body.prompt; // Captura el mensaje dinámico del frontend

        // Crear la conversación
        const conversation = await openAIClient.conversations.create({
            items: [{ type: "message", role: "user", content: userMessage }]
        });
        
        // Generar la respuesta usando tu agente configurado
        const response = await openAIClient.responses.create(
            { conversation: conversation.id },
            { body: { agent: { name: agentName, version: agentVersion, type: "agent_reference" } } }
        );

        // Devolver la respuesta al Frontend
        res.json({ reply: response.output_text });

    } catch (error) {
        console.error("Error en Azure AI:", error);
        res.status(500).json({ error: "Ocurrió un error al procesar el mensaje" });
    }
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor de InnovVentas corriendo en el puerto ${PORT}`);
});


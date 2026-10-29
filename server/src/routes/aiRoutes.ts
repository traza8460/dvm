import { Router } from 'express';
import { 
  summarizeManifestoHandler, 
  compareManifestosHandler, 
  askAssistantHandler, 
  generateSpeechHandler 
} from '../controllers/aiController.js';

const router = Router();

router.post('/summarize-manifesto', summarizeManifestoHandler);
router.post('/compare-manifestos', compareManifestosHandler);
router.post('/ask-assistant', askAssistantHandler);
router.post('/generate-speech', generateSpeechHandler);

export default router;

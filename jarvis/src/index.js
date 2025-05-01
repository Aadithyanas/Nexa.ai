import { analyzeTextType, formatCodeResponse, getDeepSeekResponse, enhancePrompt } from './deepseekConfig';

class VoiceContext {
    constructor() {
        this.context = {
            lastQuery: '',
            lastResponse: '',
            conversationHistory: [],
            currentMode: 'normal', // 'normal', 'programming', or 'logical'
            lastAnalysis: null
        };
    }

    updateContext(query, response, analysis) {
        this.context.lastQuery = query;
        this.context.lastResponse = response;
        this.context.lastAnalysis = analysis;
        
        // Update current mode based on analysis
        if (analysis.isProgramming) {
            this.context.currentMode = 'programming';
        } else if (analysis.isLogical) {
            this.context.currentMode = 'logical';
        } else {
            this.context.currentMode = 'normal';
        }
        
        this.context.conversationHistory.push({ 
            query, 
            response, 
            mode: this.context.currentMode,
            analysis 
        });
        
        // Keep only last 5 conversations to maintain context
        if (this.context.conversationHistory.length > 5) {
            this.context.conversationHistory.shift();
        }
    }

    getContext() {
        return this.context;
    }

    isFollowUp() {
        const context = this.getContext();
        if (!context.lastQuery || !context.lastAnalysis) return false;

        const followUpKeywords = ['explain', 'modify', 'change', 'how', 'why', 'what'];
        const isFollowUpQuery = followUpKeywords.some(keyword => 
            context.lastQuery.toLowerCase().includes(keyword)
        );

        return (context.currentMode === 'programming' || context.currentMode === 'logical') && isFollowUpQuery;
    }
}

const voiceContext = new VoiceContext();

async function handleUserQuery(query) {
    try {
        // Analyze the incoming text
        const analysis = analyzeTextType(query);
        
        // Check if this is a follow-up to a previous query
        const isFollowUp = voiceContext.isFollowUp();
        
        if (analysis.shouldUseDeepSeek || isFollowUp) {
            let prompt = query;
            
            // If it's a follow-up, include previous context
            if (isFollowUp) {
                const context = voiceContext.getContext();
                prompt = `Previous question: ${context.lastQuery}\nPrevious response: ${context.lastResponse}\nFollow-up: ${query}`;
            }

            const response = await getDeepSeekResponse(prompt, analysis);
            const formattedResponse = analysis.isProgramming ? formatCodeResponse(response) : response;
            
            // Update context
            voiceContext.updateContext(query, response, analysis);
            
            return formattedResponse;
        } else {
            // Handle normal queries with Gemini
            const response = "This is a normal query that would be handled by Gemini.";
            voiceContext.updateContext(query, response, analysis);
            return response;
        }
    } catch (error) {
        console.error('Error handling query:', error);
        return "Sorry, I encountered an error processing your request.";
    }
}

// Example usage
const exampleQuery = "give the code of the find prime number in Python";
handleUserQuery(exampleQuery)
    .then(response => console.log(response))
    .catch(error => console.error(error));

export { handleUserQuery, voiceContext }; 
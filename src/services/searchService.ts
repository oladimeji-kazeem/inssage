
import { supabase } from '../lib/supabase';

// --- MCP Interfaces ---
export interface MCPTool {
    name: string;
    description: string;
    execute: (args: any) => Promise<any>;
}

export interface SearchResult {
    source: 'Documents' | 'Employees' | 'GRC' | 'Files';
    title: string;
    description: string;
    content?: string; // For RAG
    url?: string;
    metadata?: any;
    score?: number;
}

export interface ChatResponse {
    content: string;
    citations: SearchResult[];
    thoughts?: string; // Chain of thought visibility
}

// --- RAG Helper ---
// Simulates an LLM generation step using retrieved context
const generateRAGResponse = (query: string, context: SearchResult[]): string => {
    if (context.length === 0) return "I couldn't find any information in the knowledge base to answer that.";

    // Simple Template-based "Generation"
    const topDoc = context.find(c => c.source === 'Documents' || c.source === 'Files');
    const topPerson = context.find(c => c.source === 'Employees');

    if (topDoc && topDoc.content) {
        return `Based on **${topDoc.title}**, here is the relevant information:\n\n> "${topDoc.content}"\n\nThis policy is currently **${topDoc.metadata.status}**.`;
    }

    if (topPerson) {
        return `I found details for **${topPerson.title}**. They work as a **${topPerson.metadata.role}** in the **${topPerson.metadata.department}** department.`;
    }

    return `I found ${context.length} relevant records. Please see the citations for details.`;
};


export const searchService = {
    // Tool Registry
    tools: {
        search_documents: {
            name: 'search_documents',
            description: 'Semantic search for company documents/policies',
            execute: async (query: string) => {
                const { data } = await supabase
                    .from('documents')
                    .select('title, type, status, version, content')
                    .ilike('title', `%${query}%`) // Fallback to keyword if no vector search
                    .limit(3);

                return (data || []).map(doc => ({
                    source: 'Documents',
                    title: doc.title,
                    description: `${doc.type} (v${doc.version})`,
                    content: doc.content || "No content summary available.", // Retrieval
                    metadata: doc
                }));
            }
        },
        search_employees: {
            name: 'search_employees',
            description: 'Find employee contact and role info',
            execute: async (query: string) => {
                const { data } = await supabase
                    .from('employees')
                    .select('full_name, role, department, status, email')
                    .or(`full_name.ilike.%${query}%, role.ilike.%${query}%`)
                    .limit(3);

                return (data || []).map(emp => ({
                    source: 'Employees',
                    title: emp.full_name,
                    description: `${emp.role} - ${emp.department}`,
                    metadata: emp
                }));
            }
        },
        search_grc: {
            name: 'search_grc',
            description: 'Search risks, audits, and controls',
            execute: async (query: string) => {
                // Similar to previous implementation
                const [risks] = await Promise.all([
                    supabase.from('risks').select('*').ilike('risk_description', `%${query}%`).limit(3)
                ]);
                return (risks.data || []).map(r => ({
                    source: 'GRC',
                    title: r.risk_description.substring(0, 50) + '...',
                    description: `Risk Impact: ${r.impact}`,
                    metadata: r
                }));
            }
        }
    } as Record<string, MCPTool>,

    /**
     * MCP Orchestrator: Process Query
     * 1. Intent Classification (Router)
     * 2. Tool Execution (Retrieval)
     * 3. Response Generation (RAG)
     */
    async processQuery(query: string): Promise<ChatResponse> {
        const q = query.toLowerCase();
        let retrivedContext: SearchResult[] = [];

        // 1. Router (Which tools to call?)
        const calls = [];
        if (q.includes('policy') || q.includes('document') || q.includes('work')) calls.push(this.tools.search_documents);
        if (q.includes('who') || q.includes('manager') || q.includes('contact')) calls.push(this.tools.search_employees);
        if (q.includes('risk') || q.includes('audit')) calls.push(this.tools.search_grc);

        // Default: Call all if unclear
        if (calls.length === 0) calls.push(this.tools.search_documents, this.tools.search_employees);

        // 2. Retrieval Step
        for (const tool of calls) {
            const results = await tool.execute(query);
            retrivedContext = [...retrivedContext, ...results];
        }

        // 3. Generation Step (RAG)
        const responseText = generateRAGResponse(query, retrivedContext);

        return {
            content: responseText,
            citations: retrivedContext,
            thoughts: `Routed to tools: [${calls.map(t => t.name).join(', ')}] based on keywords.`
        };
    }
};

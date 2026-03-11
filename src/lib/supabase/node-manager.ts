
// This class manages multi-instance connections for El Kenz

import { createClient } from "@supabase/supabase-js"

type NodeConfig = {
    id: string;
    name: string;
    url: string;
    anonKey: string;
    isActive: boolean;
}

class AX_NodeManager {
    private static instance: AX_NodeManager;
    private nodes: Map<string, NodeConfig> = new Map();

    private constructor() { }

    public static getInstance(): AX_NodeManager {
        if (!AX_NodeManager.instance) {
            AX_NodeManager.instance = new AX_NodeManager();
        }
        return AX_NodeManager.instance;
    }

    // Register a new Supabase Node
    public registerNode(config: NodeConfig) {
        this.nodes.set(config.id, config);
    }

    // Get a Supabase client for a specific Node
    public getClient(nodeId: string) {
        const config = this.nodes.get(nodeId);
        if (!config) {
            console.warn(`Node ${nodeId} not found, falling back to Master.`);
            // Fallback to Master Node (Environment Variables)
            return createClient(
                process.env.NEXT_PUBLIC_SUPABASE_URL!,
                process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
            );
        }

        return createClient(config.url, config.anonKey);
    }

    // Smart Routing: Decides which node to use based on load
    public async getBestAvailableNode(): Promise<string> {
        // TODO: Implement load balancing logic here
        // For now, return the first active node or fallback
        const activeNodes = Array.from(this.nodes.values()).filter(n => n.isActive);
        if (activeNodes.length > 0) {
            return activeNodes[0].id;
        }
        return "master";
    }
}

export const NodeManager = AX_NodeManager.getInstance();

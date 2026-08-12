"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, Bot } from "lucide-react";
import { Sidebar } from "./Sidebar";
import { AIAssistantDrawer } from "@/components/chat/AIAssistantDrawer";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/contexts/WorkspaceContext";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const { workspaceId } = useWorkspace();

  return (
    <div className="flex h-screen bg-duocal-void">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col overflow-hidden">
        <header className="flex items-center justify-between border-b border-duocal-border bg-duocal-slate/50 px-4 py-3 backdrop-blur-md lg:px-6">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="outline"
            size="sm"
            onClick={() => setChatOpen(true)}
            className="gap-2"
          >
            <Bot className="h-4 w-4" />
            AI Assistant
          </Button>
        </header>

        <motion.main
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="flex-1 overflow-auto p-4 lg:p-6"
        >
          {children}
        </motion.main>
      </div>

      <AIAssistantDrawer
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        workspaceId={workspaceId ?? undefined}
        onEventCreated={() => {
          window.dispatchEvent(new CustomEvent("duocal:events-changed"));
        }}
      />
    </div>
  );
}

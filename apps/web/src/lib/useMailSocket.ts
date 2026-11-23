"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { WS_BASE_URL } from "./api";

export interface MailEventPayload {
  userId: string;
  organizationId: string;
  messageId: string;
  folder: string;
  subject: string;
  from: { name?: string; address: string };
  to: Array<{ name?: string; address: string }>;
  date: string;
  snippet?: string;
  hasAttachments: boolean;
}

export interface MailStateChangedPayload {
  userId: string;
  messageId: string;
  folder?: string;
  isRead?: boolean;
  isStarred?: boolean;
}

export function useMailSocket(callbacks: {
  onMailReceived?: (mail: MailEventPayload) => void;
  onStateChanged?: (state: MailStateChangedPayload) => void;
}) {
  const [isConnected, setIsConnected] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const socketRef = useRef<WebSocket | null>(null);
  const pingIntervalRef = useRef<any>(null);
  const callbacksRef = useRef(callbacks);
  callbacksRef.current = callbacks;

  const connect = useCallback(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
    if (!token) return;

    try {
      const wsUrl = `${WS_BASE_URL}/ws?token=${encodeURIComponent(token)}`;
      const ws = new WebSocket(wsUrl);
      socketRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        // Also send auth message in case query param wasn't used
        ws.send(JSON.stringify({ type: "auth", token }));

        // Start ping heartbeat every 20 seconds
        pingIntervalRef.current = setInterval(() => {
          if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: "ping" }));
          }
        }, 20000);
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          if (msg.type === "authenticated") {
            setIsAuthenticated(true);
          } else if (msg.type === "mail:received" && msg.data) {
            callbacksRef.current.onMailReceived?.(msg.data);
          } else if (msg.type === "mail:state_changed" && msg.data) {
            callbacksRef.current.onStateChanged?.(msg.data);
          }
        } catch (e) {
          console.error("[useMailSocket] Failed to parse message:", e);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setIsAuthenticated(false);
        if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
        // Auto-reconnect after 3 seconds
        setTimeout(() => {
          if (typeof window !== "undefined" && localStorage.getItem("accessToken")) {
            connect();
          }
        }, 3000);
      };

      ws.onerror = (err) => {
        console.warn("[useMailSocket] WebSocket error:", err);
        ws.close();
      };
    } catch (err) {
      console.error("[useMailSocket] Failed to create WebSocket:", err);
    }
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (pingIntervalRef.current) clearInterval(pingIntervalRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, isAuthenticated };
}

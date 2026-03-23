"use client";

import { useEffect, useRef } from "react";
import type { Dispatch, SetStateAction } from "react";

import { getNamespaceSocket } from "@/lib/socket/socket-client";

export type UseSocketRealtimeOptions<TMessage, TState> = {
  enabled: boolean;
  userId: string | undefined;
  role: string | undefined;
  event: string;
  /**
   * Usually derived from `event` prefix, e.g. "tasks:mutation" -> "tasks".
   * Override when event naming doesn't follow this convention.
   */
  namespaceOverride?: string;
  setStateAction: Dispatch<SetStateAction<TState>>;
  applyMessageAction: (
    prev: TState,
    message: TMessage,
    viewerUserId: string | undefined,
    viewerRole: string | undefined,
  ) => TState;
};

/**
 * Generic Socket.IO subscription helper for client components.
 * This module keeps socket connections alive; it only registers/unregisters listeners.
 */
export function useSocketRealtime<TMessage, TState>({
  enabled,
  userId,
  role,
  event,
  namespaceOverride,
  setStateAction,
  applyMessageAction,
}: UseSocketRealtimeOptions<TMessage, TState>): void {
  const userIdRef = useRef(userId);
  const roleRef = useRef(role);
  const applyRef = useRef(applyMessageAction);

  userIdRef.current = userId;
  roleRef.current = role;
  applyRef.current = applyMessageAction;

  useEffect(() => {
    if (!enabled) return;

    const namespace = namespaceOverride ?? event.split(":")[0] ?? event;
    const socket = getNamespaceSocket(namespace);

    const onMessage = (message: TMessage) => {
      setStateAction((prev) =>
        applyRef.current(prev, message, userIdRef.current, roleRef.current),
      );
    };

    socket.on(event, onMessage);

    return () => {
      socket.off(event, onMessage);
    };
  }, [enabled, namespaceOverride, event, setStateAction]);
}


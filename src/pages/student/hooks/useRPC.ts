// src/pages/student/hooks/useRPC.ts
import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/utility";

// Cache dla wyników RPC
const rpcCache = new Map<string, any>();

export const useRPC = <T = any>(
  functionName: string,
  params?: Record<string, any>,
  options?: {
    enabled?: boolean;
    onSuccess?: (data: T) => void;
    onError?: (error: any) => void;
    cacheKey?: string; // Dodajemy opcję cache key
  }
) => {
  const cacheKey = options?.cacheKey || `${functionName}-${JSON.stringify(params)}`;
  const [data, setData] = useState<T | null>(() => rpcCache.get(cacheKey) || null);
  const [isLoading, setIsLoading] = useState(!rpcCache.has(cacheKey));
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async (forceRefresh = false) => {
    if (options?.enabled === false) return;
    
    // Jeśli mamy cache i nie wymuszamy odświeżenia
    if (!forceRefresh && rpcCache.has(cacheKey)) {
      setData(rpcCache.get(cacheKey));
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const { data: result, error: rpcError } = await supabaseClient.rpc(
        functionName,
        params
      );
      
      if (rpcError) throw rpcError;
      
      // Zapisz w cache
      rpcCache.set(cacheKey, result);
      setData(result);
      options?.onSuccess?.(result);
    } catch (err) {
      setError(err as Error);
      options?.onError?.(err);
    } finally {
      setIsLoading(false);
    }
  }, [functionName, cacheKey, JSON.stringify(params), options?.enabled]);

  useEffect(() => {
    execute();
  }, [execute]);

  // Funkcja do invalidacji cache
  const invalidate = useCallback(() => {
    rpcCache.delete(cacheKey);
  }, [cacheKey]);

  return { data, isLoading, error, refetch: () => execute(true), invalidate };
};

// Funkcja pomocnicza do invalidacji wielu kluczy
export const invalidateRPCCache = (pattern?: string) => {
  if (!pattern) {
    rpcCache.clear();
  } else {
    Array.from(rpcCache.keys()).forEach(key => {
      if (key.includes(pattern)) {
        rpcCache.delete(key);
      }
    });
  }
};
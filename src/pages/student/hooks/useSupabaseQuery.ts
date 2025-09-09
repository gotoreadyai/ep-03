// src/pages/student/hooks/useSupabaseQuery.ts
import { useState, useEffect, useCallback } from "react";
import { supabaseClient } from "@/utility";

interface QueryOptions {
  select?: string;
  filters?: Array<{
    field: string;
    operator: string;
    value: any;
  }>;
  sorts?: Array<{
    field: string;
    order: "asc" | "desc";
  }>;
  limit?: number;
  enabled?: boolean;
}

export const useSupabaseQuery = <T = any>(
  table: string,
  options?: QueryOptions
) => {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(async () => {
    if (options?.enabled === false) return;

    try {
      setIsLoading(true);
      setError(null);

      let query = supabaseClient.from(table).select(options?.select || "*");

      // Apply filters
      options?.filters?.forEach((filter) => {
        switch (filter.operator) {
          case "eq":
            query = query.eq(filter.field, filter.value);
            break;
          case "in":
            query = query.in(filter.field, filter.value);
            break;
          case "contains":
            query = query.ilike(filter.field, `%${filter.value}%`);
            break;
          // Add more operators as needed
        }
      });

      // Apply sorts
      options?.sorts?.forEach((sort) => {
        query = query.order(sort.field, { ascending: sort.order === "asc" });
      });

      // Apply limit
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      const { data: result, error: queryError } = await query;

      if (queryError) throw queryError;

      setData((result as T[]) || ([] as T[]));
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, [table, JSON.stringify(options)]);

  useEffect(() => {
    execute();
  }, [execute]);

  return { data, isLoading, error, refetch: execute };
};

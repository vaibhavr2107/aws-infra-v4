import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...options,
    credentials: "include",
  });

  await throwIfResNotOk(res);
  const jsonResponse = await res.json();
  
  // Check if this is a dummy mode response with the special wrapper format
  if (jsonResponse && 
      jsonResponse.status === 'mock-success' && 
      jsonResponse.message && 
      jsonResponse.data) {
    console.log('Received dummy mode response, unwrapping data');
    // Return just the data part
    return jsonResponse.data as T;
  }
  
  // Return the normal response
  return jsonResponse;
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn = <T,>(options: {
  on401: UnauthorizedBehavior;
}): QueryFunction<T> => {
  return async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (options.on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    const jsonResponse = await res.json();
    
    // Check if this is a dummy mode response with the special wrapper format
    if (jsonResponse && 
        jsonResponse.status === 'mock-success' && 
        jsonResponse.message && 
        jsonResponse.data) {
      console.log('Received dummy mode response in query, unwrapping data');
      // Return just the data part
      return jsonResponse.data;
    }
    
    // Return the normal response
    return jsonResponse;
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});

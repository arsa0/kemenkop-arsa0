import { useState, useCallback } from 'react';

interface ApiState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}

interface UseApiStateReturn<T> {
    state: ApiState<T>;
    setData: (data: T | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    resetState: () => void;
    fetchData: (url: string, options?: RequestInit) => Promise<T | null>;
}

export function useApiState<T = any>(): UseApiStateReturn<T> {
    const [state, setState] = useState<ApiState<T>>({
        data: null,
        loading: false,
        error: null,
    });

    const setData = useCallback((data: T | null) => {
        setState(prev => ({ ...prev, data, error: null }));
    }, []);

    const setLoading = useCallback((loading: boolean) => {
        setState(prev => ({ ...prev, loading }));
    }, []);

    const setError = useCallback((error: string | null) => {
        setState(prev => ({ ...prev, error, loading: false }));
    }, []);

    const resetState = useCallback(() => {
        setState({ data: null, loading: false, error: null });
    }, []);

    const fetchData = useCallback(async (url: string, options?: RequestInit): Promise<T | null> => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch(url, options);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();
            setData(result);
            setLoading(false);
            return result;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'An error occurred';
            setError(errorMessage);
            setLoading(false);
            return null;
        }
    }, [setData, setLoading, setError]);

    return {
        state,
        setData,
        setLoading,
        setError,
        resetState,
        fetchData,
    };
}
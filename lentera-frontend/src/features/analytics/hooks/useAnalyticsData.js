import { useEffect, useState } from 'react';
import { analyticsApi } from '../../../services/api';

export function useAnalyticsData() {
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        let isMounted = true;

        async function loadSummary() {
            setIsLoading(true);
            setError(null);
            try {
                const summary = await analyticsApi.summary();
                if (isMounted) setData(summary);
            } catch (err) {
                if (isMounted) setError(err.message || 'Failed to load analytics data.');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }

        loadSummary();

        return () => {
            isMounted = false;
        };
    }, []);

    return { data, isLoading, error };
}

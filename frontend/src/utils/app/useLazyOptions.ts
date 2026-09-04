import { ref, type Ref } from 'vue';

interface UseLazyOptionsConfig {
    onError?: (error: unknown) => void;
}

export const useLazyOptions = <T>(fetcher: () => Promise<T[]>, config: UseLazyOptionsConfig = {}) => {
    const { data: items, loading, hasFetched, fetchData: fetchItems, handleMenuOpen, reset } = useLazyAsync<T[]>(fetcher, [], config);
    return { items, loading, hasFetched, fetchItems, handleMenuOpen, reset };
};

interface UseLazyAsyncConfig {
    onError?: (error: unknown) => void;
}

export const useLazyAsync = <T>(fetcher: () => Promise<T>, initialValue: T, config: UseLazyAsyncConfig = {}) => {
    const data = ref<T>(initialValue) as Ref<T>;
    const loading = ref(false);
    const hasFetched = ref(false);

    const fetchData = async () => {
        loading.value = true;
        try {
            data.value = await fetcher();
            hasFetched.value = true;
        } catch (error) {
            config.onError?.(error);
        } finally {
            loading.value = false;
        }
    };

    const handleMenuOpen = async (isOpen: boolean) => {
        if (isOpen && !hasFetched.value)
            await fetchData();
    };

    const reset = () => {
        hasFetched.value = false;
        data.value = initialValue;
    };

    return { data, loading, hasFetched, fetchData, handleMenuOpen, reset };
};

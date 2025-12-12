export const activeContainers = new Map<
    string,
    {
        isServerReady: boolean
        hasError: boolean
        errorMessage: string | null
        port: string
    }
>()

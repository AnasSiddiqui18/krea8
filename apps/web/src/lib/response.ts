export const sendError = (message: string) => ({
    success: false as const,
    message,
    data: null,
})

export const sendSuccess = <T>(data: T) => ({
    success: true as const,
    message: null,
    data,
})

export const TelegramAppRoutes = {
    AUTH: '/auth/login',
    APPS: '/apps',
    CREATE_APP: '/apps/create',
    SEND_PASSWORD: '/auth/send_password',
} as const

export interface TelegramApp {
    app_title: string
    app_shortname: string
    app_url: string
    app_platform: string
    app_dsc: string
}

export interface TelegramAppCredentials {
    apiId: string
    apiHash: string
}

export interface ITelegramApp {
    /**
     * Send a code to the phone number for authorization on my.telegram.org
     * @param phoneNumber Phone number in international format
     * @returns Random password hash
     */
    sendConfirmatioCodeTelegramApps(phoneNumber: string): Promise<string | null>

    createTelegramApp(token: string, appParams: {
        appTitle: string
        appShortname: string
        appUrl: string
        appPlatform: string
        appDescription: string
    }): Promise<TelegramApp>

    getTelegramAppCredentials(token: string): Promise<TelegramAppCredentials>

    /**
     * Sign in to my.telegram.org to receive an api id and api hash
     */
    signInTelegramApps(params: {
        /**
         * Phone number in international format
         */
        phone: string
        /**
         * Random hash from the request sendConfirmatioCodeTelegramApi
         */
        random_hash: string
        /**
         * The confirmation code that came in the Telegram messages
         */
        code: string
    }): Promise<string | null>
}

import type { AxiosInstance, AxiosProxyConfig } from 'axios'
import type { ITelegramApp, TelegramApp, TelegramAppCredentials } from './telegram-app.types'
import axios from 'axios'
import * as cheerio from 'cheerio'
import { TelegramAppRoutes } from './telegram-app.types'

export interface TelegramAppClientOptions {
    proxy: AxiosProxyConfig
}

export class TelegramAppClient implements ITelegramApp {
    private readonly _client: AxiosInstance
    constructor(opts?: TelegramAppClientOptions) {
        this._client = axios.create({
            baseURL: 'https://my.telegram.org',
            timeout: 4000,
            proxy: opts?.proxy ? opts.proxy : false,
        })
    }

    private normalizePhoneNumber(input: string) {
        input = input.trim().replace(/[+()\s-]/g, '')
        if (!input.match(/^\d+$/)) throw new Error('Invalid phone number')

        return input
    }

    async sendConfirmatioCodeTelegramApps(phoneNumber: string): Promise<string | null> {
        const phone = this.normalizePhoneNumber(phoneNumber)
        const res = await this._client.post(
            TelegramAppRoutes.SEND_PASSWORD,
            { phone },
            { headers: { 'Content-Type': 'multipart/form-data' } },
        )
        return res.data.random_hash
    }

    async createTelegramApp(
        token: string,
        appParams: {
            appTitle: string
            appShortname: string
            appUrl: string
            appPlatform: string
            appDescription: string
        },
    ): Promise<TelegramApp> {
        const resultHtml = await this._client.get(TelegramAppRoutes.APPS, {
            headers: { Cookie: `stel_token=${token}` },
        })
        const $ = cheerio.load(resultHtml.data)
        const hash = $('input[name="hash"]').val()

        const appData = {
            app_title: appParams.appTitle,
            app_shortname: appParams.appShortname,
            app_url: appParams.appUrl,
            app_platform: appParams.appPlatform,
            app_dsc: appParams.appDescription,
        }

        await this._client.post(TelegramAppRoutes.CREATE_APP, { ...appData, hash })
        return appData
    }

    async getTelegramAppCredentials(token: string): Promise<TelegramAppCredentials> {
        const resultHtml = await this._client.get(TelegramAppRoutes.APPS, {
            headers: { Cookie: `stel_token=${token}` },
        })

        const $ = cheerio.load(resultHtml.data)
        const formGroups = $('.form-group')

        const result: TelegramAppCredentials = {
            apiId: '',
            apiHash: '',
        }

        for (const group of formGroups) {
            const apiIdElement = $(group).find('label')
            if (apiIdElement.attr('for')?.toLowerCase() === 'app_id') {
                const value = apiIdElement.next().find('span').text()
                result.apiId = value
            }

            if (apiIdElement.attr('for')?.toLowerCase() === 'app_hash') {
                const value = apiIdElement.next().find('span').text()
                result.apiHash = value
            }
        }

        if (!result.apiId || !result.apiHash) {
            throw new Error("Couldn't find apiId or apiHash. Try again")
        }

        return result
    }

    async signInTelegramApps(params: { phone: string, random_hash: string, code: string }): Promise<string> {
        const phoneNumber = this.normalizePhoneNumber(params.phone)
        const res = await this._client.post(
            TelegramAppRoutes.AUTH,
            {
                phone: phoneNumber,
                random_hash: params.random_hash,
                password: params.code,
            },
            { headers: { 'Content-Type': 'multipart/form-data' } },
        )

        if (res.data === 'Invalid confirmation code!') {
            throw new Error('Invalid confirmation code or hash')
        }

        const cookie = res.headers['set-cookie']
        if (!cookie) {
            throw new Error("Not found 'Set-Cookie' on response headers")
        }
        return cookie[0]
    }
}

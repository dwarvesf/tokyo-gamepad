import { useEffect, useRef, useState } from "react"
import type { Gamepad, EventKit } from "tokyoclient-ts"
import { TokyoGameClient as TokyoClient } from "tokyoclient-ts"

const CONFIG = {
    serverHost: "combat.sege.dev",
    apiKey: "webuild0",
  }

interface UseTokyoGameClientParams {
    onConnectSucceed?: (gp: Gamepad) => void
    eventHandler?: (e: EventKit) => void
    allowConnect?: Boolean
    userName: string
}

export const useTokyoGameClient = ({
    userName,
    onConnectSucceed,
    eventHandler,
    allowConnect=true
}: UseTokyoGameClientParams) => {
    const [ client, setClient ] = useState<TokyoClient>()
    const [ isFirstLoading, setIsFirstLoading ] = useState(true)

    const connectSuccessRef = useRef(onConnectSucceed)
    const eventHandlerRef = useRef(eventHandler)

    const createGameClient = () => {
        if (!allowConnect) return

        const client = new TokyoClient({
            ...CONFIG,
            userName
        })

        client.setOnOpenFn((gamepad: Gamepad) => {
            setIsFirstLoading(false)
            connectSuccessRef.current?.(gamepad)
        })
        client.setOnMessageFn((e: EventKit) => eventHandlerRef.current?.(e))

        setClient(client)

        console.log("created client")
    }

    useEffect(createGameClient, [allowConnect, userName])

    return {
        controller: client ? {
            rotate: client.rotate.bind(client),
            fire: client.fire.bind(client),
            throttle: client.throttle.bind(client),
        }: undefined,
        isFirstLoading
    }
}
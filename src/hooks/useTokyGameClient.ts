import { useEffect, useRef, useState, useId } from "react"
import { 
    TokyoGameClient as TokyoClient, 
    Gamepad, 
    EventKit, 
} from "tokyoclient-ts"

interface UseTokyoGameClientParams {
    onConnectSucceed?: (gp: Gamepad) => void
    eventHandler?: (e: EventKit) => void
    allowConnect?: Boolean
    userName: string
}

export interface TokyoController {
    rotate: (a:number) => void
    fire: () => void
    throttle: (s: number) => void
}

export const useTokyoGameClient = ({
    userName,
    allowConnect=true
}: UseTokyoGameClientParams) => {
    const [ client, setClient ] = useState<TokyoClient>()
    const [ isFirstLoading, setIsFirstLoading ] = useState(true)
    const id = useId()

    const createGameClient = () => {
        if (!allowConnect) return
        const client = new TokyoClient({
            serverHost: "combat.sege.dev",
            apiKey: "webuild",
            useHttps: true,
            userName: userName + "_" + id
        })
        client.setOnOpenFn(() => setIsFirstLoading(false))
        setClient(client)
        console.log("created client")
    }
    useEffect(createGameClient, [allowConnect, userName, id])

    return {
        controller: client ? {
            rotate: client.rotate.bind(client),
            fire: client.fire.bind(client),
            throttle: client.throttle.bind(client),
        } as TokyoController: undefined,
        isFirstLoading
    }
}


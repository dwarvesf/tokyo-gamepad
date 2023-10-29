import { useEffect, useState, useId } from "react"
import { v4 as uuidv4 } from 'uuid';
import {
    TokyoGameClient as TokyoClient, 
    Gamepad, 
} from "tokyoclient-ts"

interface UseTokyoGameClientParams {
    onConnectSucceed?: () => void
    eventHandler?: () => void
    allowConnect?: boolean
    userName: string
}

export const useTokyoGameClient = ({
    userName,
    allowConnect=true
}: UseTokyoGameClientParams) => {
    const [ gamepad, setGamepad ] = useState<Gamepad>()
    const [ isLoading, setIsLoading ] = useState(true)
    const id = useId()

    const createGameClient = () => {
        if (!allowConnect) {
            setGamepad(undefined)
            return
        }
        setIsLoading(true)
        const client = new TokyoClient({
            serverHost: "combat.sege.dev",
            apiKey: uuidv4(),
            useSecureConnection: true,
            userName: userName + "_" + id
        })
        client.setOnOpenFn(() => setIsLoading(false))
        setGamepad(client.GamePad())
        console.log("created client")
        return () => {
            if (allowConnect) {
                console.log('closed')
                client.close()
            }
        }
    }
    useEffect(createGameClient, [allowConnect, userName, id])

    return {
        // Uncaught DOMException: Failed to execute 'send' on 'WebSocket': Still in CONNECTING state.
        controller: isLoading ? undefined: gamepad,
        isLoading,
    }
}

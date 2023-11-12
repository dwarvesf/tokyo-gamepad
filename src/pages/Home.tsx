import { useState } from "react"
import { useTokyoGameClient } from "@/hooks/useTokyoGameClient"
import { JoystickCanvas } from "@/components/JoystickCanvas"
import { ButtonCanvas } from "@/components/ButtonCanvas"
import { LoginForm } from "@/components/LoginForm"
import clsx from "clsx"

export default function Home () {

  const [ username, setUsername ] = useState<string>("")
  const [ isLockScreen, setIsLockScreen ] = useState<boolean>(false)

  const { controller, isLoading } = useTokyoGameClient({
    userName: username,
    allowConnect: Boolean(username),
  })

  const [ fireButtonPressed, SetFireButtonPressed ] = useState(false)

  if (!username) return <LoginForm setUsername={setUsername}/>
  return (
    <main className="h-[100vh] w-full overflow-hidden relative bg-background">
      <div className='relative z-10'>
        <h3 className='mx-auto text-center p-4 font-medium'>
            {isLockScreen ? (
              <span className='text-green-600 '><span className='text-3xl'>️</span> Enjoy your playing</span>
            ): (
              <span className='text-red-500 '><span className='text-3xl'>⚠️</span> Lock your screen first to prevent scrolling while playing</span>
            )}
        </h3>
        <div className='flex flex-col items-center justify-center pb-8 gap-4'>
            <div>
              <input
                id="inputLock"
                className="hidden"
                type="checkbox"
                checked={isLockScreen}
                onChange={e => setIsLockScreen(e.target.checked)}
              />
              <label htmlFor="inputLock">
                {isLockScreen ? "🔒 Locked" : "🔓 Lock" }
              </label>
            </div>
            <button
              className="px-4  h-10 rounded-lg bg-neutral-800 text-neutral-200"
              onClick={() => {
                setUsername("")
              }}
            >
              Logout
            </button>
            <div className='flex items-center gap-2'>
              {isLoading ? (
                  <>
                  <span className='text-yellow-500 '>
                    Connecting
                  </span>
                  <span className='inline-block w-2 h-2 rounded-full bg-red-500 animate-pulse duration-800'></span>
                  </>
              ): (
                <>
                  <span className='text-green-500 '>
                    Connected
                  </span>
                  <span className='inline-block w-2 h-2 rounded-full bg-green-400'></span>
                </>
              )}
            </div>
        </div>
      </div>
      <JoystickCanvas
        wrapperProps={{
          className: "absolute left-0 w-1/2 top-20 bottom-10 w-1/2"
        }}
        joystickBaseColor="black"
        joystickThumbColor="white"
        onStart={() => {}}
        onMove={({direcVector, distance, maxDistance}) => {
          controller?.throttle(distance/maxDistance)
          controller?.rotate(Math.atan2(direcVector.x, -direcVector.y) - Math.PI/2)
        }}
        throttleOnMove={100}
        onStop={() => controller?.throttle(0)}
        lockScreen={isLockScreen}
      />
      <ButtonCanvas
        wrapperProps={{
            className: clsx(
              "absolute right-0 w-1/3 top-20 bottom-10 rounded-l-[70px] transition bg-foreground",
              {
                "opacity-90": fireButtonPressed,
              }
            ),
        }}
        lockScreen={isLockScreen}
        onPressed={() => SetFireButtonPressed(true)}
        onReleased={() => {
          SetFireButtonPressed(false)
          controller?.fire()
        }}
      />
    </main>
  )
}

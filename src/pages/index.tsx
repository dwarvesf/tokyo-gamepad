import { Inter } from 'next/font/google'
import { useState } from 'react'
import { useTokyoGameClient } from '@/hooks/useTokyGameClient'
import { P5Canvas } from '@/components/P5Canvas/P5Canvas'
import { controllerSketch } from "@/sketches/controller"
import { Toggle } from '@/components/ui/toggle'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const inter = Inter({ subsets: ['latin'] })

export default function Home () {

  const [ username, setUsername ] = useState<string>("")
  const [ isLockScreen, setIsLockScreen ] = useState<boolean>(false)

  const { controller, isFirstLoading } = useTokyoGameClient({
    userName: username,
    allowConnect: Boolean(username),
  })

  if (!username) return <LoginForm setUsername={setUsername}/>
  return (
    <main className="h-[100vh] w-full overflow-hidden relative">
      <div className='relative z-10'>
        <h3 className='mx-auto text-center text-xl p-4 font-medium'>
            {isLockScreen ? (
              <span className='text-green-600 '><span className='text-3xl'>️</span> Enjoy your playing</span>
            ): (
              <span className='text-red-500 '><span className='text-3xl'>⚠️</span> Lock your screen first to prevent scrolling while playing</span>
            )}
        </h3>
        <div className='flex flex-col items-center justify-center pb-8 gap-4'>
            <Toggle pressed={isLockScreen} onPressedChange={e => setIsLockScreen(e)} 
              variant="outline"
            >
              {isLockScreen ? "Unlock": "Lock"}
            </Toggle>
            <div className='flex items-center gap-2'>
              {isFirstLoading ? (
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
      <P5Canvas
        wrapperClassName="absolute inset-0 top-0"
        sketch={controllerSketch}
        lockScreen={isLockScreen}
        tokyoController={controller}
      />
    </main>
  )
}

function LoginForm (props: { setUsername: (u: string) => void}) {
  const { setUsername } = props
  const [ internalUsername, setInternalUsername ] = useState<string>("")

  return (
    <main className="relative h-[100vh] tablet:w-[600px] w-full tablet:px-0 px-8 flex flex-col gap-8 mx-auto">
        <h3 className="text-7xl font-bold mt-16 text-center">
          TokyoRS
        </h3>
        <div className='flex flex-col gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/5 w-full px-10'>
          <Input
            className="text-lg p-6"
            placeholder="Your Username"
            value={internalUsername}
            onChange={(e) => {setInternalUsername(e.target.value)}}
          />
          <Button
            className='!p-6 text-lg'
            size="lg"
            onClick={() => setUsername(internalUsername)}
          > 
            Play
          </Button>
        </div>
    </main>
  )
}
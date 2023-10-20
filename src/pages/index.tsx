import { Inter } from 'next/font/google'
import { Joystick } from "react-joystick-component"
import { useState } from 'react'
import { useTokyoGameClient } from '@/hooks/useTokyGameClient'
import { IJoystickUpdateEvent } from 'react-joystick-component/build/lib/Joystick'

const inter = Inter({ subsets: ['latin'] })

export default function Home () {

  const [ username, setUsername ] = useState<string>("")

  const { controller, isFirstLoading } = useTokyoGameClient({
    userName: username,
    eventHandler: (eventKit) => {

    },
    allowConnect: Boolean(username)
  })

  const handleMove = (e: IJoystickUpdateEvent) => {
    setTimeout(() => {
      const x = e.x as number
      const y = e.y as number

      const rotateAngle = Math.atan2(x, y) - Math.PI/2
      controller?.rotate(rotateAngle)
      controller?.throttle(Math.sqrt(Math.pow(x, 2) + Math.pow(y,2)))
    })
  }

  const handleStop = (e: IJoystickUpdateEvent) => {
    controller?.throttle(0)
  }

  const handleFire = () => {
    controller?.fire()
  }

  if (!username) return <LoginForm setUsername={setUsername}/>
  return (
    <main className="h-[100vh] w-full flex items-end justify-between pb-14 px-14">
      <Joystick
        move={handleMove}
        throttle={100}
        stop={handleStop}
      />
      <button className="w-[100px] h-[100px] rounded-full bg-red-500 text-xl font-bold text-white"
        onClick={handleFire}
      >
        Fire
      </button>
      </main>
  )
}

function LoginForm (props: { setUsername: (u: string) => void}) {
  const { setUsername } = props
  const [ internalUsername, setInternalUsername ] = useState<string>("")

  return (
    <main className="h-[100vh] w-full flex justify-center items-center">
      <div className="px-10 flex flex-col gap-4 -translate-y-10">
        <h3 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-500 to-teal-600">
          Wellcome To TokyoRS
        </h3>
        <div className='flex flex-col gap-4'>
          <input className="bg-white shadow-md text-xl py-4 px-8 bg-transparent outline-none rounded-2xl"
            placeholder="Your Username"
            value={internalUsername}
            onChange={(e) => {setInternalUsername(e.target.value)}}
          />
          <button className="py-4 text-2xl bg-teal-600 text-orange-50 rounded-2xl font-bold"
            onClick={() => setUsername(internalUsername)}
          > 
            Play
          </button>
        </div>
      </div>
    </main>
  )
}
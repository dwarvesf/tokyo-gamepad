import { useState } from "react"

export function LoginForm (props: { setUsername: (_: string) => void}) {
  const { setUsername } = props
  const [ internalUsername, setInternalUsername ] = useState<string>("")

  return (
    <main className="relative h-[100vh] w-full px-8 sm:px-0 sm:max-w-lg flex-col gap-8 mx-auto">
        <h3 className="text-7xl font-bold pt-16 text-center">
          TokyoRS
        </h3>
        <div className='flex flex-col gap-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-2/5 w-full px-10'>
          <input
            className="text-lg px-6 h-14 rounded-lg outline-none border border-neutral-300 focus:ring-4 transition ring-neutral-600"
            placeholder="Your Username"
            value={internalUsername}
            onChange={(e) => {setInternalUsername(e.target.value)}}
          />
          <button
            className='px-6 h-14 text-lg bg-neutral-900 text-neutral-200 rounded-lg'
            onClick={() => setUsername(internalUsername)}
          > 
            Play
          </button>
        </div>
    </main>
  )
}
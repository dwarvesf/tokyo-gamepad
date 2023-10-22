import { SketchProps, Sketcher } from "@/components/P5Canvas/type";
import { TokyoController } from "@/hooks/useTokyGameClient";
import { Vector } from "p5";

interface DemoSketcher extends SketchProps {
    lockScreen?: boolean
    tokyoController?: TokyoController
}

interface P5Touch {
  id: number
  x: number
  y: number 
  winX: number
  winY: number
}

export const controllerSketch:Sketcher<DemoSketcher> = (p5) => {

  const CANVAS_OFFSET_FROM_TOP = 0
  let gameController = {
    fire: () => {},
    rotate: (a: number) => {},
    throttleSpeed: (s: number) => {}
  }

  // Joystick
  let isLockedScreen = false
  let joystickPos = p5.createVector(0, 0)
  let joystickSize = 0

  // Joystick thumb
  let joystickThumbPos = p5.createVector(0, 0)
  let joystickThumbSize = 0
  let isJoystickTouched = false

  // Fire button
  let fireButtonPos = p5.createVector(0,0)
  let fireButtonSize = 0
  let isFireButtonPressed = false

  // Touche Event Manager
  let prevTouches = [] as P5Touch[]
  let touchLeaveHandlers: {
    [touchId: number]: (pos: Vector) => void
  } = {}
  let touchActiveHandlers: {
    handlerkey: string,
    touchId: number,
    action: (pos: Vector) => void
  }[] = []

  p5.windowResized = (e: any) => {
    resiveCanvas(e.target)
  }

  p5.setup = () => {
    resiveCanvas(window)
  }

  p5.updateWithProps = (props) => {
    isLockedScreen = Boolean(props.lockScreen)
    if (props.tokyoController) {
      gameController = {
        // @ts-ignore
        fire: throttleRequest(props.tokyoController.fire, 0, true),
        rotate: throttleRequest(props.tokyoController.rotate, 100),
        throttleSpeed: throttleRequest(props.tokyoController.throttle, 100)
      }
    }
  }

  p5.draw = () => {
    p5.background("");
    handlingTouch([
      // Hanlding Fire button
      {
        key: "fireButton",
        activator: (pos) => pos.sub(getCircleCenterPos(fireButtonPos, fireButtonSize)).mag() < fireButtonSize / 2,
        onStart: () => isFireButtonPressed = true,
        onLeave: () => {
          isFireButtonPressed = false
          gameController.fire()
        }
      },
      // Hanlding Joystick thumb touched
      {
        key: "joystick_touched",
        activator: (pos) =>  pos.sub(getCircleCenterPos(joystickPos, joystickSize)).mag() < joystickSize / 2,
        onStart: () => {
          isJoystickTouched = true
        },
        action: (pos) => {
          const joystickCenterPos = getCircleCenterPos(joystickPos.copy(), joystickSize)
          const distanceToCenter = pos.copy().sub(joystickCenterPos).mag() // correct

          if (distanceToCenter > joystickSize / 2) {
            const ratio = (joystickSize / 2) / distanceToCenter // 

            joystickThumbPos.set(pos.copy().sub(joystickCenterPos).mult(ratio).add(joystickPos.copy().add(joystickSize/4, joystickSize/4)))
          } else {
            joystickThumbPos.set(pos.copy().sub(
              joystickThumbSize / 2,
              joystickThumbSize / 2
            ))
          }

          handleGameMovingAndThrottle()
        },
        onLeave: () => {
          isJoystickTouched = false
          stopMoving()
          resetJoystickThumbPos()
        }
      }
    ])

    // Render
    p5.ellipseMode(p5.CORNER)
    p5.circle(joystickPos.x, joystickPos.y, joystickSize)
    p5.circle(joystickThumbPos.x, joystickThumbPos.y, joystickThumbSize)
    if (isFireButtonPressed) {
      p5.fill('red')
    }
    p5.circle(fireButtonPos.x, fireButtonPos.y, fireButtonSize)
    p5.noFill()
  }

  p5.touchMoved = (e) => {
    if (isLockedScreen) {
      return false
    }
  }

  function resiveCanvas (e: {innerWidth: number, innerHeight: number}) {
    p5.resizeCanvas(e.innerWidth, e.innerHeight - CANVAS_OFFSET_FROM_TOP)
    joystickSize = p5.min([p5.width / 4, p5.height * 2/5])
    fireButtonSize = joystickSize
    joystickThumbSize = joystickSize / 2

    joystickPos.set(
      joystickSize * 1/3,
      p5.height - joystickSize * 3/2
    )

    resetJoystickThumbPos()

    fireButtonPos.set(
      p5.width - fireButtonSize - joystickSize * 1/3,
      p5.height - fireButtonSize * 3/2
    )
  }

  function handlingTouch(
    handlers: Array<{
      key: string,
      activator: (pos: Vector) => boolean,
      onLeave?: (pos: Vector) => void,
      action?: (pos: Vector) => void,
      onStart?: (pos: Vector) => void,
      onDrag?: (pos: Vector) => void
    }>
  ) {
    const touches = p5.touches as P5Touch[]
    const touchIds = new Set(touches.map(t => t.id))
    const prevTouchIds = new Set(prevTouches.map(t => t.id))
    const deactiveTouches = prevTouches.filter(t => !touchIds.has(t.id))
    const activeTouches = touches.filter(t => !prevTouchIds.has(t.id))

    //  on Touch Start
    activeTouches.forEach((touch) => {
      // Fint event hanlder that will be active
      const activeHandlers = handlers.filter(({activator, key}) => (
        !touchActiveHandlers.find(h => h.handlerkey === key)
        && activator(p5.createVector(touch.x, touch.y))
      ))

      activeHandlers.forEach(h => {
        // get onLeave handler
        touchActiveHandlers.push({
          handlerkey: h.key,
          touchId: touch.id,
          action: h.action ?? ((pos: Vector) => {})
        })
        h.onStart?.(p5.createVector(touch.x, touch.y))
        if (h.onLeave) {
          touchLeaveHandlers[touch.id] = h.onLeave
        }
      })
    })

    //  on Touch Stop
    deactiveTouches.forEach(t => {
      touchLeaveHandlers[t.id]?.(p5.createVector(t.x, t.y))
      delete touchLeaveHandlers[t.id]
      touchActiveHandlers = touchActiveHandlers.filter(h => h.touchId !== t.id)
    })

    touchActiveHandlers.forEach(h => {
      const t = touches.find(t => t.id === h.touchId)
      if (t) {
        h.action(p5.createVector(t.x, t.y))
      }
    })

    // Store prev touch
    prevTouches = touches
  }

  function resetJoystickThumbPos () {
    joystickThumbPos.set(
      joystickSize * 5/6 - joystickThumbSize / 2,
      p5.height - joystickSize - joystickThumbSize / 2
    )
  }

  function handleGameMovingAndThrottle () {
    // When dragging Joystick only
    const dirVec = getCircleCenterPos(joystickThumbPos, joystickThumbSize).sub(getCircleCenterPos(joystickPos, joystickSize))
    const distance = dirVec.mag()
    const distRatio = distance / (joystickSize/2)
    const angle = p5.atan2(dirVec.y, dirVec.x)

    const actualAngle = angle
    gameController.rotate(actualAngle)
    gameController.throttleSpeed(distRatio)
  }

  function stopMoving () {
    gameController.throttleSpeed(0)
  }
}

function getCircleCenterPos (a: Vector, delimeter: number) {
  return a.copy().add(delimeter / 2, delimeter / 2)
}

/* eslint-disable */
function throttleRequest(func, time: number, noArg: boolean = false) {
  let timeout = true
  if (!noArg) {
    return (a) => {
      if (timeout) {
        (func as any)(a)
        timeout = false
        setTimeout(() => timeout = true, time)
      }
    }
  }
  else {
    return () => {
      if (timeout) {
        (func as any)()
        timeout = false
        setTimeout(() => timeout = true, time)
      }
    }
  }
}
/* eslint-enable */
import { useEffect, useRef, useState } from 'react'
import { InputManager } from './components/inputManager';
import UnlimitedCanvas from './components/UnlimitedCanvas/UnlimitedCanvas';
import UnlimitedSVG from './components/UnlimitedSVG/UnlimitedSVG';
import { Camera } from './components/Camera.ts';


// Stop Hot Module Reloading, it's too annoying pressing F5
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate()
  })
}
function App() {
  const inputManager = useRef(new InputManager());
  const animationFrame = useRef(0);
  const lastTime = useRef(0);
  const lastPointerPosition0 = useRef({ x: 0, y: 0 });
  const [elements, setElements] = useState<Element[]>([]);

  function update(deltaTime: number) {

    if (inputManager.current.released('P0')) {
      console.log("released from app");
    }

  }

  useEffect(() => {
    // console.log(Camera.bruh);
    Camera.bruh = "aqa";
    // inputManager.current.bindUpdate(update);

    (async () => {
      // await init();
      // if (context.current) {
      // resize();
      // window.addEventListener('resize', resize);
      // }
    })();

    return () => {
      // inputManager.current.unbindUpdate(update);
      // window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <>
      {/* <UnlimitedCanvas inputManager={inputManager} /> */}
      <UnlimitedSVG inputManager={inputManager} />

    </>
  )
}

export default App

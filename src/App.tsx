import { useEffect, useRef, useState } from 'react'
import { InputManager } from './globals/InputManager.ts';
import { Camera } from './globals/Camera.ts';
import UnlimitedCanvas from './components/UnlimitedCanvas/UnlimitedCanvas';
import UnlimitedSVG from './components/UnlimitedSVG/UnlimitedSVG';



// Stop Hot Module Reloading, it's too annoying pressing F5
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate()
  })
}

function App() {


  
  useEffect(() => {
    // binding camera update here, cuz if app is closed then data gets cleared
    InputManager.bindUpdate(Camera.update);

    return () => {
      InputManager.unbindUpdate(Camera.update);
    }
  }, [])

  return (
    <>
      {/* <UnlimitedCanvas /> */}
      <UnlimitedSVG />

    </>
  )
}

export default App

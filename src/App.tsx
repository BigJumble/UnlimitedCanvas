import { useEffect, useRef, useState } from 'react'
import { InputManager } from './globals/InputManager.ts';
import { Camera } from './globals/Camera.ts';
import UnlimitedCanvas from './components/UnlimitedCanvas/UnlimitedCanvas';
import UnlimitedSVG from './components/UnlimitedSVG/UnlimitedSVG';
import Menu from './components/Menu/Menu.tsx';
import { Options } from './globals/Options.ts';

// Stop Hot Module Reloading, it's too annoying pressing F5
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    import.meta.hot?.invalidate()
  })
}

function App() {
  const [showMenu, setShowMenu] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    // binding camera update here, cuz if app is closed then data gets cleared
    InputManager.bindUpdate(Camera.update);

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setShowMenu(true);
      Options.pauseControls = true;
      setMenuPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('contextmenu', handleContextMenu);

    return () => {
      InputManager.unbindUpdate(Camera.update);
      window.removeEventListener('contextmenu', handleContextMenu);
    }
  }, [])

  const handleCloseMenu = () => {
    Options.pauseControls = false;
    setShowMenu(false);
  };

  return (
    <>
      {/* <UnlimitedCanvas /> */}
      <UnlimitedSVG />
      {showMenu && (
        <Menu menuPosition={menuPosition} handleCloseMenu={handleCloseMenu} />
      )}
    </>
  )
}

export default App

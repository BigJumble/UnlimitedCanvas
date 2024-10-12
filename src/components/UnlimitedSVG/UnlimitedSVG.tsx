import { useEffect, useRef, useState } from 'react'
import { InputManager } from '../../globals/InputManager.ts';
import { Camera } from '../../globals/Camera.ts';
import { Options, Tool } from '../../globals/Options.ts';

if (import.meta.hot) {
    import.meta.hot.accept(() => {
      import.meta.hot?.invalidate()
    })
  }



function UnlimitedSVG() {

    const mySVGref = useRef<SVGSVGElement>(null);
    const myRectRef = useRef<SVGRectElement>(null);

    function update(deltaTime: number) {
        if (!mySVGref.current) return;
        if (!myRectRef.current) return;
        if (!Camera.changeMade) return;

        // Move canvas
        mySVGref.current.setAttribute('width', `${window.innerWidth}`);
        mySVGref.current.setAttribute('height', `${window.innerHeight}`);
        mySVGref.current.setAttribute('viewBox', `${Camera.viewBox.x} ${Camera.viewBox.y} ${Camera.viewBox.width} ${Camera.viewBox.height}`);

        // loop pattern when moving
        myRectRef.current.setAttribute('x', `${Math.round(Camera.viewBox.x / 100) * 100 - 108}`);
        myRectRef.current.setAttribute('y', `${Math.round(Camera.viewBox.y / 100) * 100 - 108}`);


        Camera.changeMade = false;

    }




    useEffect(() => {
        InputManager.bindUpdate(update);

        return () => {
            InputManager.unbindUpdate(update);
        }
    }, [])

    return (
        <svg
            ref={mySVGref}
            width={window.innerWidth}
            height={window.innerHeight}
            viewBox={`${Camera.viewBox.x} ${Camera.viewBox.y} ${Camera.viewBox.width} ${Camera.viewBox.height}`}
        >
            <defs>
                <pattern id="gridPattern" x="-7" y="-7" width="100" height="100" patternUnits="userSpaceOnUse">
                    <g id="plusPattern">
                        <rect x="0" y="0" width="100" height="100" fill="#242424"></rect>
                        <line x1="2" y1="9" x2="16" y2="9" className="dynamicPattern2 black"></line>
                        <line x1="9" y1="2" x2="9" y2="16" className="dynamicPattern2 black"></line>

                        <line x1="0" y1="7" x2="14" y2="7" className="dynamicPattern2"></line>
                        <line x1="7" y1="0" x2="7" y2="14" className="dynamicPattern2"></line>
                    </g>
                </pattern>
            </defs>

            <rect ref={myRectRef}
                x={Math.round(-window.innerWidth * 2 / 100) * 100 - 8 - 100}
                y={Math.round(-window.innerHeight * 2 / 100) * 100 - 8 - 100}
                width={Math.round(window.innerWidth * 4 / 100) * 100 + 16 + 200}
                height={Math.round(window.innerHeight * 4 / 100) * 100 + 16 + 200}
                fill="url(#gridPattern)"
            />

        </svg>
    )
}

export default UnlimitedSVG;

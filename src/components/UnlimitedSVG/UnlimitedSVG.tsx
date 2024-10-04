import { useEffect, useRef, useState } from 'react'
import { InputManagerRefType } from '../inputManager';
import { Camera } from '../Camera.ts';

function UnlimitedSVG({ inputManager }: { inputManager: InputManagerRefType }) {
    const [viewBox, setViewBox] = useState({ x: -window.innerWidth / 2, y: -window.innerHeight / 2, sizeX: window.innerWidth, sizeY: window.innerHeight, width: window.innerWidth, height: window.innerHeight });
    const position = useRef({ x: 0, y: 0, zoom: 1 });
    const lastPosition = useRef({ x: 0, y: 0 });



    function update(deltaTime: number) {
        
        if (inputManager.current.pressed('P0')) {
            lastPosition.current.x = inputManager.current.primaryPosition.x + position.current.x;
            lastPosition.current.y = inputManager.current.primaryPosition.y + position.current.y;
        }
        if (inputManager.current.has('P0')) {
            position.current.x = (lastPosition.current.x - inputManager.current.primaryPosition.x);
            position.current.y = (lastPosition.current.y - inputManager.current.primaryPosition.y);
        }


        setViewBox({
            x: -window.innerWidth / 2 + position.current.x,
            y: -window.innerHeight / 2 + position.current.y,
            sizeX: window.innerWidth * position.current.zoom,
            sizeY: window.innerHeight * position.current.zoom,

            width: window.innerWidth,
            height: window.innerHeight
        });
    }


    useEffect(() => {
        inputManager.current.bindUpdate(update);
        // window.addEventListener('resize', resize);
        return () => {
            inputManager.current.unbindUpdate(update);
            // window.removeEventListener('resize', resize);
        }
    }, [])



    return (
        <svg width={viewBox.width} height={viewBox.height} viewBox={`${viewBox.x} ${viewBox.y} ${viewBox.sizeX} ${viewBox.sizeY}`}>
            <defs>
                <pattern id="gridPattern" x="-7" y="-7" width="100" height="100" patternUnits="userSpaceOnUse">
                    <g id="plusPattern">
                        <line x1="2" y1="9" x2="16" y2="9" className="dynamicPattern2 black"></line>
                        <line x1="9" y1="2" x2="9" y2="16" className="dynamicPattern2 black"></line>

                        <line x1="0" y1="7" x2="14" y2="7" className="dynamicPattern2"></line>
                        <line x1="7" y1="0" x2="7" y2="14" className="dynamicPattern2"></line>

                    </g>
                </pattern>
            </defs>
            <rect x={-window.innerWidth} y={-window.innerHeight} width={window.innerWidth * 2} height={window.innerHeight * 2} fill="url(#gridPattern)" />


        </svg>
    )
}

export default UnlimitedSVG

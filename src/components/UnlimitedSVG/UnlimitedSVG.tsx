import { useEffect, useRef, useState } from 'react'
import { InputManager } from '../../globals/InputManager.ts';
import { Camera } from '../../globals/Camera.ts';

function UnlimitedSVG() {

    const mySVGref = useRef<SVGSVGElement>(null);

    function update() {
        if (!mySVGref.current) return;


        const viewBox = Camera.viewBox;
        mySVGref.current.setAttribute('width', `${window.innerWidth}`);
        mySVGref.current.setAttribute('height', `${window.innerHeight}`);
        mySVGref.current.setAttribute('viewBox', `${viewBox.x} ${viewBox.y} ${viewBox.width} ${viewBox.height}`);

    }


    useEffect(() => {
        InputManager.bindUpdate(update);

        return () => {
            InputManager.unbindUpdate(update);

        }
    }, [])


    return (
        <svg ref={mySVGref} width={Camera.viewBox.width} height={Camera.viewBox.height} viewBox={`${Camera.viewBox.x} ${Camera.viewBox.y} ${Camera.viewBox.width} ${Camera.viewBox.height}`}>
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

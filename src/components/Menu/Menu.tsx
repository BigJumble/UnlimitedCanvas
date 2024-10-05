import { Options, Tool } from '../../globals/Options';

function Menu({ menuPosition, handleCloseMenu }: { menuPosition: { x: number, y: number }, handleCloseMenu: () => void }) {
    const size = "40px";
    const buttonSize = 60;
    const radius = 100; // Adjust this value to change the distance from the center

    const calculatePosition = (index: number, total: number) => {
        const angle = (index / total) * 2 * Math.PI + Math.PI / 2; // Start from top (+ Math.PI / 2) and go counterclockwise
        return {
            left: Math.cos(angle) * radius - buttonSize / 2,
            top: -Math.sin(angle) * radius - buttonSize / 2 // Negative sine for counterclockwise
        };
    };

    function handleToolChange(index: number) {
        switch (index) {
            case 0:
                Options.selectedTool = Tool.DRAW;
                break;
            case 1:
                Options.selectedTool = Tool.RECENTER;
                break;
            case 2:
                Options.selectedTool = Tool.MOVE;
                break;
        }

        handleCloseMenu();
    }


    return (
        <>
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 9998,
                    backgroundColor: 'rgba(0, 0, 0, 0.3)',
                    overflow: 'hidden',
                }}
                onPointerDown={handleCloseMenu}
            />
            <div
                style={{
                    position: 'absolute',
                    top: Math.min(Math.max(menuPosition.y, radius + buttonSize / 2), window.innerHeight - buttonSize / 2),
                    left: Math.min(Math.max(menuPosition.x, radius + buttonSize / 2), window.innerWidth - buttonSize / 2),
                    zIndex: 9999,
                    overflow: 'visible',
                }}
            >
                <div className="context-menu" style={{ position: 'relative', width: 0, height: 0 }}>
                    {[
                        <path d="M240-120q-45 0-89-22t-71-58q26 0 53-20.5t27-59.5q0-50 35-85t85-35q50 0 85 35t35 85q0 66-47 113t-113 47Zm0-80q33 0 56.5-23.5T320-280q0-17-11.5-28.5T280-320q-17 0-28.5 11.5T240-280q0 23-5.5 42T220-202q5 2 10 2h10Zm230-160L360-470l358-358q11-11 27.5-11.5T774-828l54 54q12 12 12 28t-12 28L470-360Zm-190 80Z" />,
                        <path d="M440-40v-167l-44 43-56-56 140-140 140 140-56 56-44-43v167h-80ZM220-340l-56-56 43-44H40v-80h167l-43-44 56-56 140 140-140 140Zm520 0L600-480l140-140 56 56-43 44h167v80H753l43 44-56 56Zm-260-80q-25 0-42.5-17.5T420-480q0-25 17.5-42.5T480-540q25 0 42.5 17.5T540-480q0 25-17.5 42.5T480-420Zm0-180L340-740l56-56 44 43v-167h80v167l44-43 56 56-140 140Z" />,
                        <path d="M480-80 310-250l57-57 73 73v-206H235l73 72-58 58L80-480l169-169 57 57-72 72h206v-206l-73 73-57-57 170-170 170 170-57 57-73-73v206h205l-73-72 58-58 170 170-170 170-57-57 73-73H520v205l72-73 58 58L480-80Z" />
                    ].map((path, index, array) => {
                        const position = calculatePosition(index, array.length * 3);

                        return (
                            <button
                                key={index}
                                className="menu-button"
                                style={{
                                    position: 'absolute',
                                    left: position.left,
                                    top: position.top,
                                }}
                                onClick={() => handleToolChange(index)}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" height={size} viewBox="0 -960 960 960" width={size} fill="#000">
                                    {path}
                                </svg>
                            </button>
                        );
                    })}
                </div>
            </div>
        </>
    );
}

export default Menu;

import { InputManager } from "./InputManager";

export class Camera {
    static viewBox = {
        x: -window.innerWidth / 2,
        y: -window.innerHeight / 2,
        width: window.innerWidth,
        height: window.innerHeight,
    };

    static position = {
        x: 0,
        y: 0,
        zoom: 1,
    };

    static lastPosition = {
        x: 0,
        y: 0,
    };

    static #zoomSpeed = 0.01;
    static #touchStartDistance = 0;

    static changeMade = false;


    static recalculateViewBox() {
        Camera.viewBox = {
            x: (-window.innerWidth / 2 + Camera.position.x) / Camera.position.zoom,
            y: (-window.innerHeight / 2 + Camera.position.y) / Camera.position.zoom,
            width: window.innerWidth / Camera.position.zoom,
            height: window.innerHeight / Camera.position.zoom
        };
    }

    static screenToGlobalPosition(x = InputManager.primaryPosition.x, y = InputManager.primaryPosition.y) {
        return {
            x: (x / Camera.position.zoom) + Camera.viewBox.x,
            y: (y / Camera.position.zoom) + Camera.viewBox.y
        };
    }

    static #zoomCorrection(oldGlobalPosition: { x: number, y: number }): void {
        const screenPosition = Camera.screenToGlobalPosition();
        const deltaX = (oldGlobalPosition.x - screenPosition.x) * Camera.position.zoom;
        const deltaY = (oldGlobalPosition.y - screenPosition.y) * Camera.position.zoom;
        Camera.position.x += deltaX;
        Camera.position.y += deltaY;

        Camera.changeMade = true;
    }



    static handleWheel(e: WheelEvent) {
        e.preventDefault();
        const oldZoom = Camera.screenToGlobalPosition();
        if (Math.abs(e.deltaY) > 50) {
            Camera.position.zoom += e.deltaY > 0 ? -0.05 : 0.05;
        } else {
            Camera.position.zoom += e.deltaY / 300;
        }
        Camera.position.zoom = Math.max(0.25, Math.min(2, Camera.position.zoom));
        Camera.recalculateViewBox();
        Camera.#zoomCorrection(oldZoom);
        Camera.recalculateViewBox();
        Camera.changeMade = true;
    }

    static update(deltaTime: number) {
        if (InputManager.pressed('P0')) {
            Camera.lastPosition.x = InputManager.primaryPosition.x;
            Camera.lastPosition.y = InputManager.primaryPosition.y ;
        }

        if (InputManager.pressed('P1')) {
            Camera.#touchStartDistance = Math.hypot(
                InputManager.primaryPosition.x - InputManager.secondaryPosition.x,
                InputManager.primaryPosition.y - InputManager.secondaryPosition.y
            );
        }

        //BAD
                            if (InputManager.has('P1')) {
                                const currentDistance = Math.hypot(
                                    InputManager.primaryPosition.x - InputManager.secondaryPosition.x,
                                    InputManager.primaryPosition.y - InputManager.secondaryPosition.y
                                );
                                if (Camera.#touchStartDistance > 0) {
                                    const oldZoom = Camera.position.zoom;
                                    const zoomDelta = currentDistance - Camera.#touchStartDistance;
                                    Camera.position.zoom *= 1 + zoomDelta * 0.005;
                                    Camera.position.zoom = Math.max(0.25, Math.min(2, Camera.position.zoom));

                                    // Apply zoom correction
                                    const centerX = (InputManager.primaryPosition.x + InputManager.secondaryPosition.x) / 2;
                                    const centerY = (InputManager.primaryPosition.y + InputManager.secondaryPosition.y) / 2;
                                    const oldGlobalPosition = Camera.screenToGlobalPosition(centerX, centerY);
                                    Camera.recalculateViewBox();
                                    const newGlobalPosition = Camera.screenToGlobalPosition(centerX, centerY);

                                    const deltaX = (oldGlobalPosition.x - newGlobalPosition.x) * Camera.position.zoom;
                                    const deltaY = (oldGlobalPosition.y - newGlobalPosition.y) * Camera.position.zoom;
                                    Camera.position.x += deltaX;
                                    Camera.position.y += deltaY;

                                    Camera.changeMade = true;
                                }
                                Camera.#touchStartDistance = currentDistance;
                            }

        if (InputManager.has('P0')) {
            const deltaX = Camera.lastPosition.x - InputManager.primaryPosition.x;
            const deltaY = Camera.lastPosition.y - InputManager.primaryPosition.y;
            Camera.position.x += deltaX;
            Camera.position.y += deltaY;

            Camera.lastPosition.x = InputManager.primaryPosition.x;
            Camera.lastPosition.y = InputManager.primaryPosition.y;

            Camera.changeMade = true;
        }

        if (Camera.changeMade) {
            Camera.recalculateViewBox();
        }
    }


}
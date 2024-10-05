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
        x1: 0,
        y1: 0,
    };

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
        console.log(Camera.screenToGlobalPosition(), InputManager.primaryPosition);
        if (InputManager.pressed('P0')) {

            Camera.lastPosition.x = InputManager.primaryPosition.x;
            Camera.lastPosition.y = InputManager.primaryPosition.y;
        }

        if (InputManager.pressed('P1')) {
            Camera.lastPosition.x1 = InputManager.secondaryPosition.x;
            Camera.lastPosition.y1 = InputManager.secondaryPosition.y;
        }


        if (InputManager.has('P1')) {
            

            const globalOldPosition0 = Camera.screenToGlobalPosition(Camera.lastPosition.x, Camera.lastPosition.y);
            const globalOldPosition1 = Camera.screenToGlobalPosition(Camera.lastPosition.x1, Camera.lastPosition.y1);

            const globalNewPosition0 = Camera.screenToGlobalPosition(InputManager.primaryPosition.x, InputManager.primaryPosition.y);
            const globalNewPosition1 = Camera.screenToGlobalPosition(InputManager.secondaryPosition.x, InputManager.secondaryPosition.y);

            //distance between the two points
            const distance = Math.hypot(
                globalNewPosition0.x - globalNewPosition1.x,
                globalNewPosition0.y - globalNewPosition1.y
            );

            const oldDistance = Math.hypot(
                globalOldPosition0.x - globalOldPosition1.x,
                globalOldPosition0.y - globalOldPosition1.y
            );

            const distanceStrech = distance - oldDistance;

            // Calculate zoom based on distanceStrech
            const zoomFactor = 1 + distanceStrech / oldDistance;
            const newZoom = Camera.position.zoom * zoomFactor;

            Camera.position.zoom = Math.max(0.25, Math.min(2, newZoom));

            Camera.recalculateViewBox();
            Camera.#zoomCorrection(globalOldPosition0);

            Camera.lastPosition.x = InputManager.primaryPosition.x;
            Camera.lastPosition.y = InputManager.primaryPosition.y;
            Camera.lastPosition.x1 = InputManager.secondaryPosition.x;
            Camera.lastPosition.y1 = InputManager.secondaryPosition.y;

            Camera.changeMade = true;

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
import { Camera } from "./Camera";

export class InputManager {
    static #inputKeys = new Set<string>();
    static #inputKeysOnce = new Set<string>();
    static #inputKeysReleased = new Set<string>();
    static #animationFrame: number | null = null;
    static #lastTime = performance.now();
    static primaryPosition = { x: 0, y: 0 };

    static pressure = 0;
    static secondaryPosition = { x: 0, y: 0 };
    static #updateCallbacks = new Set<(deltaTime: number) => void>();

    static primaryTouchId: number | null = null;
    static secondaryTouchId: number | null = null;

    static #update = (timestamp: number) => {
        const deltaTime = timestamp - InputManager.#lastTime;
        InputManager.#lastTime = timestamp;

        for (const callback of InputManager.#updateCallbacks) {
            callback(deltaTime);
        }

        InputManager.#clear();
        InputManager.#animationFrame = requestAnimationFrame(InputManager.#update);
    }

    static #clear(): void {
        InputManager.#inputKeysReleased.clear();
        InputManager.#inputKeysOnce.clear();
    }

    static bindUpdate(callback: (deltaTime: number) => void): void {
        InputManager.#updateCallbacks.add(callback);

        if (InputManager.#updateCallbacks.size === 1) {
            InputManager.#lastTime = performance.now();
            InputManager.#initEventListeners();
            InputManager.#animationFrame = requestAnimationFrame(InputManager.#update);
        }
    }

    static unbindUpdate(callback: (deltaTime: number) => void): void {
        InputManager.#updateCallbacks.delete(callback);

        if (InputManager.#updateCallbacks.size === 0) {
            cancelAnimationFrame(InputManager.#animationFrame!);
            InputManager.#removeEventListeners();
            InputManager.#animationFrame = null;
        }
    }

    static has(key: string): boolean {
        return InputManager.#inputKeys.has(key);
    }

    static pressed(key: string): boolean {
        return InputManager.#inputKeysOnce.has(key);
    }

    static released(key: string): boolean {
        return InputManager.#inputKeysReleased.has(key);
    }

    static #handlePointerMove = (e: PointerEvent): void => {

        if (e.pointerId !== InputManager.secondaryTouchId) {
            InputManager.primaryPosition = { x: e.clientX, y: e.clientY };
            InputManager.pressure = e.pressure;
        } else {
            InputManager.secondaryPosition = { x: e.clientX, y: e.clientY };
        }
    }

    static #handlePointerPress = (e: PointerEvent): void => {
        if (InputManager.primaryTouchId === null) {
            InputManager.#inputKeys.add('P0');
            InputManager.#inputKeysOnce.add('P0');
            InputManager.primaryPosition = { x: e.clientX, y: e.clientY };
            InputManager.pressure = e.pressure;
            InputManager.primaryTouchId = e.pointerId;
        } else {
            InputManager.#inputKeys.add('P1');
            InputManager.#inputKeysOnce.add('P1');
            InputManager.secondaryPosition = { x: e.clientX, y: e.clientY };
            InputManager.secondaryTouchId = e.pointerId;
        }
    }

    static #handlePointerRelease = (e: PointerEvent): void => {

        if (e.pointerId === InputManager.primaryTouchId) {
            InputManager.#inputKeys.delete('P0');
            InputManager.#inputKeysReleased.add('P0');
            InputManager.primaryPosition = { x: e.clientX, y: e.clientY };
            InputManager.pressure = 0;
            InputManager.primaryTouchId = null;

            if (InputManager.secondaryTouchId !== null) {
                InputManager.#inputKeys.delete('P1');
                InputManager.#inputKeysReleased.add('P1');
                InputManager.#inputKeys.add('P0');
                InputManager.#inputKeysOnce.add('P0');
                InputManager.#inputKeysReleased.delete('P0');
                InputManager.primaryPosition = InputManager.secondaryPosition;
                InputManager.secondaryPosition = { x: 0, y: 0 };
                InputManager.primaryTouchId = InputManager.secondaryTouchId;
                InputManager.secondaryTouchId = null;
            }

        } else {
            InputManager.#inputKeys.delete('P1');
            InputManager.#inputKeysReleased.add('P1');
            InputManager.secondaryPosition = { x: e.clientX, y: e.clientY };
            InputManager.secondaryTouchId = null;
        }
    }

    static #handlePointerCancel = (e: PointerEvent): void => {
        if (e.pointerId === InputManager.primaryTouchId) {
            InputManager.#inputKeys.delete('P0');
            InputManager.#inputKeysReleased.add('P0');
            InputManager.primaryTouchId = null;
        } else {
            InputManager.#inputKeys.delete('P1');
            InputManager.#inputKeysReleased.add('P1');
            InputManager.secondaryTouchId = null;
        }
    }

    static #keydown = (e: KeyboardEvent): void => {
        InputManager.#inputKeys.add(e.code);
        InputManager.#inputKeysOnce.add(e.code);
    }

    static #keyup = (e: KeyboardEvent): void => {
        InputManager.#inputKeys.delete(e.code);
        InputManager.#inputKeysReleased.add(e.code);
    }

    static getTouchId(isPrimary: boolean = true): number | null {
        return isPrimary ? InputManager.primaryTouchId : InputManager.secondaryTouchId;
    }

    static #initEventListeners(): void {
        window.addEventListener('pointermove', InputManager.#handlePointerMove);
        window.addEventListener('pointerdown', InputManager.#handlePointerPress);
        window.addEventListener('pointerup', InputManager.#handlePointerRelease);
        window.addEventListener('pointercancel', InputManager.#handlePointerCancel);
        window.addEventListener('keydown', InputManager.#keydown);
        window.addEventListener('keyup', InputManager.#keyup);
        window.addEventListener('wheel', Camera.handleWheel, { passive: false });
    }

    static #removeEventListeners(): void {
        window.removeEventListener('pointermove', InputManager.#handlePointerMove);
        window.removeEventListener('pointerdown', InputManager.#handlePointerPress);
        window.removeEventListener('pointerup', InputManager.#handlePointerRelease);
        window.removeEventListener('pointercancel', InputManager.#handlePointerCancel);
        window.removeEventListener('keydown', InputManager.#keydown);
        window.removeEventListener('keyup', InputManager.#keyup);
        window.removeEventListener('wheel', Camera.handleWheel);
    }

    static {

    }
}

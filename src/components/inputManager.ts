export class InputManager {
    private inputKeys: Set<string>;
    private inputKeysOnce: Set<string>;
    private inputKeysReleased: Set<string>;
    private animationFrame: number | null = null;
    private lastTime: number;
    public primaryPosition: { x: number; y: number };

    public pressure: number;
    public secondaryPosition: { x: number; y: number };
    private updateCallbacks: Array<(deltaTime: number) => void>;

    constructor() {
        this.inputKeys = new Set<string>();
        this.inputKeysOnce = new Set<string>();
        this.inputKeysReleased = new Set<string>();
        this.primaryPosition = { x: 0, y: 0 };

        this.pressure = 0;
        this.secondaryPosition = { x: 0, y: 0 };
        this.updateCallbacks = [];

        this.initEventListeners();
        this.lastTime = performance.now();
    }

    private update = (timestamp: number) => {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        // Call all registered update callbacks
        for (const callback of this.updateCallbacks) {
            callback(deltaTime);
        }

        this.clear();
        this.animationFrame = requestAnimationFrame(this.update);
    }

    private clear(): void {
        this.inputKeysReleased.clear();
        this.inputKeysOnce.clear();
    }

    public bindUpdate(callback: (deltaTime: number) => void): void {
        this.updateCallbacks.push(callback);

        if(this.updateCallbacks.length === 1) {
            this.animationFrame = requestAnimationFrame(this.update);
        }
    }

    public unbindUpdate(callback: (deltaTime: number) => void): void {
        const index = this.updateCallbacks.indexOf(callback);

        if (index !== -1) {
            this.updateCallbacks.splice(index, 1);
        }
        if(this.updateCallbacks.length === 0) {
            cancelAnimationFrame(this.animationFrame!);
            this.animationFrame = null;
        }
    }

    public has(key: string): boolean {
        return this.inputKeys.has(key);
    }

    public pressed(key: string): boolean {
        return this.inputKeysOnce.has(key);
    }

    public released(key: string): boolean {
        return this.inputKeysReleased.has(key);
    }



    private handlePointerMove = (e: PointerEvent): void => {
        if (e.isPrimary) {
            this.primaryPosition = { x: e.clientX, y: e.clientY };
            this.pressure = e.pressure;
        } else {
            this.secondaryPosition = { x: e.clientX, y: e.clientY };
        }
    }

    private handlePointerPress = (e: PointerEvent): void => {
        if (e.isPrimary) {
            this.inputKeys.add('P0');
            this.inputKeysOnce.add('P0');
            this.primaryPosition = { x: e.clientX, y: e.clientY };
            this.pressure = e.pressure;
        } else {
            this.inputKeys.add('P1');
            this.inputKeysOnce.add('P1');
            this.secondaryPosition = { x: e.clientX, y: e.clientY };
        }

    }

    private handlePointerRelease = (e: PointerEvent): void => {
        if (e.isPrimary) {
            this.inputKeys.delete('P0');
            this.inputKeysReleased.add('P0');
            this.primaryPosition = { x: e.clientX, y: e.clientY };
            this.pressure = 0;
        } else {
            this.inputKeys.delete('P1');
            this.inputKeysReleased.add('P1');
            this.secondaryPosition = { x: e.clientX, y: e.clientY };
        }
    }

    private handlePointerCancel = (e: PointerEvent): void => {
        if (e.isPrimary) {
            this.inputKeys.delete('P0');
            this.inputKeysReleased.add('P0');

        } else {
            this.inputKeys.delete('P1');
            this.inputKeysReleased.add('P1');
        }
    }

    private keydown = (e: KeyboardEvent): void => {
        this.inputKeys.add(e.code);
        this.inputKeysOnce.add(e.code);
    }

    private keyup = (e: KeyboardEvent): void => {
        this.inputKeys.delete(e.code);
        this.inputKeysReleased.add(e.code);
    }


    private initEventListeners(): void {
        window.addEventListener('pointermove', this.handlePointerMove);
        window.addEventListener('pointerdown', this.handlePointerPress);
        window.addEventListener('pointerup', this.handlePointerRelease);
        window.addEventListener('pointercancel', this.handlePointerCancel);
        window.addEventListener('keydown', this.keydown);
        window.addEventListener('keyup', this.keyup);
    }

    public removeEventListeners(): void {
        window.removeEventListener('pointermove', this.handlePointerMove);
        window.removeEventListener('pointerdown', this.handlePointerPress);
        window.removeEventListener('pointerup', this.handlePointerRelease);
        window.removeEventListener('pointercancel', this.handlePointerCancel);
        window.removeEventListener('keydown', this.keydown);
        window.removeEventListener('keyup', this.keyup);
    }
}
export type InputManagerRefType = React.RefObject<InputManager> & { current: InputManager };

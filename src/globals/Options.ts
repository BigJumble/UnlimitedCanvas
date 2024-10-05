export enum Tool {
    DRAW,
    MOVE,
    RECENTER,
    NONE

}

export class Options {
    static pauseControls = false;
    static selectedTool = Tool.MOVE;

}
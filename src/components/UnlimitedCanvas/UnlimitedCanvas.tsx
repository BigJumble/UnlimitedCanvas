/// <reference types="@webgpu/types" />
import { useEffect, useRef, useState } from 'react';
import { initWebGPU } from './initWebGPU';
import { InputManager } from '../../globals/InputManager';
import { Options, Tool } from '../../globals/Options';
import { Camera } from '../../globals/Camera';
import { createLineShader } from './shaders/line';

type dot = { position: [number, number], color: [number, number, number, number], size: number };

class DrawManager {
    static strokes: { points: dot[] }[] = [];
    static currentStroke: dot[] = [];

    static handleDrawStart() {
        DrawManager.currentStroke = [];
    }

    static handleDraw() {
        if (Options.selectedTool !== Tool.DRAW) return;
        if (Options.pauseControls) return;
        if (!InputManager.has('P0')) return;

        const currentPoint = Camera.screenToGlobalPosition();
        const color: [number, number, number, number] = [1, 1, 1, 1];

        const addDot = ()=>{
            DrawManager.currentStroke.push({ position: [currentPoint.x, currentPoint.y], color, size: InputManager.pressure * 10 });
            CanvasManager.updateCurrentStrokeBuffer(DrawManager.currentStroke);
        }

        if (DrawManager.currentStroke.length > 0) {
            const lastPoint = DrawManager.currentStroke[DrawManager.currentStroke.length - 1];
            const distance = Math.sqrt(Math.pow(lastPoint.position[0] - currentPoint.x, 2) + Math.pow(lastPoint.position[1] - currentPoint.y, 2));
            if (distance > 2) {
                addDot();
            }
        } else {
            addDot();
        }
    }

    static handleDrawEnd() {
        if (DrawManager.currentStroke.length > 0) {
            DrawManager.strokes.push({ points: DrawManager.currentStroke });
            DrawManager.currentStroke = [];
            CanvasManager.updateStrokeBuffers();
            CanvasManager.currentStrokeBufferSize=0;
            // console.log(DrawManager.strokes);
        }
    }

    static update(deltaTime: number) {
        CanvasManager.render();
    }
}

class CanvasManager {
    static canvasRef: React.RefObject<HTMLCanvasElement> | null = null;
    static dimensions: { width: number, height: number } = { width: window.innerWidth, height: window.innerHeight };

    static device: GPUDevice | null = null;
    static context: GPUCanvasContext | null = null;
    static presentationFormat: GPUTextureFormat | null = null;

    static lineShaderModule: GPUShaderModule | null = null;
    static strokeBuffers: GPUBuffer[] = [];

    static linePipeline: GPURenderPipeline | null = null;
    static lineBindGroups: GPUBindGroup[] = [];

    static currentStrokeBuffer: GPUBuffer | null = null;
    static currentStrokeBindGroup: GPUBindGroup | null = null;
    static currentStrokeBufferSize: number = 0;

    static cameraUniformBuffer: GPUBuffer | null = null;
    static cameraBindGroup: GPUBindGroup | null = null;

    static topology: GPUPrimitiveTopology = "triangle-strip";
    static verteciesPerDot = 2; // auto

    static bindGroup1Layout: GPUBindGroupLayout | null = null;


    static async init() {
        if (!this.canvasRef) {
            console.error('Canvas reference is not set');
            return;
        }
        const webGPUState = await initWebGPU(this.canvasRef);
        if (!webGPUState) {
            return;
        }
        this.device = webGPUState.device;
        this.context = webGPUState.context;
        this.presentationFormat = webGPUState.presentationFormat;
        this.lineShaderModule = createLineShader(this.device);
        this.createLinePipeline();
        this.createCameraUniformBuffer();
        this.createCurrentStrokeBuffer();
    }

    static createLinePipeline() {
        if (!this.device || !this.lineShaderModule || !this.presentationFormat) return;

        const cameraBindGroupLayout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'uniform' }
                }
            ]
        });

        this.bindGroup1Layout = this.device.createBindGroupLayout({
            entries: [
                {
                    binding: 0,
                    visibility: GPUShaderStage.VERTEX,
                    buffer: { type: 'read-only-storage' }
                }
            ]
        });

        const pipelineLayout = this.device.createPipelineLayout({
            bindGroupLayouts: [cameraBindGroupLayout, this.bindGroup1Layout]
        });

        this.linePipeline = this.device.createRenderPipeline({
            layout: pipelineLayout,
            vertex: {
                module: this.lineShaderModule,
                entryPoint: 'vertexMain',
            },
            fragment: {
                module: this.lineShaderModule,
                entryPoint: 'fragmentMain',
                targets: [{
                    format: this.presentationFormat!,
                    blend: {
                        color: {
                            srcFactor: "src-alpha",
                            dstFactor: "one-minus-src-alpha",
                        },
                        alpha: {
                            srcFactor: "one",
                            dstFactor: "one-minus-src-alpha",
                        },
                    },
                }],
            },
            primitive: {
                topology: this.topology,
            }
        });
    }

    static createCameraUniformBuffer() {
        if (!this.device) return;

        this.cameraUniformBuffer = this.device.createBuffer({
            label: 'Camera Uniform Buffer',
            size: 64, // 2 vec2f (screenSize and viewBox.xy) + 1 vec2f (viewBox.zw) + 2 vec2f (padding)
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });

        this.cameraBindGroup = this.device.createBindGroup({
            layout: this.linePipeline!.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: this.cameraUniformBuffer } }
            ]
        });
    }

    static updateStrokeBuffers() {
        if (!this.device) return;

        const newStroke = DrawManager.strokes[DrawManager.strokes.length - 1];
        const data = new Float32Array(newStroke.points.flatMap(p => [...p.position, p.size, 0, ...p.color]));
        // console.log(data,data.byteLength)
        const strokeBuffer = this.device.createBuffer({
            size: Math.max(data.byteLength),
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST ,
        });

        this.device.queue.writeBuffer(strokeBuffer, 0, data);
        
        const strokeBindGroup = this.device.createBindGroup({
            layout: this.linePipeline!.getBindGroupLayout(1),
            entries: [
                { binding: 0, resource: { buffer: strokeBuffer } }
            ]
        });

        this.strokeBuffers.push(strokeBuffer);
        this.lineBindGroups.push(strokeBindGroup);
    }

    static createCurrentStrokeBuffer()
    {
        if (!this.device) return;

        
        this.currentStrokeBuffer = this.device.createBuffer({
            size: 32 * 16384,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST,
        });

        this.currentStrokeBindGroup = this.device.createBindGroup({
            layout: this.bindGroup1Layout!,
            entries: [
                { binding: 0, resource: { buffer: this.currentStrokeBuffer } }
            ]
        });


    }
    static updateCurrentStrokeBuffer(stroke:dot[])
    {
        if (!this.device || !this.currentStrokeBuffer) return;
        this.currentStrokeBufferSize = stroke.length;
        if(stroke.length >= 16384 || stroke.length === 0) return;

        const lastDot = stroke[stroke.length - 1];
        const data = new Float32Array([...lastDot.position, lastDot.size, 0, ...lastDot.color]);
        this.device.queue.writeBuffer(this.currentStrokeBuffer, (this.currentStrokeBufferSize - 1) * data.byteLength, data);
    }

    static updateCameraUniformBuffer(elements:number) {
        if (!this.device || !this.cameraUniformBuffer) return;
        const cameraData = new Float32Array([
            window.innerWidth, window.innerHeight,
            Camera.position.x, -Camera.position.y,
            Camera.position.zoom,
            elements
        ]);

        this.device.queue.writeBuffer(this.cameraUniformBuffer, 0, cameraData);
    }

    static render() {
        if (!this.device || !this.context || !this.linePipeline) return;

        this.updateCameraUniformBuffer(this.currentStrokeBufferSize);

        const commandEncoder = this.device.createCommandEncoder();
        const textureView = this.context.getCurrentTexture().createView();

        const renderPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: textureView,
                clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 0.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }]
        });

        renderPass.setPipeline(this.linePipeline);
        renderPass.setBindGroup(0, this.cameraBindGroup!);

        for (let i = 0; i < this.lineBindGroups.length; i++) {
            if(DrawManager.strokes[i].points.length <= 1) continue;
            renderPass.setBindGroup(1, this.lineBindGroups[i]);
            renderPass.draw(DrawManager.strokes[i].points.length * this.verteciesPerDot, 1, 0, 0);
        }

        if(this.currentStrokeBufferSize > 1)
        {
            renderPass.setBindGroup(1, this.currentStrokeBindGroup);
            renderPass.draw(this.currentStrokeBufferSize * this.verteciesPerDot, 1, 0, 0);
        }

        renderPass.end();

        this.device.queue.submit([commandEncoder.finish()]);
    }
}

function UnlimitedCanvas() {
    CanvasManager.canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        (async () => {
            await CanvasManager.init();
            window.addEventListener('pointerdown', DrawManager.handleDrawStart);
            window.addEventListener('pointermove', DrawManager.handleDraw);
            window.addEventListener('pointerup', DrawManager.handleDrawEnd);
            InputManager.bindUpdate(DrawManager.update);
        })();

        return () => {
            InputManager.unbindUpdate(DrawManager.update);
            window.removeEventListener('pointerdown', DrawManager.handleDrawStart);
            window.removeEventListener('pointermove', DrawManager.handleDraw);
            window.removeEventListener('pointerup', DrawManager.handleDrawEnd);
        }
    }, [])

    return (
        <>
            <canvas id="unlimited-canvas" ref={CanvasManager.canvasRef}
                width={window.innerWidth}
                height={window.innerHeight}></canvas>
        </>
    );
};

export default UnlimitedCanvas;
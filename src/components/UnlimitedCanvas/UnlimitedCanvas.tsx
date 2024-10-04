/// <reference types="@webgpu/types" />
import { useEffect, useRef } from 'react';
import { initWebGPU } from './initWebGPU';
import { InputManagerRefType } from '../inputManager';


function UnlimitedCanvas({ inputManager }: { inputManager: InputManagerRefType }) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const dimensions = useRef({ width: window.innerWidth, height: window.innerHeight });


    const device = useRef<GPUDevice | null>(null);
    const context = useRef<GPUCanvasContext | null>(null);
    const presentationFormat = useRef<GPUTextureFormat | null>(null);

    // const blobShaderModule = useRef<GPUShaderModule | null>(null);
    // const particleLifeShaderModule = useRef<GPUShaderModule | null>(null);

    // const uniformBuffer = useRef<GPUBuffer | null>(null);
    // const particleBuffer = useRef<GPUBuffer | null>(null);
    // const colorBuffer = useRef<GPUBuffer | null>(null);
    // const colorTableBuffer = useRef<GPUBuffer | null>(null);
    // const forceTableBuffer = useRef<GPUBuffer | null>(null);
    // const particleTexture = useRef<GPUTexture | null>(null);
    // const particleTextureView = useRef<GPUTextureView | null>(null);

    // const renderPipeline = useRef<GPURenderPipeline | null>(null);
    // const blobPipeline = useRef<GPURenderPipeline | null>(null);
    // const particleLifePipeline = useRef<GPUComputePipeline | null>(null);

    // const renderBindGroupLayout = useRef<GPUBindGroupLayout | null>(null);
    // const computeBindGroupLayout = useRef<GPUBindGroupLayout | null>(null);
    // const blobBindGroupLayout = useRef<GPUBindGroupLayout | null>(null);

    // const renderBindGroup = useRef<GPUBindGroup | null>(null);
    // const computeBindGroup = useRef<GPUBindGroup | null>(null);
    // const blobBindGroup = useRef<GPUBindGroup | null>(null);

    // const animationFrame = useRef(0);
    // const lastTime = useRef(0);

    function update(deltaTime: number) {
        if (inputManager.current.pressed('P0')) {
            console.log('P0 d1', deltaTime);
        }
    }

    async function init() {
        const webGPUState = await initWebGPU(canvasRef);
        if (!webGPUState) {
            return;
        }
        device.current = webGPUState.device;
        context.current = webGPUState.context;
        presentationFormat.current = webGPUState.presentationFormat;
        // blobShaderModule.current = createBlobShader(device.current);
        // particleLifeShaderModule.current = createParticleLifeShader(device.current);

        // // Create buffers
        // const buffers = initBuffers(device.current, dimensions.current);
        // uniformBuffer.current = buffers.uniformBuffer;
        // updateUniforms();
        // particleBuffer.current = buffers.particleBuffer;
        // colorTableBuffer.current = buffers.colorTableBuffer;
        // colorBuffer.current = buffers.colorBuffer;
        // forceTableBuffer.current = buffers.forceTableBuffer;

    }

    useEffect(() => {     
        inputManager.current.bindUpdate(update);

        (async () => {
            // await init();
            // if (context.current) {
            //     animationFrame.current = requestAnimationFrame(update);
            //     resize();
            //     window.addEventListener('resize', resize);
            // }

        })();

        return () => {
            inputManager.current.unbindUpdate(update);
        }

    }, []);

    return (
        <canvas id="unlimited-canvas" ref={canvasRef} width="1000" height="1000"></canvas>
    );
};

export default UnlimitedCanvas;



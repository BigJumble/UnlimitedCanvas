/// <reference types="@webgpu/types" />

export function createLineShader(device: GPUDevice) {
    return device.createShaderModule({
        label: "lineShader",
        code: /* wgsl */`
        
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    @location(0) texCoord: vec2<f32>,
    @location(1) color: vec4<f32>,
}

struct Dot {
    position: vec4f, // because of alignment issues xy - position, z - size, w - padding
    color: vec4f,

};

struct Camera {
    screenSize: vec2<f32>,
    position: vec2<f32>,
    zoom: f32,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<storage, read> inputDots: array<Dot>;


fn worldToScreen(worldPos: vec2f) -> vec2f {
    let normalizedPos = (worldPos  - camera.position/ camera.zoom) / (camera.screenSize / camera.zoom);
    return normalizedPos*2;
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    let instanceIndex = vertexIndex / 3u;
    var particle = inputDots[instanceIndex];
    particle.position.y = -particle.position.y;
    let center = particle.position.xy;
    
    // Define a single equilateral triangle that fits a circle of radius 1
    let triangleVertices = array<vec2<f32>, 3>(
        vec2<f32>(0.0, 2.0),
        vec2<f32>(-1.732, -1.0),
        vec2<f32>(1.732, -1.0)
    );
    
    let vertexOffset = triangleVertices[vertexIndex % 3u] * particle.position.z;
    let worldPos = center + vertexOffset;
    let ndcPos = worldToScreen(worldPos);
    
    var output: VertexOutput;
    output.position = vec4<f32>(ndcPos, 0.0, 1.0);
    output.texCoord = triangleVertices[vertexIndex % 3u] * 0.5 + 0.5;
    output.color = particle.color;
    
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
    let diff = input.texCoord - vec2<f32>(0.5, 0.5);
    let distSquared = dot(diff, diff);
    
    if (distSquared > 0.25) {
        discard;
    }
    
    let pixelWidth = 0.1; //0.8 / camera.pointSize;
    let innerRadius = 0.5 - pixelWidth;
    let innerRadiusSquared = innerRadius * innerRadius;

    let alpha = 1.0 - smoothstep(innerRadiusSquared, 0.25, distSquared);
    
    return vec4f( input.color.xyz,alpha);
}

// @vertex
// fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
//     var output: VertexOutput;
    
//     // Calculate the dot index and whether this is a left or right vertex
//     let dotIndex = vertexIndex;
//     let isRight = vertexIndex % 2 == 1;
    
//     // Get current dot
//     let currentDot = inputDots[dotIndex];
    
//     // // Calculate direction vector
//     var direction: vec2f;
//     // if (dotIndex == 0) {
//     //     // First dot: use direction to next dot
//     //     direction = normalize(inputDots[1].position - currentDot.position);
//     // } else if (dotIndex == arrayLength(&inputDots) - 1) {
//     //     // Last dot: use direction from previous dot
//     //     direction = normalize(currentDot.position - inputDots[dotIndex - 1].position);
//     // } else {
//     //     // Middle dots: average direction from previous to next
//     //     direction = normalize(inputDots[dotIndex + 1].position - inputDots[dotIndex - 1].position);
//     // }

//     // direction = normalize(inputDots[dotIndex - 1].position - inputDots[dotIndex + 1].position);
    
//     // Rotate direction 90 degrees
//     let perpendicular = vec2f(-direction.y, direction.x);
    
//     // Calculate offset based on dot size
//     let offset = perpendicular * currentDot.size * 0.5;
    
//     // Set position
//     let finalPosition = currentDot.position + (select(-offset, offset, isRight));
//     // let screenPos = worldToScreen(currentDot.position );
//     let screenPos = currentDot.position/camera.viewBox;

//     output.position = vec4f(screenPos*2.0, 0.0, 1.0);
    
//     output.color = currentDot.color;
//     return output;
// }

// @fragment
// fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {

//     return input.color;
// }

`

    });
}
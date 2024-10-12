/// <reference types="@webgpu/types" />

export function createLineShader(device: GPUDevice) {
    return device.createShaderModule({
        label: "lineShader",
        code: /* wgsl */`
        
struct VertexOutput {
    @builtin(position) position: vec4<f32>,
    // @location(0) texCoord: vec2<f32>,
    @location(0) color: vec4<f32>,
}

struct Dot {
    position: vec4f, // because of alignment issues xy - position, z - size, w - padding
    color: vec4f,

};

struct Camera {
    screenSize: vec2<f32>,
    position: vec2<f32>,
    zoom: f32,
    dotsC: f32,
}

@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var<storage, read> inputDots: array<Dot>;


fn worldToScreen(worldPos: vec2f) -> vec2f {
    let normalizedPos = (worldPos  - camera.position/ camera.zoom) / (camera.screenSize / camera.zoom);
    return normalizedPos*2;
}

// @vertex
// fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
//     let instanceIndex = vertexIndex / 3u;
//     var particle = inputDots[instanceIndex];
//     particle.position.y = -particle.position.y;
//     let center = particle.position.xy;
    
//     // Define a single equilateral triangle that fits a circle of radius 1
//     let triangleVertices = array<vec2<f32>, 3>(
//         vec2<f32>(0.0, 2.0),
//         vec2<f32>(-1.732, -1.0),
//         vec2<f32>(1.732, -1.0)
//     );
    
//     let vertexOffset = triangleVertices[vertexIndex % 3u] * particle.position.z;
//     let worldPos = center + vertexOffset;
//     let ndcPos = worldToScreen(worldPos);
    
//     var output: VertexOutput;
//     output.position = vec4<f32>(ndcPos, 0.0, 1.0);
//     output.texCoord = triangleVertices[vertexIndex % 3u] * 0.5 + 0.5;
//     output.color = particle.color;
    
//     return output;
// }

// @fragment
// fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
//     let diff = input.texCoord - vec2<f32>(0.5, 0.5);
//     let distSquared = dot(diff, diff);
    
//     if (distSquared > 0.25) {
//         discard;
//     }
    
//     let pixelWidth = 0.1; //0.8 / camera.pointSize;
//     let innerRadius = 0.5 - pixelWidth;
//     let innerRadiusSquared = innerRadius * innerRadius;

//     let alpha = 1.0 - smoothstep(innerRadiusSquared, 0.25, distSquared);
    
//     return vec4f( input.color.xyz,alpha);
// }

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
    var output: VertexOutput;
    
    // Calculate the dot index and whether this is a left or right vertex
    let dotIndex = vertexIndex / 2u;
    let isRight = vertexIndex % 2u == 1u;
    
    // Get current dot
    var currentDot = inputDots[dotIndex];
    currentDot.position.y = -currentDot.position.y;
    
    // // Calculate direction vector
    var direction: vec2f;
    if (dotIndex == 0u) {
        // First dot: use direction to next dot
        let dot1 = vec2f(inputDots[1].position.x,-inputDots[1].position.y);
        direction = normalize(dot1 - currentDot.position.xy );
    } else if (select(dotIndex == arrayLength(&inputDots) - 1, dotIndex == u32(camera.dotsC) - 1, arrayLength(&inputDots)==16384) ) {
        // Last dot: use direction from previous dot
        let dot1 = vec2f(inputDots[dotIndex - 1u].position.x, -inputDots[dotIndex - 1u].position.y);
        direction = normalize(currentDot.position.xy - dot1);
    } else {
        let dot1 = vec2f(inputDots[dotIndex + 1u].position.x, -inputDots[dotIndex + 1u].position.y);
        let dot2 = vec2f(inputDots[dotIndex - 1u].position.x, -inputDots[dotIndex - 1u].position.y);
        // Middle dots: average direction from previous to next
        direction = normalize(dot1 - dot2);
    }
    
    // Rotate direction 90 degrees
    let perpendicular = vec2f(-direction.y, direction.x);
    
    // Calculate offset based on dot size
    let offset = perpendicular * currentDot.position.z;
    
    // Set position
    let finalPosition = currentDot.position.xy + select(-offset, offset, isRight);
    let screenPos = worldToScreen(finalPosition );
    // let screenPos = currentDot.position/camera.viewBox;

    output.position = vec4f(screenPos, 0.0, 1.0);
    
    output.color = currentDot.color;
    return output;
}

@fragment
fn fragmentMain(input: VertexOutput) -> @location(0) vec4f {

    return input.color;
}

`

    });
}
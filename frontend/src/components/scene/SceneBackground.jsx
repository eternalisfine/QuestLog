import { ShaderGradientCanvas, ShaderGradient } from '@shadergradient/react'

export default function SceneBackground() {
    return (
        <ShaderGradientCanvas
            style={{
                position: 'fixed',
                top: 0, left: 0,
                width: '100vw', height: '100vh',
                zIndex: 0,
                pointerEvents: 'none',
            }}
            pixelDensity={1}
            fov={45}
        >
            <ShaderGradient
                type="waterPlane"
                animate="on"
                uSpeed={0.08}
                cDistance={3.6}
                cPolarAngle={115}
                cAzimuthAngle={180}
                color1="#050010"
                color2="#0a1628"
                color3="#160830"
                uDensity={1.4}
                uStrength={3.8}
                brightness={0.65}
                grain="on"
                grainBlending={0.22}
                lightType="env"
                envPreset="city"
            />
        </ShaderGradientCanvas>
    )
}
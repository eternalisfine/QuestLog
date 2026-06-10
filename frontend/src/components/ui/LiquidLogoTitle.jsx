import { LiquidMetal } from '@paper-design/shaders-react'

export default function LiquidLogoTitle() {
    return (
        <div style={{ width:380, height:80, pointerEvents:'none' }}>
            <LiquidMetal
                image="/questlog-logo.svg"
                width={380} height={80}
                colorBack="#1c0a3e" colorTint="#c4a8ff"
                shape="diamond" repetition={1} softness={0.12}
                shiftRed={0.12} shiftBlue={0.22} distortion={0.07}
                contour={0.48} angle={30} speed={0.38} scale={0.92}
                fit="contain"
            />
        </div>
    )
}
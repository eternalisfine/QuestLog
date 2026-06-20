import { useEffect, useRef } from 'react'
import Button from '../../../lib/liquid-glass/button.js'
import '../../../lib/liquid-glass/glass.css'

export default function GlassButton({ label, onClick, type = 'pill', size = 18 }) {
    const mountRef = useRef(null)

    useEffect(() => {
        if (!mountRef.current) return
        const btn = new Button({ text: label, size, type, tintOpacity:0.3, warp:false, onClick })
        mountRef.current.appendChild(btn.element)
        return () => { if (btn.element.parentNode) btn.element.parentNode.removeChild(btn.element) }
    }, [label, onClick, type, size])

    return <div ref={mountRef} />
}
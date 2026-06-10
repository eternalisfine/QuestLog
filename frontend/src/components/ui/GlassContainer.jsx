import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import Container from '../../lib/liquid-glass/container.js'
import '../../lib/liquid-glass/glass.css'

export default function GlassContainer({ children, borderRadius = 28, tintOpacity = 0.22, style = {} }) {
    const mountRef = useRef(null)
    const innerRef = useRef(null)
    const [ready, setReady] = useState(false)

    useEffect(() => {
        if (!mountRef.current) return
        const glass = new Container({ borderRadius, tintOpacity, type:'rounded' })
        mountRef.current.appendChild(glass.element)

        const inner = document.createElement('div')
        inner.style.cssText = 'position:absolute; inset:0; z-index:10; display:flex; flex-direction:column; pointer-events:auto; padding:2rem;'
        glass.element.style.position = 'relative'
        glass.element.appendChild(inner)
        innerRef.current = inner
        setReady(true)

        return () => {
            if (glass.element.parentNode) glass.element.parentNode.removeChild(glass.element)
                setReady(false)
        }
    }, [borderRadius, tintOpacity])

    return (
        <div ref={mountRef} style={{ position:'relative', ...style }}>
            {ready && innerRef.current ? createPortal(children, innerRef.current) : null}
        </div>
    )
}
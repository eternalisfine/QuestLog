import './GlassPanel.css'

export default function GlassPanel({ children, className = '', style = {}, as: Tag = 'div' }) {
    return <Tag className={`glass-panel ${className}`} style={style}>{children}</Tag>
}
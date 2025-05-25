import { useNavigate } from 'react-router-dom'
import '../css/Scan_button.css'

export default function ToScan({active, onChange}) {
    const navigate = useNavigate()
    return (
    <div className="button-container">
        <button className="scan-button" onClick={() => navigate('/to_scan', {replace: false})}>ПРИСТУПИТЬ К СКАНИРОВАНИЮ</button>
    </div>
    )
}
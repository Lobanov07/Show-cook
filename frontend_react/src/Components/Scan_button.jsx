import '../css/Scan_button.css'

export default function ToScan({active, onChange}) {
    return (
    <div className="button-container">
        <button className="scan-button" isActive={active === 'Scan'}
                onClick={() => onChange('Scan')}>ПРИСТУПИТЬ К СКАНИРОВАНИЮ</button>
    </div>
    )
}
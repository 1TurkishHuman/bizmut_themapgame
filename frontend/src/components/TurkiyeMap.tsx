import React from 'react';
import './TurkiyeMap.css';

interface TurkiyeMapProps {
    onCityClick: (plateCode: number, cityName: string) => void;
    highlightedPlate?: number | null;
    statusMap?: Record<number, 'correct' | 'wrong'>;
}

//81 il svg
export const TurkiyeMap: React.FC<TurkiyeMapProps> = ({
    onCityClick,
    highlightedPlate,
    statusMap = {}
}) => {
    return (
        <div className="turkey-map-container">
            <svg
                viewBox="0 0 1000 450"
                className="turkey-svg"
                xmlns="http://www.w3.org/2000/svg"
            >
                <rect width="1000" height="450" fill="#ffececff" rx="12" />

                {/*test amacli*/}
                <g id="turkey-provinces">
                    <path
                        id="TR06"
                        className={`city-path ${highlightedPlate === 6 ? 'highlighted' : ''} ${statusMap[6] || ''}`}
                        d="M450,180 L520,180 L530,240 L440,240 Z"
                        onClick={() => onCityClick(6, 'Ankara')}
                    >
                        <title>06 - Ankara</title>
                    </path>
                    <text x="470" y="215" fontSize="12" fill="#440214" pointerEvents="none">Ankara</text>

                    <path
                        id="TR34"
                        className={`city-path ${highlightedPlate === 34 ? 'highlighted' : ''} ${statusMap[34] || ''}`}
                        d="M260,110 L310,100 L320,140 L270,145 Z"
                        onClick={() => onCityClick(34, 'İstanbul')}
                    >
                        <title>34 - İstanbul</title>
                    </path>
                    <text x="275" y="130" fontSize="11" fill="#440214" pointerEvents="none">İstanbul</text>

                    <path
                        id="TR35"
                        className={`city-path ${highlightedPlate === 35 ? 'highlighted' : ''} ${statusMap[35] || ''}`}
                        d="M170,220 L210,210 L220,280 L180,285 Z"
                        onClick={() => onCityClick(35, 'İzmir')}
                    >
                        <title>35 - İzmir</title>
                    </path>
                    <text x="185" y="255" fontSize="11" fill="#440214" pointerEvents="none">İzmir</text>
                </g>
            </svg>
        </div>
    );
};
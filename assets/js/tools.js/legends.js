// legends.js

export function createSTLegendSVG() {
    return `
        <svg width="120" height="360" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="15" font-size="12" font-family="Arial">Tendencia (%/año)</text>
            <rect x="0" y="25" width="20" height="15" style="fill:#FF0000" />
            <text x="25" y="37" font-size="10" font-family="Arial"><= -10</text>

            <rect x="0" y="40" width="20" height="15" style="fill:#FF0303" />
            <text x="25" y="52" font-size="10" font-family="Arial">-9 - -8</text>

            <rect x="0" y="55" width="20" height="15" style="fill:#FF1E1F" />
            <text x="25" y="67" font-size="10" font-family="Arial">-8 - -7</text>

            <rect x="0" y="70" width="20" height="15" style="fill:#FE393A" />
            <text x="25" y="82" font-size="10" font-family="Arial">-7 - -6</text>

            <rect x="0" y="85" width="20" height="15" style="fill:#FE5456" />
            <text x="25" y="97" font-size="10" font-family="Arial">-6 - -5</text>

            <rect x="0" y="100" width="20" height="15" style="fill:#FD6F72" />
            <text x="25" y="112" font-size="10" font-family="Arial">-5 - -4</text>

            <rect x="0" y="115" width="20" height="15" style="fill:#FD8B8D" />
            <text x="25" y="127" font-size="10" font-family="Arial">-4 - -3</text>

            <rect x="0" y="130" width="20" height="15" style="fill:#FCA6A9" />
            <text x="25" y="142" font-size="10" font-family="Arial">-3 - -2</text>

            <rect x="0" y="145" width="20" height="15" style="fill:#FCC1C5" />
            <text x="25" y="157" font-size="10" font-family="Arial">-2 - -1</text>

            <rect x="0" y="160" width="20" height="15" style="fill:#FBDCE0" />
            <text x="25" y="172" font-size="10" font-family="Arial">-1 - 0</text>

            <rect x="0" y="175" width="20" height="15" style="fill:#FBF7FC" />
            <text x="25" y="187" font-size="10" font-family="Arial">0 - 1</text>

            <rect x="0" y="190" width="20" height="15" style="fill:#DFDEFC" />
            <text x="25" y="202" font-size="10" font-family="Arial">1 - 2</text>

            <rect x="0" y="205" width="20" height="15" style="fill:#C4C4FD" />
            <text x="25" y="217" font-size="10" font-family="Arial">2 - 3</text>

            <rect x="0" y="220" width="20" height="15" style="fill:#A8ABFD" />
            <text x="25" y="232" font-size="10" font-family="Arial">3 - 4</text>

            <rect x="0" y="235" width="20" height="15" style="fill:#8D92FD" />
            <text x="25" y="247" font-size="10" font-family="Arial">4 - 5</text>

            <rect x="0" y="250" width="20" height="15" style="fill:#7178FE" />
            <text x="25" y="262" font-size="10" font-family="Arial">5 - 6</text>

            <rect x="0" y="265" width="20" height="15" style="fill:#565FFE" />
            <text x="25" y="277" font-size="10" font-family="Arial">6 - 7</text>

            <rect x="0" y="280" width="20" height="15" style="fill:#3A46FE" />
            <text x="25" y="292" font-size="10" font-family="Arial">7 - 8</text>

            <rect x="0" y="295" width="20" height="15" style="fill:#1F2CFF" />
            <text x="25" y="307" font-size="10" font-family="Arial">8 - 9</text>

            <rect x="0" y="310" width="20" height="15" style="fill:#0313FF" />
            <text x="25" y="322" font-size="10" font-family="Arial">9 - 10</text>

            <rect x="0" y="325" width="20" height="15" style="fill:#0000FF" />
            <text x="25" y="337" font-size="10" font-family="Arial">> 10</text>
        </svg>
    `;
}

export function createSPLegendSVG() {
    return `
        <svg width="100" height="220" xmlns="http://www.w3.org/2000/svg">
            <text x="0" y="15" font-size="12" font-family="Arial">Nieve (%)</text>
            <rect x="0" y="25" width="20" height="20" style="fill:#004C99" />
            <text x="25" y="40" font-size="12" font-family="Arial">90 - 100</text>
            
            <rect x="0" y="45" width="20" height="20" style="fill:#006EB5" />
            <text x="25" y="60" font-size="12" font-family="Arial">80 - 90</text>

            <rect x="0" y="65" width="20" height="20" style="fill:#0084A8" />
            <text x="25" y="80" font-size="12" font-family="Arial">70 - 80</text>

            <rect x="0" y="85" width="20" height="20" style="fill:#00A884" />
            <text x="25" y="100" font-size="12" font-family="Arial">60 - 70</text>

            <rect x="0" y="105" width="20" height="20" style="fill:#70A800" />
            <text x="25" y="120" font-size="12" font-family="Arial">50 - 60</text>

            <rect x="0" y="125" width="20" height="20" style="fill:#E69800" />
            <text x="25" y="140" font-size="12" font-family="Arial">40 - 50</text>

            <rect x="0" y="145" width="20" height="20" style="fill:#FFAA00" />
            <text x="25" y="160" font-size="12" font-family="Arial">30 - 40</text>

            <rect x="0" y="165" width="20" height="20" style="fill:#FFD37F" />
            <text x="25" y="180" font-size="12" font-family="Arial">20 - 30</text>

            <rect x="0" y="185" width="20" height="20" style="fill:#FFEBBE" />
            <text x="25" y="200" font-size="12" font-family="Arial">10 - 20</text>

            <rect x="0" y="205" width="20" height="20" style="fill:#FFFFB4" />
            <text x="25" y="220" font-size="12" font-family="Arial">0 - 10</text>
        </svg>
    `;
}

"use client"
import { useState } from "react"

export default function LayoutPage() {

    const rows = 10;
    const cols = 5;

    // seatMap inicial vacío
    const [seatMap, setSeatMap] = useState(
        Array.from({ length: rows }, () =>
            Array.from({ length: cols }, () => "")
        )
    );

    const cycleType = (value) => {
        if (value === "") return "seat";      // pasa de vacío → asiento
        if (value === "seat") return "WC";    // asiento → WC
        if (value === "WC") return "aisle";   // WC → pasillo/vacío
        return "";                            // aisle → vacío
    };

    const handleCellClick = (r, c) => {
        setSeatMap(prev => {
            const copy = prev.map(row => [...row]);
            copy[r][c] = cycleType(copy[r][c]);
            return copy;
        });
    };

    const handleSeatNumberChange = (r, c, value) => {
        setSeatMap(prev => {
            const copy = prev.map(row => [...row]);
            copy[r][c] = value;
            return copy;
        });
    };

    const saveLayout = () => {
        console.log("Matriz final lista para enviar a MongoDB:");
        console.log(seatMap);
    };

    return (
        <div className="p-4">

            <h1 className="text-xl font-bold mb-4">Editor Layout Bus</h1>

            <div
                className="grid gap-2"
                style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}
            >
                {seatMap.map((row, r) =>
                    row.map((value, c) => (
                        <div
                            key={`${r}-${c}`}
                            className={`
                                border p-2 rounded text-center cursor-pointer
                                ${value === "WC"
                                    ? "bg-yellow-400"
                                    : value === "aisle" || value === ""
                                        ? "bg-gray-300"
                                        : "bg-blue-500 text-white"
                                }
                            `}
                            onClick={() => handleCellClick(r, c)}
                        >
                            {value === "seat" ? (
                                <input
                                    type="text"
                                    className="text-black w-full text-center"
                                    placeholder="#"
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) =>
                                        handleSeatNumberChange(r, c, e.target.value)
                                    }
                                />
                            ) : (
                                value || " "
                            )}
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={saveLayout}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
            >
                Guardar Layout
            </button>
        </div>
    );
}

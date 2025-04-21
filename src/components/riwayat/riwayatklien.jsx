import React, { useEffect, useState } from "react";
import Popup from "../popup/popupriwayat"; // Pastikan path sesuai
import "./riwayatklien.css";

const dummyRiwayat = [
    { id: 1, tanggal: "2024-01-15", dokter: "dr. Anisa", keluhan: "Pusing", hasil: "Hipertensi" },
    { id: 2, tanggal: "2024-02-12", dokter: "dr. Budi", keluhan: "Demam", hasil: "Influenza" },
];

const RiwayatPopup = ({ isOpen, onClose }) => {
    const [riwayat, setRiwayat] = useState([]);

    useEffect(() => {
        setRiwayat(dummyRiwayat); // Bisa diganti fetch API jika ada
    }, []);

    return (
        <Popup isOpen={isOpen} onClose={onClose} title="Riwayat Pemeriksaan">
            <div className="riwayat-popup-content">
                <table className="riwayat-table">
                    <thead>
                        <tr>
                            <th>Tanggal</th>
                            <th>Dokter</th>
                            <th>Keluhan</th>
                            <th>Hasil</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riwayat.map((r) => (
                            <tr key={r.id}>
                                <td>{r.tanggal}</td>
                                <td>{r.dokter}</td>
                                <td>{r.keluhan}</td>
                                <td>{r.hasil}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </Popup>
    );
};

export default RiwayatPopup;

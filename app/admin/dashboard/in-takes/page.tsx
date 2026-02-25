"use client"

import { NpIntakeManagement } from "./NpInTakeManagement"



export default function NpIntakePage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 font-poppins">NP Intakes</h1>
                <p className="text-gray-600">manage and review NP intakes</p>
            </div>

            <NpIntakeManagement />
        </div>
    )
}
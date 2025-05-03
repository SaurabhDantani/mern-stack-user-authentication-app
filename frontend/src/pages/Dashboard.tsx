import axios from "axios"
import { useEffect } from "react"
import { api } from "../apis";

export default function Dashboard() {
    useEffect(() => {
        async function fetchSession() {
            const res = await axios.get(api.sessions, { withCredentials: true });
            console.log(res.data);
        }

        fetchSession()
    }, [])
    return (
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
            Dashboard pages
        </h1>
    )
}
import Sidebar from "@/components/sidebar";
import Navbar from "@/components/navbar";

export const metadata = {
    title: "Dashboard",
    description: "Dashboard de gestión",
};

export default function DashboardLayout({ children }) {
    return (
        <>
            <main className="flex h-screen overflow-hidden w-full">
                <Sidebar />

                <div className="flex flex-col w-full">
                    <Navbar />
                    <div className="p-4 flex-1 overflow-y-scroll">
                        {children}
                    </div>
                </div>
            </main>
        </>
    );
}
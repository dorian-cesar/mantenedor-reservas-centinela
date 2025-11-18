import Sidebar from "@/components/sidebar";

export const metadata = {
    title: "Dashboard",
    description: "Dashboard de gestión",
};

export default function DashboardLayout({ children }) {
    return (
        <>
            <Sidebar />
            <main className="w-full">{children}</main>
        </>
    );
}